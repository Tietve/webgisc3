"""
Views for classroom and enrollment management.
"""
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from django.shortcuts import get_object_or_404
from apps.core.permissions import IsTeacher, IsStudent, IsOwnerOrTeacher
from .models import Classroom, Enrollment, Announcement, Assignment, Submission, Grade
from .serializers import (
    ClassroomSerializer,
    ClassroomCreateSerializer,
    EnrollmentSerializer,
    EnrollmentCreateSerializer,
    StudentListSerializer,
    AnnouncementSerializer,
    AssignmentSerializer,
    AssignmentCreateSerializer,
    AssignmentListSerializer,
    SubmissionSerializer,
    SubmissionCreateSerializer,
    GradeSerializer,
    GradeCreateUpdateSerializer
)


class ClassroomViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing classrooms.

    Teachers can create, update, delete their own classrooms.
    GET /api/v1/classrooms/ - List all classrooms (teacher's own classrooms or student's enrolled classrooms)
    POST /api/v1/classrooms/ - Create a new classroom (teachers only)
    GET /api/v1/classrooms/{id}/ - Retrieve classroom details
    PUT/PATCH /api/v1/classrooms/{id}/ - Update classroom (teachers only)
    DELETE /api/v1/classrooms/{id}/ - Delete classroom (teachers only)
    GET /api/v1/classrooms/{id}/students/ - List students in the classroom
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return ClassroomCreateSerializer
        elif self.action == 'students':
            return StudentListSerializer
        return ClassroomSerializer

    def get_queryset(self):
        """
        Return classrooms for the current user:
        - Classrooms they created (as teacher/owner)
        - Classrooms they're enrolled in (as student/member)
        """
        user = self.request.user

        # Get classrooms where user is the teacher/owner
        owned_classrooms = Classroom.objects.filter(teacher=user)

        # Get classrooms where user is enrolled as a student/member
        enrolled_classroom_ids = Enrollment.objects.filter(
            student=user
        ).values_list('classroom_id', flat=True)
        enrolled_classrooms = Classroom.objects.filter(id__in=enrolled_classroom_ids)

        # Combine both (use union to avoid duplicates)
        return (owned_classrooms | enrolled_classrooms).distinct()

    @extend_schema(
        summary="List classrooms",
        description="List all classrooms (teacher's own or student's enrolled)",
        responses={200: ClassroomSerializer(many=True)},
        tags=['Classrooms']
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create a new classroom",
        description="Create a new classroom (any authenticated user can create)",
        request=ClassroomCreateSerializer,
        responses={
            201: ClassroomSerializer,
        },
        tags=['Classrooms']
    )
    def create(self, request, *args, **kwargs):
        # Any authenticated user can create a classroom
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        classroom = serializer.save()

        # Return full classroom data
        response_serializer = ClassroomSerializer(classroom)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        summary="Retrieve classroom details",
        description="Get details of a specific classroom",
        responses={200: ClassroomSerializer},
        tags=['Classrooms']
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="List students in classroom",
        description="Get list of students enrolled in the classroom (teachers only)",
        responses={
            200: StudentListSerializer(many=True),
            403: OpenApiResponse(description="Only teachers can view student lists")
        },
        tags=['Classrooms']
    )
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsTeacher])
    def students(self, request, pk=None):
        """
        GET /api/v1/classrooms/{id}/students/

        List all students enrolled in the classroom.
        """
        classroom = self.get_object()

        # Check if the teacher owns this classroom
        if classroom.teacher != request.user:
            return Response(
                {'error': {'code': 'PermissionDenied', 'message': 'You do not have permission to view this classroom.'}},
                status=status.HTTP_403_FORBIDDEN
            )

        enrollments = Enrollment.objects.filter(classroom=classroom).select_related('student')
        serializer = StudentListSerializer(enrollments, many=True)
        return Response(serializer.data)


class EnrollmentJoinView(generics.CreateAPIView):
    """
    POST /api/v1/enrollments/join/

    Endpoint to join a classroom using enrollment code (any authenticated user).

    Request Body:
    {
        "enrollment_code": "ABC12345"
    }

    Response (200 OK):
    {
        "message": "Successfully enrolled in classroom",
        "classroom": {...}
    }
    """
    serializer_class = EnrollmentCreateSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Join a classroom",
        description="Join a classroom using enrollment code (any authenticated user)",
        request=EnrollmentCreateSerializer,
        responses={
            201: OpenApiResponse(description="Successfully enrolled"),
            400: OpenApiResponse(description="Invalid enrollment code or already enrolled"),
        },
        tags=['Enrollments']
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        enrollment = serializer.save()

        return Response(
            {
                'message': 'Successfully enrolled in classroom',
                'classroom': ClassroomSerializer(enrollment.classroom).data
            },
            status=status.HTTP_201_CREATED
        )


class AnnouncementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing classroom announcements.

    List: GET /api/v1/classrooms/{classroom_id}/announcements/
    Create: POST /api/v1/classrooms/{classroom_id}/announcements/
    Retrieve: GET /api/v1/classrooms/{classroom_id}/announcements/{id}/
    Update: PUT/PATCH /api/v1/classrooms/{classroom_id}/announcements/{id}/
    Delete: DELETE /api/v1/classrooms/{classroom_id}/announcements/{id}/
    """
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Return announcements for a specific classroom.
        Users can see announcements if they are:
        - The classroom owner (teacher)
        - Enrolled in the classroom (student/member)
        """
        classroom_id = self.kwargs.get('classroom_pk')
        user = self.request.user

        # Check if user has access to this classroom
        classroom = Classroom.objects.filter(id=classroom_id).first()
        if not classroom:
            return Announcement.objects.none()

        # Check if user is owner or enrolled
        is_owner = classroom.teacher == user
        is_enrolled = Enrollment.objects.filter(classroom=classroom, student=user).exists()

        if is_owner or is_enrolled:
            return Announcement.objects.filter(classroom_id=classroom_id)

        return Announcement.objects.none()

    @extend_schema(
        summary="List announcements",
        description="List all announcements for a classroom",
        responses={200: AnnouncementSerializer(many=True)},
        tags=['Announcements']
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create announcement",
        description="Create a new announcement (classroom owner only)",
        request=AnnouncementSerializer,
        responses={201: AnnouncementSerializer},
        tags=['Announcements']
    )
    def create(self, request, *args, **kwargs):
        classroom_id = self.kwargs.get('classroom_pk')
        classroom = Classroom.objects.filter(id=classroom_id).first()

        if not classroom:
            return Response(
                {'error': 'Classroom not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Only classroom owner can create announcements
        if classroom.teacher != request.user:
            return Response(
                {'error': 'Only classroom owner can create announcements'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(classroom=classroom)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        summary="Update announcement",
        description="Update an announcement (author only)",
        request=AnnouncementSerializer,
        responses={200: AnnouncementSerializer},
        tags=['Announcements']
    )
    def update(self, request, *args, **kwargs):
        announcement = self.get_object()

        # Only author can update
        if announcement.author != request.user:
            return Response(
                {'error': 'Only the author can update this announcement'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Delete announcement",
        description="Delete an announcement (author only)",
        responses={204: None},
        tags=['Announcements']
    )
    def destroy(self, request, *args, **kwargs):
        announcement = self.get_object()

        # Only author can delete
        if announcement.author != request.user:
            return Response(
                {'error': 'Only the author can delete this announcement'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)


# ============================================================================
# Assignment Views
# ============================================================================

class AssignmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing assignments within classrooms.

    Nested under /api/v1/classrooms/{id}/assignments/

    Teachers can create, update, delete assignments in their classrooms.
    Students can view assignments in classrooms they're enrolled in.
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return AssignmentCreateSerializer
        elif self.action == 'list':
            return AssignmentListSerializer
        return AssignmentSerializer

    def get_queryset(self):
        """
        Return assignments for a specific classroom.
        User must be teacher (owner) or enrolled student.
        """
        classroom_id = self.kwargs.get('classroom_pk')
        user = self.request.user

        # Get classroom
        classroom = get_object_or_404(Classroom, id=classroom_id)

        # Check if user has access
        is_owner = classroom.teacher == user
        is_enrolled = Enrollment.objects.filter(classroom=classroom, student=user).exists()

        if not (is_owner or is_enrolled):
            return Assignment.objects.none()

        return Assignment.objects.filter(classroom_id=classroom_id).select_related(
            'classroom', 'created_by'
        ).order_by('-due_date')

    @extend_schema(
        summary="List assignments",
        description="List all assignments in a classroom",
        responses={200: AssignmentListSerializer(many=True)},
        tags=['Assignments']
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create assignment",
        description="Create a new assignment (teachers only)",
        request=AssignmentCreateSerializer,
        responses={201: AssignmentSerializer},
        tags=['Assignments']
    )
    def create(self, request, *args, **kwargs):
        classroom_id = self.kwargs.get('classroom_pk')
        classroom = get_object_or_404(Classroom, id=classroom_id)

        # Only classroom teacher can create assignments
        if classroom.teacher != request.user:
            return Response(
                {'error': 'Only the classroom teacher can create assignments'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(
            data=request.data,
            context={'request': request, 'classroom_id': classroom_id}
        )
        serializer.is_valid(raise_exception=True)
        assignment = serializer.save()

        # Return full assignment data
        response_serializer = AssignmentSerializer(assignment, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        summary="Retrieve assignment",
        description="Get details of a specific assignment",
        responses={200: AssignmentSerializer},
        tags=['Assignments']
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update assignment",
        description="Update an assignment (teachers only)",
        request=AssignmentSerializer,
        responses={200: AssignmentSerializer},
        tags=['Assignments']
    )
    def update(self, request, *args, **kwargs):
        assignment = self.get_object()

        # Only classroom teacher can update
        if assignment.classroom.teacher != request.user:
            return Response(
                {'error': 'Only the classroom teacher can update this assignment'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Delete assignment",
        description="Delete an assignment (teachers only)",
        responses={204: None},
        tags=['Assignments']
    )
    def destroy(self, request, *args, **kwargs):
        assignment = self.get_object()

        # Only classroom teacher can delete
        if assignment.classroom.teacher != request.user:
            return Response(
                {'error': 'Only the classroom teacher can delete this assignment'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)

    @extend_schema(
        summary="Get submission status",
        description="Get current user's submission status for this assignment",
        responses={200: OpenApiResponse(description="Submission status")},
        tags=['Assignments']
    )
    @action(detail=True, methods=['get'])
    def submission_status(self, request, classroom_pk=None, pk=None):
        """
        GET /api/v1/classrooms/{id}/assignments/{aid}/submission_status/

        Returns whether the current user has submitted this assignment.
        """
        assignment = self.get_object()
        user = request.user

        try:
            submission = Submission.objects.get(assignment=assignment, student=user)
            return Response({
                'submitted': True,
                'submission_id': submission.id,
                'submitted_at': submission.submitted_at,
                'is_late': submission.is_late
            })
        except Submission.DoesNotExist:
            return Response({
                'submitted': False,
                'submission_id': None
            })


# ============================================================================
# Submission Views
# ============================================================================

class SubmissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing assignment submissions.

    Students can submit assignments.
    Teachers can view all submissions for their assignments.
    Students can view their own submissions.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = SubmissionSerializer

    def get_queryset(self):
        """
        Return submissions based on user role and context.

        - Teachers see all submissions for assignments in their classrooms
        - Students see only their own submissions
        """
        user = self.request.user
        assignment_id = self.kwargs.get('assignment_pk')

        if assignment_id:
            # Nested route: /assignments/{id}/submissions/
            assignment = get_object_or_404(Assignment, id=assignment_id)

            # Check if user is teacher of this classroom
            if assignment.classroom.teacher == user:
                return Submission.objects.filter(assignment=assignment).select_related(
                    'assignment', 'student'
                )
            else:
                # Students see only their own submission
                return Submission.objects.filter(
                    assignment=assignment, student=user
                ).select_related('assignment', 'student')
        else:
            # Standalone route: /submissions/
            if user.role == 'teacher':
                # Teachers see submissions for their assignments
                teacher_assignments = Assignment.objects.filter(
                    classroom__teacher=user
                ).values_list('id', flat=True)
                return Submission.objects.filter(
                    assignment_id__in=teacher_assignments
                ).select_related('assignment', 'student')
            else:
                # Students see their own submissions
                return Submission.objects.filter(student=user).select_related(
                    'assignment', 'student'
                )

    @extend_schema(
        summary="List submissions",
        description="List submissions (teachers: all, students: own)",
        responses={200: SubmissionSerializer(many=True)},
        tags=['Submissions']
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Submit assignment",
        description="Submit an assignment (students only)",
        request=SubmissionCreateSerializer,
        responses={201: SubmissionSerializer},
        tags=['Submissions']
    )
    @action(detail=False, methods=['post'], url_path='submit')
    def submit_assignment(self, request, assignment_pk=None):
        """
        POST /api/v1/assignments/{id}/submissions/submit/

        Submit an assignment with text answer and/or file upload.
        """
        assignment = get_object_or_404(Assignment, id=assignment_pk)

        serializer = SubmissionCreateSerializer(
            data=request.data,
            context={'request': request, 'assignment': assignment}
        )
        serializer.is_valid(raise_exception=True)
        submission = serializer.save()

        # Return full submission data
        response_serializer = SubmissionSerializer(submission, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        summary="Retrieve submission",
        description="Get details of a specific submission",
        responses={200: SubmissionSerializer},
        tags=['Submissions']
    )
    def retrieve(self, request, *args, **kwargs):
        submission = self.get_object()
        user = request.user

        # Check permission: owner or teacher
        is_owner = submission.student == user
        is_teacher = submission.assignment.classroom.teacher == user

        if not (is_owner or is_teacher):
            return Response(
                {'error': 'You do not have permission to view this submission'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().retrieve(request, *args, **kwargs)


# ============================================================================
# Grade Views
# ============================================================================

class GradeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing grades.

    Teachers can create and update grades.
    Students can view published grades.
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return GradeCreateUpdateSerializer
        return GradeSerializer

    def get_queryset(self):
        """
        Return grades based on user role.

        - Teachers see all grades for submissions in their classrooms
        - Students see only published grades for their own submissions
        """
        user = self.request.user
        submission_id = self.kwargs.get('submission_pk')

        if submission_id:
            # Nested route: /submissions/{id}/grade/
            submission = get_object_or_404(Submission, id=submission_id)

            # Check if user is teacher or owner
            is_teacher = submission.assignment.classroom.teacher == user
            is_owner = submission.student == user

            if is_teacher:
                return Grade.objects.filter(submission=submission)
            elif is_owner:
                return Grade.objects.filter(submission=submission, is_published=True)
            else:
                return Grade.objects.none()
        else:
            # Standalone route
            if user.role == 'teacher':
                teacher_assignments = Assignment.objects.filter(
                    classroom__teacher=user
                ).values_list('id', flat=True)
                teacher_submissions = Submission.objects.filter(
                    assignment_id__in=teacher_assignments
                ).values_list('id', flat=True)
                return Grade.objects.filter(submission_id__in=teacher_submissions)
            else:
                return Grade.objects.filter(
                    submission__student=user, is_published=True
                )

    @extend_schema(
        summary="Create grade",
        description="Create a grade for a submission (teachers only)",
        request=GradeCreateUpdateSerializer,
        responses={201: GradeSerializer},
        tags=['Grades']
    )
    def create(self, request, submission_pk=None, *args, **kwargs):
        """
        POST /api/v1/submissions/{id}/grade/

        Create a grade for a submission.
        """
        submission = get_object_or_404(Submission, id=submission_pk)

        # Only classroom teacher can grade
        if submission.assignment.classroom.teacher != request.user:
            return Response(
                {'error': 'Only the classroom teacher can grade this submission'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if grade already exists
        if hasattr(submission, 'grade'):
            return Response(
                {'error': 'This submission has already been graded. Use PUT to update.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(
            data=request.data,
            context={'request': request, 'submission': submission}
        )
        serializer.is_valid(raise_exception=True)
        grade = serializer.save()

        # Return full grade data
        response_serializer = GradeSerializer(grade, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        summary="Update grade",
        description="Update a grade (teachers only)",
        request=GradeCreateUpdateSerializer,
        responses={200: GradeSerializer},
        tags=['Grades']
    )
    def update(self, request, submission_pk=None, *args, **kwargs):
        """
        PUT /api/v1/submissions/{id}/grade/

        Update an existing grade.
        """
        submission = get_object_or_404(Submission, id=submission_pk)
        grade = get_object_or_404(Grade, submission=submission)

        # Only classroom teacher can update grade
        if submission.assignment.classroom.teacher != request.user:
            return Response(
                {'error': 'Only the classroom teacher can update this grade'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(
            grade,
            data=request.data,
            context={'request': request, 'submission': submission},
            partial=kwargs.get('partial', False)
        )
        serializer.is_valid(raise_exception=True)
        grade = serializer.save()

        # Return full grade data
        response_serializer = GradeSerializer(grade, context={'request': request})
        return Response(response_serializer.data)

    @extend_schema(
        summary="Retrieve grade",
        description="Get grade details (owner: if published, teacher: always)",
        responses={200: GradeSerializer},
        tags=['Grades']
    )
    def retrieve(self, request, submission_pk=None, *args, **kwargs):
        """
        GET /api/v1/submissions/{id}/grade/

        Get grade for a submission.
        """
        submission = get_object_or_404(Submission, id=submission_pk)

        try:
            grade = submission.grade
        except Grade.DoesNotExist:
            return Response(
                {'error': 'This submission has not been graded yet'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check permission
        is_teacher = submission.assignment.classroom.teacher == request.user
        is_owner = submission.student == request.user

        if not is_teacher and not is_owner:
            return Response(
                {'error': 'You do not have permission to view this grade'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Students can only see published grades
        if is_owner and not is_teacher and not grade.is_published:
            return Response(
                {'error': 'This grade has not been published yet'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = GradeSerializer(grade, context={'request': request})
        return Response(serializer.data)
