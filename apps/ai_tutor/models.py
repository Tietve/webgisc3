from django.conf import settings
from django.db import models


class AiConversation(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ai_conversations',
    )
    classroom = models.ForeignKey(
        'classrooms.Classroom',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ai_conversations',
    )
    lesson = models.ForeignKey(
        'lessons.Lesson',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ai_conversations',
    )
    quiz = models.ForeignKey(
        'quizzes.Quiz',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ai_conversations',
    )
    title = models.CharField(max_length=255, blank=True)
    grade_level = models.CharField(max_length=10)
    semester = models.CharField(max_length=10)
    textbook_series = models.CharField(max_length=50)
    module_code = models.CharField(max_length=30, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ai_conversations'
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['user', '-updated_at'], name='idx_ai_conv_user_updated'),
            models.Index(fields=['grade_level', 'semester', 'textbook_series'], name='idx_ai_conv_curriculum'),
        ]

    def __str__(self):
        return self.title or f'Conversation {self.pk}'


class AiMessage(models.Model):
    ROLE_CHOICES = [
        ('system', 'System'),
        ('user', 'User'),
        ('assistant', 'Assistant'),
    ]

    conversation = models.ForeignKey(
        AiConversation,
        on_delete=models.CASCADE,
        related_name='messages',
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    context_snapshot = models.JSONField(default=dict, blank=True)
    guardrail_flags = models.JSONField(default=list, blank=True)
    model_name = models.CharField(max_length=100, blank=True)
    provider_name = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_messages'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'created_at'], name='idx_ai_msg_conv_created'),
        ]

    def __str__(self):
        return f'{self.role} @ {self.created_at:%Y-%m-%d %H:%M:%S}'


class AiMessageFeedback(models.Model):
    message = models.ForeignKey(
        AiMessage,
        on_delete=models.CASCADE,
        related_name='feedback_entries',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ai_message_feedback',
    )
    rating = models.SmallIntegerField()
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_message_feedback'
        ordering = ['-created_at']
        unique_together = ('message', 'user')

    def __str__(self):
        return f'Feedback {self.rating} for message {self.message_id}'
