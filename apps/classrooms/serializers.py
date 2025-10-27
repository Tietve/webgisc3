"""
Serializers for classroom and enrollment management.
"""
from rest_framework import serializers
from apps.users.serializers import UserSerializer
from .models import Classroom, Enrollment


class ClassroomSerializer(serializers.ModelSerializer):
    """
    Serializer for Classroom model.
    """
    teacher = UserSerializer(read_only=True)
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = Classroom
        fields = ('id', 'name', 'teacher', 'enrollment_code', 'student_count', 'created_at', 'updated_at')
        read_only_fields = ('id', 'enrollment_code', 'created_at', 'updated_at')

    def get_student_count(self, obj):
        """Get the number of enrolled students."""
        return obj.get_student_count()


class ClassroomCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new classroom.
    """
    class Meta:
        model = Classroom
        fields = ('id', 'name', 'enrollment_code')
        read_only_fields = ('id', 'enrollment_code')

    def create(self, validated_data):
        """
        Create a new classroom with the authenticated teacher.
        """
        teacher = self.context['request'].user
        classroom = Classroom.objects.create(teacher=teacher, **validated_data)
        return classroom


class EnrollmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Enrollment model.
    """
    student = UserSerializer(read_only=True)
    classroom = ClassroomSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = ('id', 'student', 'classroom', 'enrolled_at')
        read_only_fields = fields


class EnrollmentCreateSerializer(serializers.Serializer):
    """
    Serializer for enrolling in a classroom using enrollment code.
    """
    enrollment_code = serializers.CharField(max_length=8, required=True)

    def validate_enrollment_code(self, value):
        """
        Validate that the enrollment code exists.
        """
        try:
            classroom = Classroom.objects.get(enrollment_code=value)
        except Classroom.DoesNotExist:
            raise serializers.ValidationError("Invalid enrollment code.")
        return value

    def create(self, validated_data):
        """
        Create a new enrollment for the authenticated student.
        """
        student = self.context['request'].user
        classroom = Classroom.objects.get(enrollment_code=validated_data['enrollment_code'])

        # Check if already enrolled
        if Enrollment.objects.filter(student=student, classroom=classroom).exists():
            raise serializers.ValidationError("You are already enrolled in this classroom.")

        enrollment = Enrollment.objects.create(student=student, classroom=classroom)
        return enrollment


class StudentListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing students in a classroom.
    """
    class Meta:
        model = Enrollment
        fields = ('id', 'student', 'enrolled_at')

    def to_representation(self, instance):
        """
        Customize the representation to return student data directly.
        """
        return {
            'id': str(instance.student.id),
            'email': instance.student.email,
            'enrolled_at': instance.enrolled_at
        }
