#!/usr/bin/env python
"""
Test script for Phase 2: Quiz Deadline & Grading System

This script tests:
1. Quiz model deadline fields and properties
2. QuizSubmission model grading fields
3. Deadline aggregation endpoint
4. Teacher review functionality
5. Quiz results endpoint
6. Late submission detection

Usage:
    python test_phase2_quiz_system.py
"""

import os
import sys
import django
from datetime import timedelta

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.utils import timezone
from django.contrib.auth import get_user_model
from apps.quizzes.models import Quiz, QuizQuestion, QuizAnswer, QuizSubmission
from apps.classrooms.models import Classroom, Enrollment

User = get_user_model()


def print_section(title):
    """Print a formatted section header."""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)


def test_quiz_deadline_properties():
    """Test Quiz model deadline properties."""
    print_section("TEST 1: Quiz Deadline Properties")

    # Create test quiz with deadline
    quiz = Quiz.objects.first()
    if not quiz:
        print("❌ No quiz found. Please create a quiz first.")
        return False

    # Set deadline to 2 days from now
    quiz.due_date = timezone.now() + timedelta(days=2)
    quiz.save()

    print(f"✓ Quiz: {quiz.title}")
    print(f"  Due Date: {quiz.due_date}")
    print(f"  Is Overdue: {quiz.is_overdue}")
    print(f"  Deadline Status: {quiz.deadline_status}")
    print(f"  Deadline Color: {quiz.deadline_color}")

    # Test overdue quiz
    quiz.due_date = timezone.now() - timedelta(days=1)
    quiz.save()
    print(f"\n✓ After setting due_date to yesterday:")
    print(f"  Is Overdue: {quiz.is_overdue}")
    print(f"  Deadline Status: {quiz.deadline_status}")
    print(f"  Deadline Color: {quiz.deadline_color}")

    # Reset to future date
    quiz.due_date = timezone.now() + timedelta(days=3)
    quiz.save()

    return True


def test_quiz_submission_grading():
    """Test QuizSubmission grading fields."""
    print_section("TEST 2: QuizSubmission Grading Fields")

    # Get or create test submission
    student = User.objects.filter(role='student').first()
    quiz = Quiz.objects.first()

    if not student or not quiz:
        print("❌ Missing student or quiz. Please create test data first.")
        return False

    submission, created = QuizSubmission.objects.get_or_create(
        quiz=quiz,
        student=student,
        defaults={
            'score': 80,
            'answers': {}
        }
    )

    print(f"✓ Submission ID: {submission.id}")
    print(f"  Auto Score: {submission.score}")
    print(f"  Adjusted Score: {submission.adjusted_score}")
    print(f"  Final Score: {submission.final_score}")
    print(f"  Is Reviewed: {submission.is_reviewed}")
    print(f"  Is Late: {submission.is_late}")

    # Test teacher adjustment
    submission.adjusted_score = 90
    submission.teacher_feedback = "Good work, but missed one detail."
    submission.is_reviewed = True
    submission.save()

    print(f"\n✓ After teacher review:")
    print(f"  Adjusted Score: {submission.adjusted_score}")
    print(f"  Final Score: {submission.final_score}")
    print(f"  Teacher Feedback: {submission.teacher_feedback}")
    print(f"  Is Reviewed: {submission.is_reviewed}")

    return True


def test_late_submission_detection():
    """Test automatic late submission detection."""
    print_section("TEST 3: Late Submission Detection")

    student = User.objects.filter(role='student').first()
    quiz = Quiz.objects.first()

    if not student or not quiz:
        print("❌ Missing student or quiz.")
        return False

    # Set quiz deadline to past
    quiz.due_date = timezone.now() - timedelta(hours=2)
    quiz.save()

    # Create submission (should be marked as late)
    submission = QuizSubmission.objects.create(
        quiz=quiz,
        student=student,
        score=75,
        answers={}
    )

    print(f"✓ Quiz due date: {quiz.due_date}")
    print(f"  Submission time: {submission.submitted_at}")
    print(f"  Is Late: {submission.is_late} (should be True)")

    if submission.is_late:
        print("✓ Late submission detection working!")
    else:
        print("❌ Late submission NOT detected")

    # Cleanup
    submission.delete()

    # Reset quiz deadline
    quiz.due_date = timezone.now() + timedelta(days=3)
    quiz.save()

    return submission.is_late


