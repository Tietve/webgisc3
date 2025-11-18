"""
Admin configuration for classrooms app.
"""
from django.contrib import admin
from .models import Classroom, Enrollment, Announcement, Assignment, Submission, Grade


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


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    """Admin interface for Announcement model."""
    list_display = ('classroom', 'author', 'content_preview', 'created_at')
    list_filter = ('created_at', 'classroom')
    search_fields = ('classroom__name', 'author__email', 'content')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('classroom', 'author')

    def content_preview(self, obj):
        """Show preview of content."""
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'


class SubmissionInline(admin.TabularInline):
    """Inline admin for submissions in assignment detail."""
    model = Submission
    extra = 0
    readonly_fields = ('student', 'submitted_at', 'is_late')
    fields = ('student', 'text_answer', 'file', 'submitted_at', 'is_late')
    can_delete = False


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    """Admin interface for Assignment model."""
    list_display = ('title', 'classroom', 'created_by', 'due_date', 'max_score', 'get_submission_count', 'is_overdue')
    list_filter = ('created_at', 'due_date', 'classroom')
    search_fields = ('title', 'classroom__name', 'created_by__email')
    readonly_fields = ('created_at', 'updated_at', 'is_overdue')
    raw_id_fields = ('classroom', 'created_by')
    inlines = [SubmissionInline]
    fieldsets = (
        ('Basic Information', {
            'fields': ('classroom', 'title', 'description')
        }),
        ('Submission Details', {
            'fields': ('due_date', 'max_score', 'attachment')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at', 'is_overdue'),
            'classes': ('collapse',)
        }),
    )

    def get_submission_count(self, obj):
        """Display submission count."""
        return obj.get_submission_count()
    get_submission_count.short_description = 'Submissions'


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    """Admin interface for Submission model."""
    list_display = ('assignment', 'student', 'submitted_at', 'is_late', 'has_grade')
    list_filter = ('submitted_at', 'is_late', 'assignment__classroom')
    search_fields = ('assignment__title', 'student__email')
    readonly_fields = ('submitted_at', 'is_late')
    raw_id_fields = ('assignment', 'student')
    fieldsets = (
        ('Submission Information', {
            'fields': ('assignment', 'student', 'text_answer', 'file')
        }),
        ('Metadata', {
            'fields': ('submitted_at', 'is_late'),
            'classes': ('collapse',)
        }),
    )

    def has_grade(self, obj):
        """Check if submission has been graded."""
        return hasattr(obj, 'grade')
    has_grade.boolean = True
    has_grade.short_description = 'Graded'


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    """Admin interface for Grade model."""
    list_display = ('submission', 'score', 'percentage_display', 'is_published', 'graded_by', 'graded_at')
    list_filter = ('is_published', 'graded_at', 'submission__assignment__classroom')
    search_fields = ('submission__assignment__title', 'submission__student__email', 'graded_by__email')
    readonly_fields = ('graded_at', 'percentage_display')
    raw_id_fields = ('submission', 'graded_by')
    fieldsets = (
        ('Grade Information', {
            'fields': ('submission', 'score', 'percentage_display')
        }),
        ('Feedback', {
            'fields': ('feedback', 'feedback_file')
        }),
        ('Publishing', {
            'fields': ('is_published',)
        }),
        ('Metadata', {
            'fields': ('graded_by', 'graded_at'),
            'classes': ('collapse',)
        }),
    )

    def percentage_display(self, obj):
        """Display percentage."""
        return f"{obj.percentage:.2f}%"
    percentage_display.short_description = 'Percentage'
