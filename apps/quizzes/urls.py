"""
URL configuration for quizzes app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuizViewSet, QuizSubmissionView

app_name = 'quizzes'

router = DefaultRouter()
router.register(r'', QuizViewSet, basename='quiz')

urlpatterns = [
    # Quiz submission
    path('quiz_submissions/', QuizSubmissionView.as_view(), name='quiz-submission'),

    # Quiz CRUD
    path('', include(router.urls)),
]
