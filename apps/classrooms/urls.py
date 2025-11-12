"""
URL configuration for classrooms app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import ClassroomViewSet, EnrollmentJoinView, AnnouncementViewSet
from apps.quizzes.views import QuizSessionView

app_name = 'classrooms'

router = DefaultRouter()
router.register(r'', ClassroomViewSet, basename='classroom')

# Nested router for announcements under classrooms
announcements_router = routers.NestedDefaultRouter(router, r'', lookup='classroom')
announcements_router.register(r'announcements', AnnouncementViewSet, basename='classroom-announcements')

urlpatterns = [
    # Enrollment
    path('enrollments/join/', EnrollmentJoinView.as_view(), name='enrollment-join'),

    # Quiz session endpoint (as per API spec)
    path('<int:class_id>/quiz_session/<int:quiz_id>/', QuizSessionView.as_view(), name='quiz-session'),

    # Classrooms and nested announcements
    path('', include(router.urls)),
    path('', include(announcements_router.urls)),
]
