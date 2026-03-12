import logging

from django.db import transaction
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AiConversation, AiMessage, AiMessageFeedback
from .providers import AiProviderClient, AiProviderError
from .serializers import (
    AiConversationDetailSerializer,
    AiConversationListSerializer,
    AiMessageFeedbackCreateSerializer,
    AiMessageFeedbackSerializer,
    AiTutorRespondSerializer,
)
from .services import (
    AiTutorContextBuilder,
    AiTutorContextError,
    build_followups,
    build_map_actions,
    build_prompt,
    normalize_assistant_message,
)


logger = logging.getLogger(__name__)


class AiTutorRespondView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=AiTutorRespondSerializer)
    def post(self, request):
        serializer = AiTutorRespondSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        context_builder = AiTutorContextBuilder(request.user)
        try:
            lesson, quiz, classroom, used_context = context_builder.build(payload)
        except AiTutorContextError as exc:
            logger.warning('AI Tutor context rejected for user=%s: %s', request.user.id, exc)
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        conversation = self._get_or_create_conversation(request.user, payload, lesson, quiz, classroom)
        provider = AiProviderClient()
        prompt_messages = build_prompt(payload['message'], used_context)
        guardrail_flags = ['curriculum_locked', 'grounded_context_only']

        try:
            assistant_message = provider.chat(prompt_messages)
        except AiProviderError as exc:
            logger.exception('AI Tutor provider error for user=%s conversation=%s', request.user.id, conversation.id)
            return Response({'detail': str(exc)}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception:
            logger.exception('AI Tutor unexpected provider failure for user=%s conversation=%s', request.user.id, conversation.id)
            return Response({'detail': 'AI provider failed unexpectedly.'}, status=status.HTTP_502_BAD_GATEWAY)

        assistant_message = normalize_assistant_message(assistant_message)

        with transaction.atomic():
            AiMessage.objects.create(
                conversation=conversation,
                role='user',
                content=payload['message'],
                context_snapshot=used_context,
                guardrail_flags=guardrail_flags,
                model_name=provider.model,
                provider_name=provider.provider_name,
            )
            assistant = AiMessage.objects.create(
                conversation=conversation,
                role='assistant',
                content=assistant_message,
                context_snapshot=used_context,
                guardrail_flags=guardrail_flags,
                model_name=provider.model,
                provider_name=provider.provider_name,
            )
            conversation.title = conversation.title or payload['message'][:80]
            conversation.save(update_fields=['title', 'updated_at'])

        map_actions = build_map_actions(payload['message'], used_context)

        return Response(
            {
                'conversation_id': conversation.id,
                'assistant_message': assistant.content,
                'used_context': used_context,
                'guardrail_flags': guardrail_flags,
                'suggested_followups': build_followups(used_context),
                'map_actions': map_actions,
                'message_id': assistant.id,
            },
            status=status.HTTP_200_OK,
        )

    def _get_or_create_conversation(self, user, payload, lesson, quiz, classroom):
        conversation_id = payload.get('conversation_id')
        if conversation_id:
            return get_object_or_404(AiConversation, id=conversation_id, user=user)

        return AiConversation.objects.create(
            user=user,
            lesson=lesson,
            quiz=quiz,
            classroom=classroom,
            title=payload['message'][:80],
            grade_level=payload['grade_level'],
            semester=payload['semester'],
            textbook_series=payload['textbook_series'],
            module_code=payload.get('module_code', ''),
        )


class AiConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = AiConversation.objects.filter(user=request.user).prefetch_related('messages')
        serializer = AiConversationListSerializer(queryset, many=True)
        return Response(serializer.data)


class AiConversationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        conversation = get_object_or_404(
            AiConversation.objects.filter(user=request.user).prefetch_related('messages'),
            pk=pk,
        )
        serializer = AiConversationDetailSerializer(conversation)
        return Response(serializer.data)


class AiMessageFeedbackView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=AiMessageFeedbackCreateSerializer, responses=AiMessageFeedbackSerializer)
    def post(self, request, pk):
        serializer = AiMessageFeedbackCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = AiMessage.objects.filter(conversation__user=request.user, id=pk, role='assistant').first()
        if not message:
            return Response({'detail': 'Message not found.'}, status=status.HTTP_404_NOT_FOUND)

        feedback, _ = AiMessageFeedback.objects.update_or_create(
            message=message,
            user=request.user,
            defaults=serializer.validated_data,
        )
        return Response(AiMessageFeedbackSerializer(feedback).data)
