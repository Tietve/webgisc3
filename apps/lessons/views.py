"""
Views for interactive lesson system.
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from .models import Lesson
from .serializers import LessonListSerializer, LessonDetailSerializer


class LessonViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for retrieving interactive lessons.

    GET /api/v1/lessons/ - List all available lessons
    GET /api/v1/lessons/{id}/ - Get full lesson with all steps and map actions

    Read-only endpoint for all authenticated users.
    """
    queryset = Lesson.objects.all().prefetch_related('steps__map_action')
    permission_classes = [IsAuthenticated]

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
