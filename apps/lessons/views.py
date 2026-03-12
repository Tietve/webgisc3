"""
Views for interactive lesson system.
"""
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter
from apps.classrooms.models import Classroom, Enrollment, LessonProgress
from apps.classrooms.serializers import LessonProgressUpsertSerializer
from .models import Lesson
from .serializers import LessonListSerializer, LessonDetailSerializer, LessonProgressDetailSerializer


CURATED_MODULE_CODES = [
    'module-01', 'module-02', 'module-03', 'module-04', 'module-05', 'module-06'
]


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
        elif params.get('grade_level') == '10' and params.get('semester') == '1' and params.get('textbook_series') == 'canh-dieu':
            queryset = queryset.filter(module_code__in=CURATED_MODULE_CODES)
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

    @extend_schema(
        summary="Get lesson progress",
        description="Get current user's progress for this lesson in a classroom context",
        parameters=[OpenApiParameter(name='classroom_id', type=int, required=False)],
        responses={200: LessonProgressDetailSerializer},
        tags=['Lessons']
    )
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated], url_path='progress')
    def progress(self, request, pk=None):
        lesson = self.get_object()
        classroom_id = request.query_params.get('classroom_id')
        if not classroom_id:
            return Response({'detail': 'classroom_id is required for tracked progress.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            classroom = Classroom.objects.get(id=classroom_id, is_published=True)
        except Classroom.DoesNotExist:
            return Response({'detail': 'Classroom not found.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        if classroom.teacher != user and not Enrollment.objects.filter(classroom=classroom, student=user).exists():
            return Response({'detail': 'You do not have access to this classroom.'}, status=status.HTTP_403_FORBIDDEN)

        progress = LessonProgress.objects.filter(classroom=classroom, lesson=lesson, student=user).first()
        if not progress:
            return Response({
                'lesson': lesson.id,
                'classroom': classroom.id,
                'student': str(user.id),
                'current_step': 0,
                'progress_percent': 0,
                'status': 'not_started',
                'started_at': None,
                'last_viewed_at': None,
                'completed_at': None,
                'lesson_title': lesson.title,
            })

        serializer = LessonProgressDetailSerializer(progress)
        return Response(serializer.data)

    @extend_schema(
        summary="Update lesson progress",
        description="Create or update current user's lesson progress in a classroom",
        request=LessonProgressUpsertSerializer,
        responses={200: LessonProgressDetailSerializer},
        tags=['Lessons']
    )
    @progress.mapping.post
    def update_progress(self, request, pk=None):
        lesson = self.get_object()
        serializer = LessonProgressUpsertSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        classroom_id = serializer.validated_data.get('classroom_id')
        if not classroom_id:
            return Response({'detail': 'classroom_id is required for tracked progress.'}, status=status.HTTP_400_BAD_REQUEST)

        classroom = Classroom.objects.get(id=classroom_id)
        progress, _ = LessonProgress.objects.get_or_create(
            classroom=classroom,
            lesson=lesson,
            student=request.user,
            defaults={'started_at': timezone.now()}
        )

        progress.current_step = serializer.validated_data.get('current_step', progress.current_step)
        progress.progress_percent = serializer.validated_data.get('progress_percent', progress.progress_percent)
        progress.status = serializer.validated_data.get('status', progress.status)
        if not progress.started_at:
            progress.started_at = timezone.now()
        if progress.status == 'completed' and not progress.completed_at:
            progress.completed_at = timezone.now()
        progress.save()

        result = LessonProgressDetailSerializer(progress)
        return Response(result.data)
