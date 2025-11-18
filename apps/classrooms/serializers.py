"""
Serializers for classroom and enrollment management.
"""
from rest_framework import serializers
from django.utils import timezone
from apps.users.serializers import UserSerializer
from .models import Classroom, Enrollment, Announcement, Assignment, Submission, Grade


class ClassroomSerializer(serializers.ModelSerializer):
    """
    Serializer for Classroom model.
    """
    teacher = UserSerializer(read_only=True)
    teacher_email = serializers.EmailField(source='teacher.email', read_only=True)
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = Classroom
        fields = ('id', 'name', 'teacher', 'teacher_email', 'enrollment_code', 'student_count', 'created_at', 'updated_at')
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


class AnnouncementSerializer(serializers.ModelSerializer):
    """
    Serializer for Announcement model.
    """
    author_email = serializers.EmailField(source='author.email', read_only=True)
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = ('id', 'classroom', 'author', 'author_email', 'author_name', 'content', 'created_at', 'updated_at')
        read_only_fields = ('id', 'author', 'created_at', 'updated_at')

    def get_author_name(self, obj):
        """Get author's display name (email for now)."""
        return obj.author.email

    def create(self, validated_data):
        """Create announcement with the authenticated user as author."""
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


# ============================================================================
# Assignment Serializers
# ============================================================================

class AssignmentSerializer(serializers.ModelSerializer):
    """
    Full serializer for Assignment model with related data.
    """
    teacher_email = serializers.EmailField(source='created_by.email', read_only=True)
    submission_count = serializers.SerializerMethodField()
    is_overdue = serializers.ReadOnlyField()
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = (
            'id', 'classroom', 'title', 'description', 'due_date', 'max_score',
            'attachment', 'attachment_url', 'created_by', 'teacher_email',
            'submission_count', 'is_overdue', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at')

    def get_submission_count(self, obj):
        """Get number of submissions for this assignment."""
        return obj.get_submission_count()

    def get_attachment_url(self, obj):
        """Get full URL for attachment file."""
        if obj.attachment:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.attachment.url)
            return obj.attachment.url
        return None


class AssignmentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating assignments.
    """
    class Meta:
        model = Assignment
        fields = ('id', 'title', 'description', 'due_date', 'max_score', 'attachment')
        read_only_fields = ('id',)

    def validate_due_date(self, value):
        """Validate that due date is in the future."""
        if value < timezone.now():
            raise serializers.ValidationError("Due date must be in the future.")
        return value

    def validate_max_score(self, value):
        """Validate that max score is positive."""
        if value <= 0:
            raise serializers.ValidationError("Max score must be greater than 0.")
        return value

    def create(self, validated_data):
        """Create assignment with classroom and created_by from context."""
        validated_data['classroom_id'] = self.context['classroom_id']
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class AssignmentListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing assignments.
    """
    teacher_email = serializers.EmailField(source='created_by.email', read_only=True)
    submission_count = serializers.SerializerMethodField()
    is_overdue = serializers.ReadOnlyField()

    class Meta:
        model = Assignment
        fields = (
            'id', 'title', 'due_date', 'max_score', 'teacher_email',
            'submission_count', 'is_overdue', 'created_at'
        )
        read_only_fields = fields

    def get_submission_count(self, obj):
        """Get number of submissions."""
        return obj.get_submission_count()


# ============================================================================
# Submission Serializers
# ============================================================================

class SubmissionSerializer(serializers.ModelSerializer):
    """
    Full serializer for Submission model with grade info.
    """
    student_email = serializers.EmailField(source='student.email', read_only=True)
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)
    file_url = serializers.SerializerMethodField()
    grade = serializers.SerializerMethodField()

    class Meta:
        model = Submission
        fields = (
            'id', 'assignment', 'assignment_title', 'student', 'student_email',
            'text_answer', 'file', 'file_url', 'submitted_at', 'is_late', 'grade'
        )
        read_only_fields = ('id', 'student', 'submitted_at', 'is_late')

    def get_file_url(self, obj):
        """Get full URL for file upload."""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def get_grade(self, obj):
        """Include grade info if it exists and is published (or user is teacher)."""
        try:
            grade = obj.grade
            request = self.context.get('request')
            user = request.user if request else None

            # Show grade if published or user is teacher
            if grade.is_published or (user and user.role == 'teacher'):
                return {
                    'id': grade.id,
                    'score': float(grade.score),
                    'percentage': round(grade.percentage, 2),
                    'feedback': grade.feedback,
                    'is_published': grade.is_published,
                    'graded_at': grade.graded_at
                }
        except Grade.DoesNotExist:
            pass
        return None


class SubmissionCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating/updating submissions.
    """
    class Meta:
        model = Submission
        fields = ('id', 'text_answer', 'file')
        read_only_fields = ('id',)

    def validate(self, data):
        """Validate that at least one of text_answer or file is provided."""
        text_answer = data.get('text_answer', '').strip()
        file = data.get('file')

        if not text_answer and not file:
            raise serializers.ValidationError(
                "At least one of text_answer or file must be provided."
            )

        return data

    def create(self, validated_data):
        """Create submission with assignment and student from context."""
        assignment = self.context['assignment']
        student = self.context['request'].user

        # Check if already submitted
        if Submission.objects.filter(assignment=assignment, student=student).exists():
            raise serializers.ValidationError("You have already submitted this assignment.")

        # Check if student is enrolled in the classroom
        from .models import Enrollment
        if not Enrollment.objects.filter(classroom=assignment.classroom, student=student).exists():
            raise serializers.ValidationError("You are not enrolled in this classroom.")

        # Create submission
        validated_data['assignment'] = assignment
        validated_data['student'] = student

        return super().create(validated_data)


# ============================================================================
# Grade Serializers
# ============================================================================

class GradeSerializer(serializers.ModelSerializer):
    """
    Full serializer for Grade model.
    """
    percentage = serializers.ReadOnlyField()
    graded_by_email = serializers.EmailField(source='graded_by.email', read_only=True)
    feedback_file_url = serializers.SerializerMethodField()
    student_email = serializers.EmailField(source='submission.student.email', read_only=True)
    assignment_title = serializers.CharField(source='submission.assignment.title', read_only=True)

    class Meta:
        model = Grade
        fields = (
            'id', 'submission', 'student_email', 'assignment_title', 'score',
            'percentage', 'feedback', 'feedback_file', 'feedback_file_url',
            'is_published', 'graded_by', 'graded_by_email', 'graded_at'
        )
        read_only_fields = ('id', 'graded_by', 'graded_at')

    def get_feedback_file_url(self, obj):
        """Get full URL for feedback file."""
        if obj.feedback_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.feedback_file.url)
            return obj.feedback_file.url
        return None


class GradeCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating/updating grades.
    """
    class Meta:
        model = Grade
        fields = ('id', 'score', 'feedback', 'feedback_file', 'is_published')
        read_only_fields = ('id',)

    def validate_score(self, value):
        """Validate that score is not negative."""
        if value < 0:
            raise serializers.ValidationError("Score cannot be negative.")
        return value

    def validate(self, data):
        """Validate that score does not exceed max_score."""
        submission = self.context.get('submission')
        score = data.get('score')

        if submission and score is not None:
            if score > submission.assignment.max_score:
                raise serializers.ValidationError(
                    f"Score cannot exceed max score of {submission.assignment.max_score}."
                )

        return data

    def create(self, validated_data):
        """Create grade with submission and graded_by from context."""
        validated_data['submission'] = self.context['submission']
        validated_data['graded_by'] = self.context['request'].user
        return super().create(validated_data)
