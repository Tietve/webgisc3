from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gis_data', '0003_boundary_pointofinterest_route_polygonfeature_and_more'),
        ('lessons', '0002_alter_mapaction_action_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='lesson',
            name='grade_level',
            field=models.CharField(default='10', help_text='School grade level', max_length=10),
        ),
        migrations.AddField(
            model_name='lesson',
            name='is_published',
            field=models.BooleanField(default=True, help_text='Whether this lesson is visible to learners'),
        ),
        migrations.AddField(
            model_name='lesson',
            name='lesson_type',
            field=models.CharField(choices=[('overview', 'Overview'), ('practice', 'Practice')], default='overview', help_text='Whether this lesson is overview or practice', max_length=20),
        ),
        migrations.AddField(
            model_name='lesson',
            name='module_code',
            field=models.CharField(blank=True, help_text='Curriculum module code', max_length=30),
        ),
        migrations.AddField(
            model_name='lesson',
            name='semester',
            field=models.CharField(default='1', help_text='Semester number', max_length=10),
        ),
        migrations.AddField(
            model_name='lesson',
            name='subject',
            field=models.CharField(default='??a l?', help_text='Subject name', max_length=100),
        ),
        migrations.AddField(
            model_name='lesson',
            name='textbook_series',
            field=models.CharField(choices=[('canh-dieu', 'C?nh Di?u'), ('ket-noi', 'K?t n?i tri th?c'), ('chan-troi', 'Ch?n tr?i s?ng t?o')], default='canh-dieu', help_text='Textbook series for this lesson', max_length=50),
        ),
        migrations.AddField(
            model_name='lesson',
            name='layers',
            field=models.ManyToManyField(blank=True, help_text='Map layers used by this lesson', related_name='lessons', to='gis_data.maplayer'),
        ),
        migrations.AlterModelOptions(
            name='lesson',
            options={'ordering': ['module_code', 'lesson_type', '-created_at'], 'verbose_name': 'Lesson', 'verbose_name_plural': 'Lessons'},
        ),
    ]
