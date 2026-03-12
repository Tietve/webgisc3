from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('classrooms', '0004_assignment_submission_grade_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='assignment',
            name='resource_id',
            field=models.PositiveIntegerField(blank=True, help_text='Primary key of the linked learning resource', null=True),
        ),
        migrations.AddField(
            model_name='assignment',
            name='resource_type',
            field=models.CharField(blank=True, help_text='Optional linked learning resource type: lesson or quiz', max_length=20),
        ),
        migrations.AddField(
            model_name='classroom',
            name='grade_level',
            field=models.CharField(default='10', help_text='School grade level', max_length=10),
        ),
        migrations.AddField(
            model_name='classroom',
            name='is_published',
            field=models.BooleanField(default=True, help_text='Whether this classroom is active for learners'),
        ),
        migrations.AddField(
            model_name='classroom',
            name='module_code',
            field=models.CharField(blank=True, help_text='Focused module code, if any', max_length=30),
        ),
        migrations.AddField(
            model_name='classroom',
            name='semester',
            field=models.CharField(default='1', help_text='Semester number', max_length=10),
        ),
        migrations.AddField(
            model_name='classroom',
            name='subject',
            field=models.CharField(default='??a l?', help_text='Subject name', max_length=100),
        ),
        migrations.AddField(
            model_name='classroom',
            name='textbook_series',
            field=models.CharField(default='canh-dieu', help_text='Textbook series', max_length=50),
        ),
    ]
