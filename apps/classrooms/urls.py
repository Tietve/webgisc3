"""
URL configuration for classrooms app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import (
    ClassroomViewSet,
    EnrollmentJoinView,
    AnnouncementViewSet,
    AssignmentViewSet,
    SubmissionViewSet,
    GradeViewSet
)
from apps.quizzes.views import QuizSessionView

app_name = 'classrooms'

# Main router for classrooms
router = DefaultRouter()
router.register(r'', ClassroomViewSet, basename='classroom')

# Nested router for announcements under classrooms
announcements_router = routers.NestedDefaultRouter(router, r'', lookup='classroom')
announcements_router.register(r'announcements', AnnouncementViewSet, basename='classroom-announcements')

# Nested router for assignments under classrooms
assignments_router = routers.NestedDefaultRouter(router, r'', lookup='classroom')
assignments_router.register(r'assignments', AssignmentViewSet, basename='classroom-assignments')

# Standalone routers for submissions and grades
# (can be accessed independently or nested under assignments)
submissions_router = DefaultRouter()
submissions_router.register(r'submissions', SubmissionViewSet, basename='submission')

# Nested router for submissions under assignments
assignment_submissions_router = routers.NestedDefaultRouter(
    assignments_router, r'assignments', lookup='assignment'
)
assignment_submissions_router.register(r'submissions', SubmissionViewSet, basename='assignment-submissions')

# Nested router for grades under submissions
grades_router = routers.NestedDefaultRouter(
    submissions_router, r'submissions', lookup='submission'
)
grades_router.register(r'grade', GradeViewSet, basename='submission-grade')

urlpatterns = [
    # Enrollment
    path('enrollments/join/', EnrollmentJoinView.as_view(), name='enrollment-join'),

    # Quiz session endpoint (as per API spec)
    path('<int:class_id>/quiz_session/<int:quiz_id>/', QuizSessionView.as_view(), name='quiz-session'),

    # Classrooms and nested resources
    path('', include(router.urls)),
    path('', include(announcements_router.urls)),
    path('', include(assignments_router.urls)),
    path('', include(assignment_submissions_router.urls)),

    # Standalone submissions and grades
    path('', include(submissions_router.urls)),
    path('', include(grades_router.urls)),
]
