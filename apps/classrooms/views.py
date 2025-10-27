"""
Views for classroom and enrollment management.
"""
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from apps.core.permissions import IsTeacher, IsStudent
from .models import Classroom, Enrollment
from .serializers import (
    ClassroomSerializer,
    ClassroomCreateSerializer,
    EnrollmentSerializer,
    EnrollmentCreateSerializer,
    StudentListSerializer
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
        Return classrooms based on user role:
        - Teachers: their own classrooms
        - Students: classrooms they're enrolled in
        """
        user = self.request.user
        if user.role == 'teacher':
            return Classroom.objects.filter(teacher=user)
        else:  # student
            enrolled_classroom_ids = Enrollment.objects.filter(
                student=user
            ).values_list('classroom_id', flat=True)
            return Classroom.objects.filter(id__in=enrolled_classroom_ids)

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
        description="Create a new classroom (teachers only)",
        request=ClassroomCreateSerializer,
        responses={
            201: ClassroomSerializer,
            403: OpenApiResponse(description="Only teachers can create classrooms")
        },
        tags=['Classrooms']
    )
    def create(self, request, *args, **kwargs):
        # Check if user is a teacher
        if request.user.role != 'teacher':
            return Response(
                {'error': {'code': 'PermissionDenied', 'message': 'Only teachers can create classrooms.'}},
                status=status.HTTP_403_FORBIDDEN
            )

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

    Student endpoint to join a classroom using enrollment code.

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
    permission_classes = [IsAuthenticated, IsStudent]

    @extend_schema(
        summary="Join a classroom",
        description="Student joins a classroom using enrollment code",
        request=EnrollmentCreateSerializer,
        responses={
            201: OpenApiResponse(description="Successfully enrolled"),
            400: OpenApiResponse(description="Invalid enrollment code or already enrolled"),
            403: OpenApiResponse(description="Only students can join classrooms")
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
