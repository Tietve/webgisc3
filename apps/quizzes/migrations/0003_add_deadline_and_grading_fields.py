# Generated manually on 2025-11-18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quizzes', '0002_initial'),
    ]

    operations = [
        # Add deadline fields to Quiz model
        migrations.AddField(
            model_name='quiz',
            name='due_date',
            field=models.DateTimeField(blank=True, help_text='Deadline for quiz submission', null=True),
        ),
        migrations.AddField(
            model_name='quiz',
            name='late_submission_allowed',
            field=models.BooleanField(default=False, help_text='Whether late submissions are accepted'),
        ),
        migrations.AddField(
            model_name='quiz',
            name='late_deadline',
            field=models.DateTimeField(blank=True, help_text='Extended deadline for late submissions', null=True),
        ),

        # Add grading and review fields to QuizSubmission model
        migrations.AddField(
            model_name='quizsubmission',
            name='adjusted_score',
            field=models.IntegerField(blank=True, help_text='Teacher-adjusted score override (0-100)', null=True),
        ),
        migrations.AddField(
            model_name='quizsubmission',
            name='teacher_feedback',
            field=models.TextField(blank=True, help_text='Teacher review comments'),
        ),
        migrations.AddField(
            model_name='quizsubmission',
            name='is_reviewed',
            field=models.BooleanField(default=False, help_text='Whether teacher has reviewed this submission'),
        ),
        migrations.AddField(
            model_name='quizsubmission',
            name='is_late',
            field=models.BooleanField(default=False, help_text='Whether submission was after deadline'),
        ),

        # Update Quiz ordering to prioritize due_date
        migrations.AlterModelOptions(
            name='quiz',
            options={
                'ordering': ['due_date', '-created_at'],
                'verbose_name': 'Quiz',
                'verbose_name_plural': 'Quizzes'
            },
        ),
    ]
