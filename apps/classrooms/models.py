"""
Models for classroom and enrollment management.
"""
import random
import string
from django.db import models
from django.conf import settings
from django.core.validators import FileExtensionValidator
from django.utils import timezone
from apps.core.validators import (
    validate_assignment_file,
    validate_submission_file,
    validate_feedback_file
)


def generate_enrollment_code():
    """Generate a unique 8-character enrollment code."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))


class Classroom(models.Model):
    """
    Classroom model for managing classes.

    Fields:
        id: Auto-incrementing primary key
        name: Name of the classroom
        teacher: Foreign key to the teacher who manages the class
        enrollment_code: Unique 8-character code for students to join
        created_at: Timestamp of classroom creation
        updated_at: Timestamp of last update
    """
    name = models.CharField(max_length=255, help_text='Name of the classroom')
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='classrooms_teaching',
        help_text='User who created and manages this classroom'
    )
    enrollment_code = models.CharField(
        max_length=8,
        unique=True,
        default=generate_enrollment_code,
        help_text='Unique code for students to join the classroom'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'classrooms'
        verbose_name = 'Classroom'
        verbose_name_plural = 'Classrooms'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} (Teacher: {self.teacher.email})"

    def get_student_count(self):
        """Get the number of enrolled students."""
        return self.enrollments.count()


class Enrollment(models.Model):
    """
    Enrollment model for student-classroom relationships.

    Fields:
        id: Auto-incrementing primary key
        student: Foreign key to the student user
        classroom: Foreign key to the classroom
        enrolled_at: Timestamp of enrollment
    """
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='enrollments',
        help_text='User enrolled in the classroom as a member'
    )
    classroom = models.ForeignKey(
        Classroom,
        on_delete=models.CASCADE,
        related_name='enrollments',
        help_text='Classroom the student is enrolled in'
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'enrollments'
        verbose_name = 'Enrollment'
        verbose_name_plural = 'Enrollments'
        unique_together = ('student', 'classroom')
        ordering = ['-enrolled_at']

    def __str__(self):
        return f"{self.student.email} enrolled in {self.classroom.name}"


class Announcement(models.Model):
    """
    Model for classroom announcements/posts.

    Fields:
        classroom: Foreign key to the classroom
        author: User who created the announcement
        content: Text content of the announcement
        created_at: Timestamp of creation
        updated_at: Timestamp of last update
    """
    classroom = models.ForeignKey(
        Classroom,
        on_delete=models.CASCADE,
        related_name='announcements',
        help_text='Classroom this announcement belongs to'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='announcements',
        help_text='User who created this announcement'
    )
    content = models.TextField(help_text='Content of the announcement')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'announcements'
        verbose_name = 'Announcement'
        verbose_name_plural = 'Announcements'
        ordering = ['-created_at']  # Newest first

    def __str__(self):
        return f"{self.author.email} - {self.classroom.name} - {self.created_at.strftime('%Y-%m-%d')}"


class Assignment(models.Model):
    """
    Homework assignment created by teacher.

    Fields:
        classroom: Foreign key to the classroom
        title: Assignment title
        description: Detailed assignment instructions
        due_date: Deadline for submission
        max_score: Maximum score for this assignment
        attachment: Optional file attachment (instructions, template, etc.)
        created_by: Teacher who created the assignment
        created_at: Timestamp of creation
        updated_at: Timestamp of last update
    """
    classroom = models.ForeignKey(
        Classroom,
        on_delete=models.CASCADE,
        related_name='assignments',
        help_text='Classroom this assignment belongs to'
    )
    title = models.CharField(max_length=200, help_text='Assignment title')
    description = models.TextField(help_text='Detailed assignment instructions')
    due_date = models.DateTimeField(help_text='Deadline for submission')
    max_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=100,
        help_text='Maximum score for this assignment'
    )
    attachment = models.FileField(
        upload_to='assignments/%Y/%m/%d/',
        blank=True,
        null=True,
        validators=[
            FileExtensionValidator(['pdf', 'doc', 'docx']),
            validate_assignment_file
        ],
        help_text='Optional file attachment (PDF, DOC, DOCX)'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_assignments',
        help_text='Teacher who created this assignment'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'assignments'
        verbose_name = 'Assignment'
        verbose_name_plural = 'Assignments'
        ordering = ['-due_date']
        indexes = [
            models.Index(fields=['classroom', 'due_date']),
        ]

    def __str__(self):
        return f"{self.title} - {self.classroom.name}"

    @property
    def is_overdue(self):
        """Check if assignment is past due date."""
        return timezone.now() > self.due_date

    def get_submission_count(self):
        """Get the number of submissions for this assignment."""
        return self.submissions.count()


class Submission(models.Model):
    """
    Student submission for an assignment.

    Fields:
        assignment: Foreign key to the assignment
        student: Student who submitted
        text_answer: Optional text answer
        file: Optional file upload (PDF, DOC, DOCX)
        submitted_at: Timestamp of submission
        is_late: Flag indicating if submission was late
    """
    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name='submissions',
        help_text='Assignment this submission is for'
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='submissions',
        help_text='Student who submitted'
    )
    text_answer = models.TextField(
        blank=True,
        help_text='Text answer (optional if file is provided)'
    )
    file = models.FileField(
        upload_to='submissions/%Y/%m/%d/',
        validators=[
            FileExtensionValidator(['pdf', 'doc', 'docx']),
            validate_submission_file
        ],
        blank=True,
        null=True,
        help_text='File upload (PDF, DOC, DOCX)'
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_late = models.BooleanField(
        default=False,
        help_text='Flag indicating if submission was late'
    )

    class Meta:
        db_table = 'submissions'
        verbose_name = 'Submission'
        verbose_name_plural = 'Submissions'
        unique_together = [['assignment', 'student']]
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['assignment', 'student']),
        ]

    def __str__(self):
        return f"{self.student.email} - {self.assignment.title}"

    def save(self, *args, **kwargs):
        """Override save to automatically set is_late flag."""
        if not self.pk:  # Only on creation
            self.is_late = timezone.now() > self.assignment.due_date
        super().save(*args, **kwargs)


class Grade(models.Model):
    """
    Teacher grade and feedback for a submission.

    Fields:
        submission: OneToOne relationship with submission
        score: Grade score
        feedback: Text feedback from teacher
        feedback_file: Optional feedback file
        is_published: Whether grade is visible to student
        graded_by: Teacher who graded
        graded_at: Timestamp of grading
    """
    submission = models.OneToOneField(
        Submission,
        on_delete=models.CASCADE,
        related_name='grade',
        help_text='Submission being graded'
    )
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text='Grade score'
    )
    feedback = models.TextField(
        blank=True,
        help_text='Text feedback from teacher'
    )
    feedback_file = models.FileField(
        upload_to='feedback/%Y/%m/%d/',
        blank=True,
        null=True,
        validators=[
            FileExtensionValidator(['pdf', 'doc', 'docx']),
            validate_feedback_file
        ],
        help_text='Optional feedback file (PDF, DOC, DOCX)'
    )
    is_published = models.BooleanField(
        default=False,
        help_text='Whether grade is visible to student'
    )
    graded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='grades_given',
        help_text='Teacher who graded'
    )
    graded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'grades'
        verbose_name = 'Grade'
        verbose_name_plural = 'Grades'
        ordering = ['-graded_at']

    def __str__(self):
        return f"{self.submission.student.email} - {self.submission.assignment.title} - {self.score}/{self.submission.assignment.max_score}"

    @property
    def percentage(self):
        """Calculate grade as percentage of max score."""
        max_score = self.submission.assignment.max_score
        return (self.score / max_score * 100) if max_score > 0 else 0
