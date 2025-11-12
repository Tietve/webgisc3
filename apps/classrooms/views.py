"""
Views for classroom and enrollment management.
"""
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from apps.core.permissions import IsTeacher, IsStudent
from .models import Classroom, Enrollment, Announcement
from .serializers import (
    ClassroomSerializer,
    ClassroomCreateSerializer,
    EnrollmentSerializer,
    EnrollmentCreateSerializer,
    StudentListSerializer,
    AnnouncementSerializer
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
