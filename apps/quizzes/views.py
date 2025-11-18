"""
Views for quiz and assessment system.
"""
from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db.models import Count, Q, Prefetch
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from apps.core.permissions import IsStudent, IsTeacher
from apps.classrooms.models import Classroom
from .models import Quiz, QuizSubmission
from .serializers import (
    QuizListSerializer,
    QuizDetailSerializer,
    QuizSessionSerializer,
    QuizSubmissionCreateSerializer,
    QuizSubmissionSerializer,
    QuizQuestionSerializer,
    QuizDeadlineSerializer,
    QuizSubmissionReviewSerializer,
    QuizResultsSerializer
)


class QuizViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for managing quizzes.

    GET /api/v1/quizzes/ - List all quizzes
    GET /api/v1/quizzes/{id}/ - Get quiz details
    """
    queryset = Quiz.objects.all().prefetch_related('questions__answers')
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return QuizDetailSerializer
        return QuizListSerializer

    @extend_schema(
        summary="List all quizzes",
        description="Get a list of all available quizzes",
        responses={200: QuizListSerializer(many=True)},
        tags=['Quizzes']
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Get quiz details",
        description="Get full quiz with questions and answers",
        responses={200: QuizDetailSerializer},
        tags=['Quizzes']
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Get quiz results (teacher only)",
        description="Get all submissions for a quiz with student scores and review status",
        responses={
            200: QuizResultsSerializer(many=True),
            403: OpenApiResponse(description="Only teachers can view results")
        },
        tags=['Quizzes']
    )
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsTeacher])
    def results(self, request, pk=None):
        """
        Get all quiz submissions for teachers.
        Shows all students with their scores and review status.
        """
        quiz = self.get_object()

        # Verify teacher owns the classroom
        if not quiz.classroom:
            return Response(
                {'error': 'Quiz is not assigned to a classroom'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if quiz.classroom.teacher != request.user:
            return Response(
                {'error': 'You do not have permission to view these results'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get all submissions for this quiz
        submissions = quiz.submissions.all().select_related('student').order_by('-submitted_at')

        serializer = QuizResultsSerializer(submissions, many=True)
        return Response({
            'quiz_id': quiz.id,
            'quiz_title': quiz.title,
            'total_submissions': submissions.count(),
            'submissions': serializer.data
        })


class QuizSessionView(generics.RetrieveAPIView):
    """
    GET /api/v1/classrooms/{class_id}/quiz_session/{quiz_id}/

    Get complete quiz session data including questions and map configuration.

    This endpoint provides all data needed to run a quiz session on the frontend.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = QuizSessionSerializer

    @extend_schema(
        summary="Get quiz session data",
        description="Get complete quiz data for a quiz session including questions and map config",
        responses={
            200: QuizSessionSerializer,
            404: OpenApiResponse(description="Quiz not found")
        },
        tags=['Quizzes']
    )
    def get(self, request, class_id, quiz_id):
        try:
            quiz = Quiz.objects.prefetch_related('questions__answers').get(
                id=quiz_id,
                classroom_id=class_id
            )
        except Quiz.DoesNotExist:
            return Response(
                {'error': {'code': 'NotFound', 'message': 'Quiz not found in this classroom.'}},
                status=status.HTTP_404_NOT_FOUND
            )

        # Prepare quiz session data
        questions_serializer = QuizQuestionSerializer(quiz.questions.all(), many=True)

        # Optional: Include map configuration if needed for spatial quizzes
        map_config = {
            'center': [16.0, 106.0],  # Vietnam center
            'zoom': 6,
            'basemap': 'OpenStreetMap'
        }

        data = {
            'quiz_id': quiz.id,
            'quiz_title': quiz.title,
            'questions': questions_serializer.data,
            'map_config': map_config
        }

        return Response(data)


