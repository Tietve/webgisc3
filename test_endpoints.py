#!/usr/bin/env python
"""
WebGIS API Endpoint Testing Script
Tests authentication, GIS, classroom, and quiz endpoints
"""
import json
import sys
from datetime import datetime

try:
    import requests
except ImportError:
    print("ERROR: requests module not found. Install with: pip install requests")
    sys.exit(1)


BASE_URL = "http://localhost:8080/api/v1"
RESULTS = {
    "passed": 0,
    "failed": 0,
    "errors": [],
    "tests": []
}


def test_endpoint(name, method, url, data=None, headers=None, expected_status=200, auth_token=None):
    """Test a single endpoint"""
    try:
        if headers is None:
            headers = {"Content-Type": "application/json"}

        if auth_token:
            headers["Authorization"] = f"Bearer {auth_token}"

        if method == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=10)
        else:
            raise ValueError(f"Unsupported method: {method}")

        success = response.status_code == expected_status

        result = {
            "name": name,
            "method": method,
            "url": url,
            "status_code": response.status_code,
            "expected_status": expected_status,
            "success": success,
            "response_length": len(response.text),
            "response_preview": response.text[:200] if len(response.text) > 200 else response.text
        }

        if success:
            RESULTS["passed"] += 1
            print(f"✓ PASS: {name} ({response.status_code})")
        else:
            RESULTS["failed"] += 1
            print(f"✗ FAIL: {name} (Expected {expected_status}, got {response.status_code})")
            print(f"  Response: {response.text[:200]}")
            RESULTS["errors"].append(f"{name}: Expected {expected_status}, got {response.status_code}")

        RESULTS["tests"].append(result)
        return response

    except requests.exceptions.RequestException as e:
        RESULTS["failed"] += 1
        error_msg = f"{name}: {str(e)}"
        RESULTS["errors"].append(error_msg)
        print(f"✗ ERROR: {name} - {e}")
        RESULTS["tests"].append({
            "name": name,
            "method": method,
            "url": url,
            "success": False,
            "error": str(e)
        })
        return None


def main():
    print("=" * 80)
    print("WebGIS API Endpoint Testing")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    # Test 1: Authentication - Admin Login
    print("\n--- Authentication Tests ---")
    response = test_endpoint(
        "Admin Login",
        "POST",
        f"{BASE_URL}/auth/token/",
        data={"email": "admin@webgis.com", "password": "admin123"}
    )
    admin_token = None
    if response and response.status_code == 200:
        try:
            admin_token = response.json().get("access")
            print(f"  Token obtained: {admin_token[:20]}...")
        except:
            pass

    # Test 2: Teacher Login
    response = test_endpoint(
        "Teacher Login",
        "POST",
        f"{BASE_URL}/auth/token/",
        data={"email": "teacher01@webgis.com", "password": "teacher123"}
    )
    teacher_token = None
    if response and response.status_code == 200:
        try:
            teacher_token = response.json().get("access")
            print(f"  Token obtained: {teacher_token[:20]}...")
        except:
            pass

    # Test 3: Student Login
    response = test_endpoint(
        "Student Login",
        "POST",
        f"{BASE_URL}/auth/token/",
        data={"email": "student01@webgis.com", "password": "student123"}
    )
    student_token = None
    if response and response.status_code == 200:
        try:
            student_token = response.json().get("access")
            print(f"  Token obtained: {student_token[:20]}...")
        except:
            pass

    # Test 4: Invalid Login
    test_endpoint(
        "Invalid Login",
        "POST",
        f"{BASE_URL}/auth/token/",
        data={"email": "invalid@test.com", "password": "wrongpassword"},
        expected_status=401
    )

    # Test 5: User Profile (with auth)
    if admin_token:
        test_endpoint(
            "Admin Profile",
            "GET",
            f"{BASE_URL}/auth/profile/",
            auth_token=admin_token
        )

    # GIS Tests
    print("\n--- GIS Layer Tests ---")
    test_endpoint(
        "List Layers",
        "GET",
        f"{BASE_URL}/layers/"
    )

    test_endpoint(
        "Layer 1 Features (Points)",
        "GET",
        f"{BASE_URL}/layers/1/features/"
    )

    test_endpoint(
        "Layer 2 Features (Boundaries)",
        "GET",
        f"{BASE_URL}/layers/2/features/"
    )

    test_endpoint(
        "Layer 3 Features (Routes)",
        "GET",
        f"{BASE_URL}/layers/3/features/"
    )

    # Classroom Tests
    print("\n--- Classroom Tests ---")
    if teacher_token:
        response = test_endpoint(
            "List Classrooms (Teacher)",
            "GET",
            f"{BASE_URL}/classrooms/",
            auth_token=teacher_token
        )

        # Try to get classroom ID
        if response and response.status_code == 200:
            try:
                classrooms = response.json()
                if classrooms and len(classrooms) > 0:
                    classroom_id = classrooms[0]["id"]
                    print(f"  Found classroom ID: {classroom_id}")

                    # Test classroom details
                    test_endpoint(
                        f"Classroom {classroom_id} Details",
                        "GET",
                        f"{BASE_URL}/classrooms/{classroom_id}/",
                        auth_token=teacher_token
                    )

                    # Test classroom announcements
                    test_endpoint(
                        f"Classroom {classroom_id} Announcements",
                        "GET",
                        f"{BASE_URL}/classrooms/{classroom_id}/announcements/",
                        auth_token=teacher_token
                    )
            except:
                pass

    if student_token:
        test_endpoint(
            "List Classrooms (Student)",
            "GET",
            f"{BASE_URL}/classrooms/",
            auth_token=student_token
        )

    # Quiz Tests
    print("\n--- Quiz Tests ---")
    if teacher_token:
        response = test_endpoint(
            "List Quizzes (Teacher)",
            "GET",
            f"{BASE_URL}/quizzes/",
            auth_token=teacher_token
        )

        # Try to get quiz ID
        if response and response.status_code == 200:
            try:
                quizzes = response.json()
                if quizzes and len(quizzes) > 0:
                    quiz_id = quizzes[0]["id"]
                    print(f"  Found quiz ID: {quiz_id}")

                    # Test quiz details
                    test_endpoint(
                        f"Quiz {quiz_id} Details",
                        "GET",
                        f"{BASE_URL}/quizzes/{quiz_id}/",
                        auth_token=teacher_token
                    )
            except:
                pass

    if student_token:
        response = test_endpoint(
            "List Quizzes (Student)",
            "GET",
            f"{BASE_URL}/quizzes/",
            auth_token=student_token
        )

    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"Total Tests: {RESULTS['passed'] + RESULTS['failed']}")
    print(f"Passed: {RESULTS['passed']}")
    print(f"Failed: {RESULTS['failed']}")
    print(f"Success Rate: {(RESULTS['passed'] / (RESULTS['passed'] + RESULTS['failed']) * 100) if (RESULTS['passed'] + RESULTS['failed']) > 0 else 0:.1f}%")

    if RESULTS["errors"]:
        print(f"\nErrors ({len(RESULTS['errors'])}):")
        for error in RESULTS["errors"]:
            print(f"  - {error}")

    print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)

    # Save detailed results
    with open("test_results.json", "w") as f:
        json.dump(RESULTS, f, indent=2)
    print("\nDetailed results saved to: test_results.json")

    # Exit with appropriate code
    sys.exit(0 if RESULTS["failed"] == 0 else 1)


if __name__ == "__main__":
    main()
