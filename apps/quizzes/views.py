"""
Views for quiz and assessment system.
"""
from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiResponse
from apps.core.permissions import IsStudent
from .models import Quiz, QuizSubmission
from .serializers import (
    QuizListSerializer,
    QuizDetailSerializer,
    QuizSessionSerializer,
    QuizSubmissionCreateSerializer,
    QuizSubmissionSerializer,
    QuizQuestionSerializer
)


class QuizViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for managing quizzes.

    GET /api/v1/quizzes/ - List all quizzes
    GET /api/v1/quizzes/{id}/ - Get quiz details
    """
    queryset = Quiz.objects.all().prefetch_related('questions__answers')
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return QuizDetailSerializer
        return QuizListSerializer

    @extend_schema(
        summary="List all quizzes",
        description="Get a list of all available quizzes",
        responses={200: QuizListSerializer(many=True)},
        tags=['Quizzes']
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Get quiz details",
        description="Get full quiz with questions and answers",
        responses={200: QuizDetailSerializer},
        tags=['Quizzes']
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)


class QuizSessionView(generics.RetrieveAPIView):
    """
    GET /api/v1/classrooms/{class_id}/quiz_session/{quiz_id}/

    Get complete quiz session data including questions and map configuration.

    This endpoint provides all data needed to run a quiz session on the frontend.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = QuizSessionSerializer

    @extend_schema(
        summary="Get quiz session data",
        description="Get complete quiz data for a quiz session including questions and map config",
        responses={
            200: QuizSessionSerializer,
            404: OpenApiResponse(description="Quiz not found")
        },
        tags=['Quizzes']
    )
    def get(self, request, class_id, quiz_id):
        try:
            quiz = Quiz.objects.prefetch_related('questions__answers').get(
                id=quiz_id,
                classroom_id=class_id
            )
        except Quiz.DoesNotExist:
            return Response(
                {'error': {'code': 'NotFound', 'message': 'Quiz not found in this classroom.'}},
                status=status.HTTP_404_NOT_FOUND
            )

        # Prepare quiz session data
        questions_serializer = QuizQuestionSerializer(quiz.questions.all(), many=True)

        # Optional: Include map configuration if needed for spatial quizzes
        map_config = {
            'center': [16.0, 106.0],  # Vietnam center
            'zoom': 6,
            'basemap': 'OpenStreetMap'
        }

        data = {
            'quiz_id': quiz.id,
            'quiz_title': quiz.title,
            'questions': questions_serializer.data,
            'map_config': map_config
        }

        return Response(data)


class QuizSubmissionView(generics.CreateAPIView):
    """
    POST /api/v1/quiz_submissions/

    Submit quiz answers and get score.

    Request Body:
    {
        "quiz_id": 1,
        "answers": {
            "1": "5",  // question_id: answer_id
            "2": "8"
        }
    }

    Response (200 OK):
    {
        "submission_id": 123,
        "score": 80,
        "quiz_title": "Geography Quiz",
        "submitted_at": "2024-01-01T00:00:00Z"
    }
    """
    serializer_class = QuizSubmissionCreateSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    @extend_schema(
        summary="Submit quiz answers",
        description="Submit student answers for a quiz and receive score",
        request=QuizSubmissionCreateSerializer,
        responses={
            201: QuizSubmissionSerializer,
            400: OpenApiResponse(description="Validation error")
        },
        tags=['Quizzes']
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        submission = serializer.save()

        # Return submission details
        response_data = {
            'submission_id': submission.id,
            'score': submission.score,
            'quiz_title': submission.quiz.title,
            'submitted_at': submission.submitted_at
        }

        return Response(response_data, status=status.HTTP_201_CREATED)
