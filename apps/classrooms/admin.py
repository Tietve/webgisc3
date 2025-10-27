"""
Admin configuration for classrooms app.
"""
from django.contrib import admin
from .models import Classroom, Enrollment


class EnrollmentInline(admin.TabularInline):
    """Inline admin for enrollments in classroom detail."""
    model = Enrollment
    extra = 0
    readonly_fields = ('enrolled_at',)
    raw_id_fields = ('student',)


@admin.register(Classroom)
class ClassroomAdmin(admin.ModelAdmin):
    """Admin interface for Classroom model."""
    list_display = ('name', 'teacher', 'enrollment_code', 'get_student_count', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'teacher__email', 'enrollment_code')
    readonly_fields = ('enrollment_code', 'created_at', 'updated_at')
    raw_id_fields = ('teacher',)
    inlines = [EnrollmentInline]

    def get_student_count(self, obj):
        """Display student count in list view."""
        return obj.get_student_count()
    get_student_count.short_description = 'Students'


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    """Admin interface for Enrollment model."""
    list_display = ('student', 'classroom', 'enrolled_at')
    list_filter = ('enrolled_at', 'classroom')
    search_fields = ('student__email', 'classroom__name')
    readonly_fields = ('enrolled_at',)
    raw_id_fields = ('student', 'classroom')
