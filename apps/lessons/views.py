"""
Views for interactive lesson system.
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter
from .models import Lesson
from .serializers import LessonListSerializer, LessonDetailSerializer


class LessonViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for retrieving interactive lessons.

    GET /api/v1/lessons/ - List all available lessons
    GET /api/v1/lessons/{id}/ - Get full lesson with all steps and map actions

    Read-only endpoint for all authenticated users.
    """
    queryset = Lesson.objects.all().prefetch_related('steps__map_action', 'layers', 'quizzes')
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset().filter(is_published=True)
        params = self.request.query_params

        if params.get('grade_level'):
            queryset = queryset.filter(grade_level=params['grade_level'])
        if params.get('semester'):
            queryset = queryset.filter(semester=params['semester'])
        if params.get('textbook_series'):
            queryset = queryset.filter(textbook_series=params['textbook_series'])
        if params.get('module_code'):
            queryset = queryset.filter(module_code=params['module_code'])
        if params.get('lesson_type'):
            queryset = queryset.filter(lesson_type=params['lesson_type'])

        return queryset

    def get_serializer_class(self):
        """
        Return different serializers for list and detail views.
        """
        if self.action == 'retrieve':
            return LessonDetailSerializer
        return LessonListSerializer

    @extend_schema(
        summary="List all lessons",
        description="Get a list of all available interactive lessons",
        parameters=[
            OpenApiParameter(name='grade_level', type=str, required=False),
            OpenApiParameter(name='semester', type=str, required=False),
            OpenApiParameter(name='textbook_series', type=str, required=False),
            OpenApiParameter(name='module_code', type=str, required=False),
            OpenApiParameter(name='lesson_type', type=str, required=False),
        ],
        responses={200: LessonListSerializer(many=True)},
        tags=['Lessons']
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Get lesson details",
        description="Get full lesson with all steps and map actions for interactive playback",
        responses={200: LessonDetailSerializer},
        tags=['Lessons']
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
