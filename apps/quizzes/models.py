"""
Models for quiz and assessment system.
"""
from django.db import models
from django.conf import settings
from apps.classrooms.models import Classroom


class Quiz(models.Model):
    """
    Quiz model for assessments.

    Fields:
        id: Auto-incrementing primary key
        title: Title of the quiz
        classroom: Foreign key to the classroom (optional)
        description: Optional description of the quiz
        created_at: Timestamp of quiz creation
        updated_at: Timestamp of last update
    """
    title = models.CharField(max_length=255, help_text='Title of the quiz')
    classroom = models.ForeignKey(
        Classroom,
        on_delete=models.CASCADE,
        related_name='quizzes',
        null=True,
        blank=True,
        help_text='Classroom this quiz is assigned to'
    )
    description = models.TextField(blank=True, help_text='Description of the quiz')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'quizzes'
        verbose_name = 'Quiz'
        verbose_name_plural = 'Quizzes'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class QuizQuestion(models.Model):
    """
    QuizQuestion model for quiz questions.

    Fields:
        id: Auto-incrementing primary key
        quiz: Foreign key to the quiz
        question_text: Text of the question
        order: Order of the question in the quiz
    """
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='questions',
        help_text='Quiz this question belongs to'
    )
    question_text = models.TextField(help_text='Text of the question')
    order = models.IntegerField(default=0, help_text='Order of the question in the quiz')

    class Meta:
        db_table = 'quiz_questions'
        verbose_name = 'Quiz Question'
        verbose_name_plural = 'Quiz Questions'
        ordering = ['quiz', 'order']

    def __str__(self):
        return f"{self.quiz.title} - Q{self.order}: {self.question_text[:50]}"


class QuizAnswer(models.Model):
    """
    QuizAnswer model for multiple choice answers.

    Fields:
        id: Auto-incrementing primary key
        question: Foreign key to the question
        answer_text: Text of the answer
        is_correct: Whether this is the correct answer
    """
    question = models.ForeignKey(
        QuizQuestion,
        on_delete=models.CASCADE,
        related_name='answers',
        help_text='Question this answer belongs to'
    )
    answer_text = models.TextField(help_text='Text of the answer')
    is_correct = models.BooleanField(default=False, help_text='Whether this is the correct answer')

    class Meta:
        db_table = 'quiz_answers'
        verbose_name = 'Quiz Answer'
        verbose_name_plural = 'Quiz Answers'

    def __str__(self):
        return f"{self.answer_text[:50]} ({'Correct' if self.is_correct else 'Incorrect'})"


class QuizSubmission(models.Model):
    """
    QuizSubmission model for student quiz submissions.

    Fields:
        id: Auto-incrementing primary key
        quiz: Foreign key to the quiz
        student: Foreign key to the student
        score: Score achieved (0-100)
        submitted_at: Timestamp of submission
    """
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='submissions',
        help_text='Quiz that was submitted'
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='quiz_submissions',
        limit_choices_to={'role': 'student'},
        help_text='Student who submitted the quiz'
    )
    score = models.IntegerField(help_text='Score achieved (0-100)')
    submitted_at = models.DateTimeField(auto_now_add=True)

    # Store the student's answers as JSON
    answers = models.JSONField(
        default=dict,
        help_text='Student answers stored as {question_id: answer_id}'
    )

    class Meta:
        db_table = 'quiz_submissions'
        verbose_name = 'Quiz Submission'
        verbose_name_plural = 'Quiz Submissions'
        ordering = ['-submitted_at']
        unique_together = ('quiz', 'student')  # Each student can submit once per quiz

    def __str__(self):
        return f"{self.student.email} - {self.quiz.title} ({self.score}%)"
