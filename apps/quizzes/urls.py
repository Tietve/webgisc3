"""
URL configuration for quizzes app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    QuizViewSet,
    QuizSubmissionView,
    QuizDeadlineView,
    QuizSubmissionReviewView
)

app_name = 'quizzes'

router = DefaultRouter()
router.register(r'', QuizViewSet, basename='quiz')

urlpatterns = [
    # Quiz deadline aggregation
    path('deadlines/', QuizDeadlineView.as_view(), name='quiz-deadlines'),

    # Quiz submission
    path('quiz_submissions/', QuizSubmissionView.as_view(), name='quiz-submission'),

    # Quiz submission review (teacher)
    path('quiz-submissions/<int:pk>/review/', QuizSubmissionReviewView.as_view(), name='quiz-submission-review'),

    # Quiz CRUD and actions (includes results action)
    path('', include(router.urls)),
]