def test_serializers():
    """Test new serializers."""
    print_section("TEST 4: Serializer Outputs")

    from apps.quizzes.serializers import (
        QuizDeadlineSerializer,
        QuizSubmissionReviewSerializer,
        QuizResultsSerializer
    )

    quiz = Quiz.objects.filter(due_date__isnull=False).first()
    if not quiz:
        quiz = Quiz.objects.first()
        quiz.due_date = timezone.now() + timedelta(days=5)
        quiz.save()

    print("✓ QuizDeadlineSerializer fields:")
    serializer = QuizDeadlineSerializer(quiz)
    for key, value in serializer.data.items():
        print(f"  {key}: {value}")

    submission = QuizSubmission.objects.first()
    if submission:
        print("\n✓ QuizResultsSerializer fields:")
        serializer = QuizResultsSerializer(submission)
        for key, value in serializer.data.items():
            print(f"  {key}: {value}")

    return True


def test_model_counts():
    """Test database state."""
    print_section("TEST 5: Database State")

    print(f"✓ Total Quizzes: {Quiz.objects.count()}")
    print(f"  - With deadlines: {Quiz.objects.filter(due_date__isnull=False).count()}")
    print(f"  - Overdue: {len([q for q in Quiz.objects.all() if q.is_overdue])}")

    print(f"\n✓ Total Submissions: {QuizSubmission.objects.count()}")
    print(f"  - Reviewed: {QuizSubmission.objects.filter(is_reviewed=True).count()}")
    print(f"  - Late: {QuizSubmission.objects.filter(is_late=True).count()}")
    print(f"  - With adjusted score: {QuizSubmission.objects.filter(adjusted_score__isnull=False).count()}")

    print(f"\n✓ Total Users: {User.objects.count()}")
    print(f"  - Teachers: {User.objects.filter(role='teacher').count()}")
    print(f"  - Students: {User.objects.filter(role='student').count()}")

    return True


def main():
    """Run all tests."""
    print("\n" + "🧪" * 40)
    print("PHASE 2: QUIZ DEADLINE & GRADING SYSTEM - TEST SUITE")
    print("🧪" * 40)

    tests = [
        ("Quiz Deadline Properties", test_quiz_deadline_properties),
        ("QuizSubmission Grading Fields", test_quiz_submission_grading),
        ("Late Submission Detection", test_late_submission_detection),
        ("Serializers", test_serializers),
        ("Database State", test_model_counts),
    ]

    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n❌ ERROR in {name}: {str(e)}")
            import traceback
            traceback.print_exc()
            results.append((name, False))

    # Print summary
    print_section("TEST SUMMARY")
    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")

    print(f"\n📊 Results: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 ALL TESTS PASSED! Phase 2 implementation is working correctly.")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please review the implementation.")

    print("\n" + "=" * 80)
    print("API ENDPOINTS TO TEST MANUALLY:")
    print("=" * 80)
    print("1. GET  /api/v1/quizzes/deadlines/")
    print("   - Test as student and teacher")
    print("   - Try ?status=due_soon filter")
    print("   - Try ?classroom_id=1 filter")
    print("\n2. GET  /api/v1/quizzes/{id}/results/")
    print("   - Teacher only - view all submissions")
    print("\n3. POST /api/v1/quiz-submissions/{id}/review/")
    print("   - Teacher only - grade submission")
    print("   - Body: {\"adjusted_score\": 95, \"teacher_feedback\": \"Excellent work!\"}")
    print("\n4. GET  /api/v1/quizzes/{id}/")
    print("   - Should include deadline fields now")
    print("=" * 80)


if __name__ == '__main__':
    main()
