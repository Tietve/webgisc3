"""
Admin configuration for quizzes app.
"""
from django.contrib import admin
from .models import Quiz, QuizQuestion, QuizAnswer, QuizSubmission


class QuizAnswerInline(admin.TabularInline):
    """Inline admin for quiz answers."""
    model = QuizAnswer
    extra = 1


class QuizQuestionInline(admin.StackedInline):
    """Inline admin for quiz questions."""
    model = QuizQuestion
    extra = 1
    ordering = ('order',)


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    """Admin interface for Quiz model."""
    list_display = ('title', 'classroom', 'get_question_count', 'created_at')
    list_filter = ('classroom', 'created_at')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('classroom',)
    inlines = [QuizQuestionInline]

    def get_question_count(self, obj):
        """Display question count in list view."""
        return obj.questions.count()
    get_question_count.short_description = 'Questions'


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    """Admin interface for QuizQuestion model."""
    list_display = ('quiz', 'order', 'get_question_preview', 'get_answer_count')
    list_filter = ('quiz',)
    search_fields = ('question_text', 'quiz__title')
    raw_id_fields = ('quiz',)
    inlines = [QuizAnswerInline]

    def get_question_preview(self, obj):
        """Show preview of question text."""
        return obj.question_text[:50] + '...' if len(obj.question_text) > 50 else obj.question_text
    get_question_preview.short_description = 'Question Preview'

    def get_answer_count(self, obj):
        """Display answer count."""
        return obj.answers.count()
    get_answer_count.short_description = 'Answers'


@admin.register(QuizAnswer)
class QuizAnswerAdmin(admin.ModelAdmin):
    """Admin interface for QuizAnswer model."""
    list_display = ('question', 'get_answer_preview', 'is_correct')
    list_filter = ('is_correct', 'question__quiz')
    search_fields = ('answer_text', 'question__question_text')
    raw_id_fields = ('question',)

    def get_answer_preview(self, obj):
        """Show preview of answer text."""
        return obj.answer_text[:50] + '...' if len(obj.answer_text) > 50 else obj.answer_text
    get_answer_preview.short_description = 'Answer Preview'


@admin.register(QuizSubmission)
class QuizSubmissionAdmin(admin.ModelAdmin):
    """Admin interface for QuizSubmission model."""
    list_display = ('quiz', 'student', 'score', 'submitted_at')
    list_filter = ('quiz', 'submitted_at')
    search_fields = ('student__email', 'quiz__title')
    readonly_fields = ('submitted_at', 'answers')
    raw_id_fields = ('quiz', 'student')

    def has_add_permission(self, request):
        """Prevent manual creation of submissions through admin."""
        return False
