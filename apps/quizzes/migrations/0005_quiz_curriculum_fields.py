from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('lessons', '0003_lesson_curriculum_fields'),
        ('quizzes', '0004_alter_quizsubmission_score'),
    ]

    operations = [
        migrations.AddField(
            model_name='quiz',
            name='grade_level',
            field=models.CharField(default='10', help_text='School grade level', max_length=10),
        ),
        migrations.AddField(
            model_name='quiz',
            name='is_published',
            field=models.BooleanField(default=True, help_text='Whether this quiz is visible to learners'),
        ),
        migrations.AddField(
            model_name='quiz',
            name='lesson',
            field=models.ForeignKey(blank=True, help_text='Lesson this quiz reinforces', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='quizzes', to='lessons.lesson'),
        ),
        migrations.AddField(
            model_name='quiz',
            name='module_code',
            field=models.CharField(blank=True, help_text='Curriculum module code', max_length=30),
        ),
        migrations.AddField(
            model_name='quiz',
            name='semester',
            field=models.CharField(default='1', help_text='Semester number', max_length=10),
        ),
        migrations.AddField(
            model_name='quiz',
            name='subject',
            field=models.CharField(default='??a l?', help_text='Subject name', max_length=100),
        ),
        migrations.AddField(
            model_name='quiz',
            name='textbook_series',
            field=models.CharField(default='canh-dieu', help_text='Textbook series', max_length=50),
        ),
        migrations.AddIndex(
            model_name='quiz',
            index=models.Index(fields=['grade_level', 'semester', 'textbook_series'], name='idx_quiz_curriculum'),
        ),
    ]