class QuizSubmissionView(generics.CreateAPIView):
    """
    POST /api/v1/quiz_submissions/

    Submit quiz answers and get score.

    Request Body:
    {
        "quiz_id": 1,
        "answers": {
            "1": "5",  // question_id: answer_id
            "2": "8"
        }
    }

    Response (200 OK):
    {
        "submission_id": 123,
        "score": 80,
        "quiz_title": "Geography Quiz",
        "submitted_at": "2024-01-01T00:00:00Z"
    }
    """
    serializer_class = QuizSubmissionCreateSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    @extend_schema(
        summary="Submit quiz answers",
        description="Submit student answers for a quiz and receive score",
        request=QuizSubmissionCreateSerializer,
        responses={
            201: QuizSubmissionSerializer,
            400: OpenApiResponse(description="Validation error")
        },
        tags=['Quizzes']
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        submission = serializer.save()

        # Return submission details
        response_data = {
            'submission_id': submission.id,
            'score': submission.score,
            'quiz_title': submission.quiz.title,
            'submitted_at': submission.submitted_at
        }

        return Response(response_data, status=status.HTTP_201_CREATED)


class QuizDeadlineView(APIView):
    """
    GET /api/v1/quizzes/deadlines/

    Aggregate all upcoming quiz deadlines for authenticated user.
    - Students: see quizzes from enrolled classrooms
    - Teachers: see quizzes from owned classrooms with stats

    Query Parameters:
    - status: Filter by deadline_status (upcoming, due_soon, overdue)
    - classroom_id: Filter by specific classroom
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get quiz deadlines",
        description="Get all quiz deadlines based on user role (student sees enrolled, teacher sees owned)",
        parameters=[
            OpenApiParameter(
                name='status',
                type=str,
                description='Filter by deadline status: upcoming, upcoming_soon, due_soon, overdue',
                required=False
            ),
            OpenApiParameter(
                name='classroom_id',
                type=int,
                description='Filter by specific classroom ID',
                required=False
            ),
        ],
        responses={200: QuizDeadlineSerializer(many=True)},
        tags=['Quizzes']
    )
    def get(self, request):
        user = request.user
        status_filter = request.query_params.get('status')
        classroom_id = request.query_params.get('classroom_id')

        # Build base queryset based on user role
        if user.role == 'teacher':
            # Teachers see quizzes from their owned classrooms
            owned_classrooms = Classroom.objects.filter(teacher=user)
            quizzes = Quiz.objects.filter(
                classroom__in=owned_classrooms,
                due_date__isnull=False
            ).select_related('classroom').prefetch_related(
                Prefetch('submissions', queryset=QuizSubmission.objects.select_related('student'))
            ).annotate(
                submission_count=Count('submissions'),
                pending_review_count=Count('submissions', filter=Q(submissions__is_reviewed=False))
            )
        else:
            # Students see quizzes from enrolled classrooms
            from apps.classrooms.models import Enrollment
            enrolled_classroom_ids = Enrollment.objects.filter(
                student=user
            ).values_list('classroom_id', flat=True)
            enrolled_classrooms = Classroom.objects.filter(
                id__in=enrolled_classroom_ids
            ).distinct()
            quizzes = Quiz.objects.filter(
                classroom__in=enrolled_classrooms,
                due_date__isnull=False
            ).select_related('classroom').prefetch_related(
                Prefetch(
                    'submissions',
                    queryset=QuizSubmission.objects.filter(student=user),
                    to_attr='user_submissions'
                )
            )

        # Apply filters
        if classroom_id:
            quizzes = quizzes.filter(classroom_id=classroom_id)

        # Serialize and filter by status if requested
        serializer = QuizDeadlineSerializer(quizzes, many=True, context={'request': request})
        data = serializer.data

        if status_filter:
            data = [q for q in data if q['deadline_status'] == status_filter]

        # For teachers, add submission stats
        if user.role == 'teacher':
            for i, quiz in enumerate(quizzes):
                if i < len(data):
                    data[i]['submission_count'] = quiz.submission_count
                    data[i]['pending_review_count'] = quiz.pending_review_count

        return Response(data)


class QuizSubmissionReviewView(APIView):
    """
    POST /api/v1/quiz-submissions/{id}/review/

    Teacher reviews and grades a quiz submission.
    Can adjust auto-calculated score and add feedback.
    """
    permission_classes = [IsAuthenticated, IsTeacher]

    @extend_schema(
        summary="Review quiz submission",
        description="Teacher reviews submission, adjusts score, and adds feedback",
        request=QuizSubmissionReviewSerializer,
        responses={
            200: QuizSubmissionSerializer,
            403: OpenApiResponse(description="Teacher does not own this classroom"),
            404: OpenApiResponse(description="Submission not found")
        },
        tags=['Quizzes']
    )
    def post(self, request, pk):
        try:
            submission = QuizSubmission.objects.select_related('quiz__classroom', 'student').get(pk=pk)
        except QuizSubmission.DoesNotExist:
            return Response(
                {'error': 'Submission not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Verify teacher owns the classroom
        if not submission.quiz.classroom:
            return Response(
                {'error': 'Quiz is not assigned to a classroom'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if submission.quiz.classroom.teacher != request.user:
            return Response(
                {'error': 'You do not have permission to review this submission'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Update submission with review
        serializer = QuizSubmissionReviewSerializer(submission, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Return updated submission
        result_serializer = QuizSubmissionSerializer(submission)
        return Response(result_serializer.data)
