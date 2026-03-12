from apps.classrooms.models import Classroom
from apps.gis_data.models import MapLayer
from apps.lessons.models import Lesson
from apps.quizzes.models import Quiz


CURRICULUM_GUARDRAILS = {
    'grade_level': '10',
    'semester': '1',
    'textbook_series': 'canh-dieu',
}


class AiTutorContextError(Exception):
    pass


class AiTutorContextBuilder:
    def __init__(self, user):
        self.user = user

    def validate_curriculum(self, payload):
        for key, expected in CURRICULUM_GUARDRAILS.items():
            if payload.get(key) != expected:
                raise AiTutorContextError('AI Tutor v1 chỉ hỗ trợ lớp 10, học kì 1, bộ Cánh Diều.')

    def build(self, payload):
        self.validate_curriculum(payload)

        lesson = self._get_lesson(payload.get('lesson_id'))
        quiz = self._get_quiz(payload.get('quiz_id'))
        classroom = self._get_classroom(payload.get('classroom_id'))
        layers = self._get_layers(payload.get('active_layers') or [])

        used_context = {
            'mode': self._resolve_mode(payload, lesson, quiz, classroom, layers),
            'curriculum': {
                'grade_level': payload['grade_level'],
                'semester': payload['semester'],
                'textbook_series': payload['textbook_series'],
                'module_code': payload.get('module_code') or '',
            },
            'lesson': self._lesson_context(lesson, payload.get('lesson_step')) if lesson else None,
            'quiz': self._quiz_context(quiz, payload) if quiz else None,
            'classroom': self._classroom_context(classroom) if classroom else None,
            'map': {
                'active_layers': [self._layer_context(layer) for layer in layers],
                'selected_feature': payload.get('selected_feature') or None,
                'map_state': payload.get('map_state') or None,
            },
            'module_summary': self._module_summary(payload),
            'semester_summary': self._semester_summary(payload),
        }
        return lesson, quiz, classroom, used_context

    def _resolve_mode(self, payload, lesson, quiz, classroom, layers):
        if lesson:
            return 'lesson_explainer'
        if quiz and (payload.get('question_context') or classroom):
            return 'quiz_remediation'
        if layers or payload.get('selected_feature') or payload.get('map_state'):
            return 'map_explainer'
        if payload.get('module_code'):
            return 'module_summary'
        return 'semester_review'

    def _get_lesson(self, lesson_id):
        if not lesson_id:
            return None
        lesson = Lesson.objects.prefetch_related('steps', 'layers').filter(id=lesson_id).first()
        self._validate_record_curriculum(lesson)
        return lesson

    def _get_quiz(self, quiz_id):
        if not quiz_id:
            return None
        quiz = Quiz.objects.prefetch_related('questions__answers').filter(id=quiz_id).first()
        self._validate_record_curriculum(quiz)
        return quiz

    def _get_classroom(self, classroom_id):
        if not classroom_id:
            return None
        classroom = Classroom.objects.filter(id=classroom_id).first()
        self._validate_record_curriculum(classroom)
        return classroom

    def _get_layers(self, layer_ids):
        layers = list(MapLayer.objects.filter(id__in=layer_ids))
        for layer in layers:
            if layer.grade and layer.grade != CURRICULUM_GUARDRAILS['grade_level']:
                raise AiTutorContextError('Có lớp bản đồ không thuộc lớp 10 trong ngữ cảnh hiện tại.')
        return layers

    def _validate_record_curriculum(self, record):
        if not record:
            return
        if getattr(record, 'grade_level', None) != CURRICULUM_GUARDRAILS['grade_level']:
            raise AiTutorContextError('Ngữ cảnh hiện tại không thuộc lớp 10.')
        if getattr(record, 'semester', None) != CURRICULUM_GUARDRAILS['semester']:
            raise AiTutorContextError('Ngữ cảnh hiện tại không thuộc học kì 1.')
        if getattr(record, 'textbook_series', None) != CURRICULUM_GUARDRAILS['textbook_series']:
            raise AiTutorContextError('Ngữ cảnh hiện tại không thuộc bộ Cánh Diều.')

    def _lesson_context(self, lesson, lesson_step):
        steps = list(lesson.steps.all().order_by('order'))
        current_step = None
        if lesson_step is not None:
            try:
                step_index = int(lesson_step)
            except (TypeError, ValueError):
                step_index = None
            if step_index is not None and 0 <= step_index < len(steps):
                current_step = steps[step_index]

        return {
            'id': lesson.id,
            'title': lesson.title,
            'description': lesson.description,
            'module_code': lesson.module_code,
            'lesson_type': lesson.lesson_type,
            'step_count': len(steps),
            'current_step': {
                'order': current_step.order,
                'popup_text': current_step.popup_text,
            } if current_step else None,
            'steps': [{'order': step.order, 'popup_text': step.popup_text} for step in steps[:8]],
            'layer_names': [layer.name for layer in lesson.layers.all()],
        }

    def _quiz_context(self, quiz, payload):
        return {
            'id': quiz.id,
            'title': quiz.title,
            'description': quiz.description,
            'module_code': quiz.module_code,
            'question_count': quiz.questions.count(),
            'question_context': payload.get('question_context') or [],
        }

    def _classroom_context(self, classroom):
        return {
            'id': classroom.id,
            'name': classroom.name,
            'module_code': classroom.module_code,
        }

    def _layer_context(self, layer):
        return {
            'id': layer.id,
            'name': layer.name,
            'geometry_type': layer.geom_type,
            'school_level': layer.school,
            'grade_level': layer.grade,
        }

    def _module_summary(self, payload):
        module_code = payload.get('module_code') or ''
        if not module_code:
            return None

        lessons = list(
            Lesson.objects.filter(
                grade_level=CURRICULUM_GUARDRAILS['grade_level'],
                semester=CURRICULUM_GUARDRAILS['semester'],
                textbook_series=CURRICULUM_GUARDRAILS['textbook_series'],
                module_code=module_code,
                is_published=True,
            ).prefetch_related('layers')[:8]
        )
        quizzes = list(
            Quiz.objects.filter(
                grade_level=CURRICULUM_GUARDRAILS['grade_level'],
                semester=CURRICULUM_GUARDRAILS['semester'],
                textbook_series=CURRICULUM_GUARDRAILS['textbook_series'],
                module_code=module_code,
            )[:8]
        )

        return {
            'module_code': module_code,
            'lesson_count': len(lessons),
            'quiz_count': len(quizzes),
            'lessons': [
                {
                    'id': lesson.id,
                    'title': lesson.title,
                    'description': lesson.description,
                    'lesson_type': lesson.lesson_type,
                    'layer_names': [layer.name for layer in lesson.layers.all()[:6]],
                }
                for lesson in lessons
            ],
            'quiz_titles': [quiz.title for quiz in quizzes],
        }

    def _semester_summary(self, payload):
        lessons = list(
            Lesson.objects.filter(
                grade_level=payload['grade_level'],
                semester=payload['semester'],
                textbook_series=payload['textbook_series'],
                is_published=True,
            ).order_by('module_code', 'id')[:20]
        )

        modules = {}
        for lesson in lessons:
            module_key = lesson.module_code or 'khong-phan-module'
            modules.setdefault(module_key, []).append(lesson.title)

        return {
            'lesson_count': len(lessons),
            'module_count': len(modules),
            'modules': [
                {
                    'module_code': module_code,
                    'lesson_titles': titles[:6],
                }
                for module_code, titles in modules.items()
            ],
        }


