from django.contrib import admin

from .models import AiConversation, AiMessage, AiMessageFeedback


@admin.register(AiConversation)
class AiConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'title', 'grade_level', 'semester', 'textbook_series', 'updated_at')
    search_fields = ('title', 'user__email', 'module_code')
    list_filter = ('grade_level', 'semester', 'textbook_series')


@admin.register(AiMessage)
class AiMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'role', 'provider_name', 'model_name', 'created_at')
    search_fields = ('conversation__user__email', 'content')
    list_filter = ('role', 'provider_name', 'model_name')


@admin.register(AiMessageFeedback)
class AiMessageFeedbackAdmin(admin.ModelAdmin):
    list_display = ('id', 'message', 'user', 'rating', 'created_at')
    list_filter = ('rating',)
