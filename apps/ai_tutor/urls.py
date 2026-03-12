from django.urls import path

from .views import (
    AiConversationDetailView,
    AiConversationListView,
    AiMessageFeedbackView,
    AiTutorRespondView,
)

app_name = 'ai_tutor'

urlpatterns = [
    path('respond/', AiTutorRespondView.as_view(), name='respond'),
    path('conversations/', AiConversationListView.as_view(), name='conversation-list'),
    path('conversations/<int:pk>/', AiConversationDetailView.as_view(), name='conversation-detail'),
    path('messages/<int:pk>/feedback/', AiMessageFeedbackView.as_view(), name='message-feedback'),
]
