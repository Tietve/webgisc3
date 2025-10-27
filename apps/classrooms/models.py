"""
Models for classroom and enrollment management.
"""
import random
import string
from django.db import models
from django.conf import settings


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
        limit_choices_to={'role': 'teacher'},
        help_text='Teacher who manages this classroom'
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
        limit_choices_to={'role': 'student'},
        help_text='Student enrolled in the classroom'
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
