from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('classrooms', '0005_classroom_curriculum_fields'),
        ('lessons', '0003_lesson_curriculum_fields'),
        ('quizzes', '0005_quiz_curriculum_fields'),
    ]

    operations = [
        migrations.CreateModel(
            name='AiConversation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(blank=True, max_length=255)),
                ('grade_level', models.CharField(max_length=10)),
                ('semester', models.CharField(max_length=10)),
                ('textbook_series', models.CharField(max_length=50)),
                ('module_code', models.CharField(blank=True, max_length=30)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('classroom', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='ai_conversations', to='classrooms.classroom')),
                ('lesson', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='ai_conversations', to='lessons.lesson')),
                ('quiz', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='ai_conversations', to='quizzes.quiz')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ai_conversations', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'ai_conversations',
                'ordering': ['-updated_at'],
            },
        ),
        migrations.CreateModel(
            name='AiMessage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(choices=[('system', 'System'), ('user', 'User'), ('assistant', 'Assistant')], max_length=20)),
                ('content', models.TextField()),
                ('context_snapshot', models.JSONField(blank=True, default=dict)),
                ('guardrail_flags', models.JSONField(blank=True, default=list)),
                ('model_name', models.CharField(blank=True, max_length=100)),
                ('provider_name', models.CharField(blank=True, max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('conversation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='ai_tutor.aiconversation')),
            ],
            options={
                'db_table': 'ai_messages',
                'ordering': ['created_at'],
            },
        ),
        migrations.CreateModel(
            name='AiMessageFeedback',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rating', models.SmallIntegerField()),
                ('note', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('message', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='feedback_entries', to='ai_tutor.aimessage')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ai_message_feedback', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'ai_message_feedback',
                'ordering': ['-created_at'],
                'unique_together': {('message', 'user')},
            },
        ),
        migrations.AddIndex(
            model_name='aiconversation',
            index=models.Index(fields=['user', '-updated_at'], name='idx_ai_conv_user_updated'),
        ),
        migrations.AddIndex(
            model_name='aiconversation',
            index=models.Index(fields=['grade_level', 'semester', 'textbook_series'], name='idx_ai_conv_curriculum'),
        ),
        migrations.AddIndex(
            model_name='aimessage',
            index=models.Index(fields=['conversation', 'created_at'], name='idx_ai_msg_conv_created'),
        ),
    ]
