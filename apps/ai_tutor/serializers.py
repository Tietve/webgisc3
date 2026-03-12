from rest_framework import serializers

from .models import AiConversation, AiMessage, AiMessageFeedback


class AiMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AiMessage
        fields = (
            'id',
            'role',
            'content',
            'context_snapshot',
            'guardrail_flags',
            'model_name',
            'provider_name',
            'created_at',
        )
        read_only_fields = fields


class AiConversationListSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = AiConversation
        fields = (
            'id',
            'title',
            'grade_level',
            'semester',
            'textbook_series',
            'module_code',
            'updated_at',
            'last_message',
        )
        read_only_fields = fields

    def get_last_message(self, obj):
        message = obj.messages.order_by('-created_at').first()
        if not message:
            return None
        return {
            'role': message.role,
            'content': message.content,
            'created_at': message.created_at,
        }


class AiConversationDetailSerializer(serializers.ModelSerializer):
    messages = AiMessageSerializer(many=True, read_only=True)

    class Meta:
        model = AiConversation
        fields = (
            'id',
            'title',
            'grade_level',
            'semester',
            'textbook_series',
            'module_code',
            'lesson_id',
            'quiz_id',
            'classroom_id',
            'updated_at',
            'messages',
        )
        read_only_fields = fields


class AiTutorRespondSerializer(serializers.Serializer):
    conversation_id = serializers.IntegerField(required=False, allow_null=True)
    message = serializers.CharField()
    lesson_id = serializers.IntegerField(required=False)
    quiz_id = serializers.IntegerField(required=False)
    classroom_id = serializers.IntegerField(required=False)
    lesson_step = serializers.IntegerField(required=False)
    active_layers = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True,
    )
    selected_feature = serializers.JSONField(required=False)
    map_state = serializers.JSONField(required=False)
    question_context = serializers.JSONField(required=False)
    grade_level = serializers.CharField()
    semester = serializers.CharField()
    textbook_series = serializers.CharField()
    module_code = serializers.CharField(required=False, allow_blank=True)


class AiMessageFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = AiMessageFeedback
        fields = ('id', 'rating', 'note', 'created_at')
        read_only_fields = ('id', 'created_at')


class AiMessageFeedbackCreateSerializer(serializers.Serializer):
    rating = serializers.IntegerField(min_value=-1, max_value=1)
    note = serializers.CharField(required=False, allow_blank=True)
