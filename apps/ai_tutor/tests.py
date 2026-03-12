from unittest.mock import patch

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.ai_tutor.models import AiConversation, AiMessage, AiMessageFeedback
from apps.classrooms.models import Classroom
from apps.gis_data.models import MapLayer
from apps.lessons.models import Lesson, LessonStep
from apps.quizzes.models import Quiz


User = get_user_model()


class AiTutorApiTests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            email='student-ai@example.com',
            password='password123',
            role='student',
        )
        self.teacher = User.objects.create_user(
            email='teacher-ai@example.com',
            password='password123',
            role='teacher',
        )
        self.client.force_authenticate(user=self.student)

        self.classroom = Classroom.objects.create(
            name='Lớp 10A1',
            teacher=self.teacher,
            grade_level='10',
            semester='1',
            textbook_series='canh-dieu',
            module_code='CD10-HK1-M1',
        )
        self.lesson = Lesson.objects.create(
            title='Bài 1',
            description='Giới thiệu bài 1',
            grade_level='10',
            semester='1',
            textbook_series='canh-dieu',
            module_code='CD10-HK1-M1',
        )
        LessonStep.objects.create(lesson=self.lesson, order=1, popup_text='Nội dung bước 1')
        self.quiz = Quiz.objects.create(
            title='Quiz 1',
            classroom=self.classroom,
            lesson=self.lesson,
            description='Quiz mô đun 1',
            grade_level='10',
            semester='1',
            textbook_series='canh-dieu',
            module_code='CD10-HK1-M1',
        )
        self.layer = MapLayer.objects.create(
            name='Layer 10',
            data_source_table='sample_table',
            geom_type='POINT',
            school='THPT',
            grade='10',
        )
        self.url = '/api/v1/ai-tutor/respond/'

    def base_payload(self):
        return {
            'message': 'Bài này nói về gì?',
            'lesson_id': self.lesson.id,
            'quiz_id': self.quiz.id,
            'classroom_id': self.classroom.id,
            'lesson_step': 0,
            'active_layers': [self.layer.id],
            'grade_level': '10',
            'semester': '1',
            'textbook_series': 'canh-dieu',
            'module_code': 'CD10-HK1-M1',
        }

    @patch('apps.ai_tutor.views.AiProviderClient.chat', return_value='Đây là phần mở đầu của bài học.')
    def test_creates_conversation_and_messages(self, mock_chat):
        response = self.client.post(self.url, self.base_payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(AiConversation.objects.filter(user=self.student).exists())
        conversation = AiConversation.objects.get(user=self.student)
        self.assertEqual(conversation.messages.count(), 2)
        self.assertEqual(response.data['assistant_message'], 'Đây là phần mở đầu của bài học.')
        self.assertEqual(response.data['used_context']['mode'], 'lesson_explainer')
        mock_chat.assert_called_once()

    @patch('apps.ai_tutor.views.AiProviderClient.chat', return_value='Giải thích tiếp theo.')
    def test_appends_existing_conversation(self, mock_chat):
        first = self.client.post(self.url, self.base_payload(), format='json')
        payload = self.base_payload()
        payload['conversation_id'] = first.data['conversation_id']
        payload['message'] = 'Giải thích lại ngắn hơn'

        second = self.client.post(self.url, payload, format='json')
        self.assertEqual(second.status_code, status.HTTP_200_OK)
        conversation = AiConversation.objects.get(id=first.data['conversation_id'])
        self.assertEqual(conversation.messages.count(), 4)

    def test_rejects_wrong_curriculum(self):
        payload = self.base_payload()
        payload['grade_level'] = '11'

        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('lớp 10', response.data['detail'])

    def test_rejects_mismatched_layer_grade(self):
        bad_layer = MapLayer.objects.create(
            name='Layer 11',
            data_source_table='sample_table_11',
            geom_type='POINT',
            school='THPT',
            grade='11',
        )
        payload = self.base_payload()
        payload['active_layers'] = [bad_layer.id]

        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('apps.ai_tutor.views.AiProviderClient.chat', return_value='Đây là tóm tắt của module hiện tại.')
    def test_supports_module_summary_without_lesson_context(self, mock_chat):
        payload = {
            'message': 'Tóm tắt module này giúp em',
            'grade_level': '10',
            'semester': '1',
            'textbook_series': 'canh-dieu',
            'module_code': 'CD10-HK1-M1',
        }

        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['used_context']['mode'], 'module_summary')
        self.assertEqual(response.data['assistant_message'], 'Đây là tóm tắt của module hiện tại.')
        self.assertEqual(response.data['used_context']['module_summary']['module_code'], 'CD10-HK1-M1')
        mock_chat.assert_called_once()

    @patch('apps.ai_tutor.views.AiProviderClient.chat', return_value='Đây là khung ôn tập học kì 1.')
    def test_supports_semester_review_without_specific_context(self, mock_chat):
        payload = {
            'message': 'Giúp em ôn tập học kì 1',
            'grade_level': '10',
            'semester': '1',
            'textbook_series': 'canh-dieu',
            'module_code': '',
        }

        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['used_context']['mode'], 'semester_review')
        self.assertEqual(response.data['assistant_message'], 'Đây là khung ôn tập học kì 1.')
        mock_chat.assert_called_once()

    @patch('apps.ai_tutor.views.AiProviderClient.chat', side_effect=Exception('boom'))
    def test_provider_unexpected_error_returns_502(self, mock_chat):
        response = self.client.post(self.url, self.base_payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)

    @patch('apps.ai_tutor.views.AiProviderClient.chat', return_value='Phản hồi AI')
    def test_feedback_only_for_assistant_message(self, mock_chat):
        response = self.client.post(self.url, self.base_payload(), format='json')
        assistant_id = response.data['message_id']
        user_message = AiMessage.objects.filter(conversation_id=response.data['conversation_id'], role='user').first()

        ok = self.client.post(f'/api/v1/ai-tutor/messages/{assistant_id}/feedback/', {'rating': 1}, format='json')
        rejected = self.client.post(f'/api/v1/ai-tutor/messages/{user_message.id}/feedback/', {'rating': 1}, format='json')

        self.assertEqual(ok.status_code, status.HTTP_200_OK)
        self.assertEqual(rejected.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(AiMessageFeedback.objects.count(), 1)
