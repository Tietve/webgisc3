"""
URL configuration for classrooms app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClassroomViewSet, EnrollmentJoinView
from apps.quizzes.views import QuizSessionView

app_name = 'classrooms'

router = DefaultRouter()
router.register(r'', ClassroomViewSet, basename='classroom')

urlpatterns = [
    # Enrollment
    path('enrollments/join/', EnrollmentJoinView.as_view(), name='enrollment-join'),

    # Quiz session endpoint (as per API spec)
    path('<int:class_id>/quiz_session/<int:quiz_id>/', QuizSessionView.as_view(), name='quiz-session'),

    # Classrooms
    path('', include(router.urls)),
]