def build_prompt(message, used_context):
    mode = used_context.get('mode')
    mode_instruction = {
        'lesson_explainer': 'Tập trung giải thích bài học hiện tại và các bước trong bài.',
        'map_explainer': 'Tập trung giải thích lớp bản đồ, đối tượng đang chọn và ý nghĩa quan sát trên bản đồ.',
        'quiz_remediation': 'Tập trung giải thích vì sao học sinh sai và gợi ý cách tự sửa.',
        'module_summary': 'Tập trung tóm tắt module hiện tại, các ý chính và cách học module này.',
        'semester_review': 'Tập trung ôn tập học kì 1, nhóm kiến thức theo mạch nội dung lớn.',
    }.get(mode, 'Trả lời bám sát ngữ cảnh học tập hiện tại.')

    system_prompt = (
        'Bạn là trợ giảng Địa lí THPT cho học sinh. '
        'Hiện tại bạn chỉ hỗ trợ lớp 10, học kì 1, bộ Cánh Diều. '
        'Chỉ dùng ngữ cảnh được cung cấp. Không bịa dữ liệu địa lí, bản đồ, lớp học, hay quiz. '
        'Ưu tiên giải thích ngắn, dễ hiểu, có cấu trúc rõ ràng. '
        'Không đưa đáp án thẳng nếu học sinh đang hỏi bài học hoặc quiz; hãy gợi mở trước. '
        'Nếu thiếu dữ liệu thì nói rõ phần nào đang thiếu. '
        f'{mode_instruction}'
    )
    user_prompt = (
        f'Ngữ cảnh hiện tại: {used_context}\n\n'
        f'Câu hỏi của học sinh: {message}\n\n'
        'Hãy trả lời bằng tiếng Việt, ưu tiên 2-4 đoạn ngắn. '
        'Chỉ dùng markdown nhẹ: in đậm vừa đủ, gạch đầu dòng khi thật sự hữu ích. '
        'Không lạm dụng dấu sao. Nếu phù hợp, kết thúc bằng 1 câu hỏi gợi mở để học sinh tự nghĩ tiếp.'
    )
    return [
        {'role': 'system', 'content': system_prompt},
        {'role': 'user', 'content': user_prompt},
    ]


def build_followups(used_context):
    mode = used_context.get('mode')
    prompts = []
    if mode == 'lesson_explainer':
        prompts.extend([
            'Giải thích bài này bằng ngôn ngữ dễ hiểu hơn',
            'Tóm tắt bài này trong 3 ý chính',
        ])
    if mode == 'map_explainer':
        prompts.extend([
            'Bản đồ này cho em biết điều gì quan trọng nhất?',
            'Em nên quan sát lớp nào trước?',
        ])
    if mode == 'quiz_remediation':
        prompts.extend([
            'Gợi ý cho em cách ôn lại phần quiz này',
            'Cho em một cách nhớ nhanh kiến thức này',
        ])
    if mode == 'module_summary':
        prompts.extend([
            'Tóm tắt module này trong 5 ý ngắn',
            'Em nên học module này theo thứ tự nào?',
        ])
    if mode == 'semester_review':
        prompts.extend([
            'Ôn tập học kì 1 theo từng chủ đề lớn',
            'Chọn giúp em 3 bài cần ôn trước',
        ])
    return prompts[:3]
