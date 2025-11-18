#!/usr/bin/env python
"""
Simple API endpoint test using Django shell
Run inside Django container: docker exec webgis_backend python test_api_simple.py
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, '/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
import json

User = get_user_model()

# Create test client
client = Client()

print("=" * 80)
print("WebGIS API Testing (Django Test Client)")
print("=" * 80)

results = {"passed": 0, "failed": 0, "tests": []}

def test_endpoint(name, method, path, data=None, token=None, expected_status=200):
    """Test endpoint using Django test client"""
    try:
        headers = {}
        if token:
            headers['HTTP_AUTHORIZATION'] = f'Bearer {token}'

        if method == 'GET':
            response = client.get(path, **headers)
        elif method == 'POST':
            response = client.post(path, data=json.dumps(data) if data else None,
                                 content_type='application/json', **headers)

        success = response.status_code == expected_status

        if success:
            results["passed"] += 1
            print(f"✓ PASS: {name} ({response.status_code})")
        else:
            results["failed"] += 1
            print(f"✗ FAIL: {name} (Expected {expected_status}, got {response.status_code})")
            try:
                print(f"  Response: {response.content.decode()[:200]}")
            except:
                pass

        results["tests"].append({"name": name, "status": response.status_code, "success": success})
        return response
    except Exception as e:
        results["failed"] += 1
        print(f"✗ ERROR: {name} - {e}")
        results["tests"].append({"name": name, "error": str(e), "success": False})
        return None

# Test Authentication
print("\n--- Authentication Tests ---")
response = test_endpoint(
    "Admin Login",
    "POST",
    "/api/v1/auth/token/",
    data={"email": "admin@webgis.com", "password": "admin123"}
)
admin_token = None
if response and response.status_code == 200:
    try:
        admin_token = response.json().get("access")
        print(f"  Token: {admin_token[:30] if admin_token else 'None'}...")
    except:
        pass

response = test_endpoint(
    "Teacher Login",
    "POST",
    "/api/v1/auth/token/",
    data={"email": "teacher01@webgis.com", "password": "teacher123"}
)
teacher_token = None
if response and response.status_code == 200:
    try:
        teacher_token = response.json().get("access")
        print(f"  Token: {teacher_token[:30] if teacher_token else 'None'}...")
    except:
        pass

response = test_endpoint(
    "Student Login",
    "POST",
    "/api/v1/auth/token/",
    data={"email": "student01@webgis.com", "password": "student123"}
)
student_token = None
if response and response.status_code == 200:
    try:
        student_token = response.json().get("access")
        print(f"  Token: {student_token[:30] if student_token else 'None'}...")
    except:
        pass

test_endpoint(
    "Invalid Login",
    "POST",
    "/api/v1/auth/token/",
    data={"email": "invalid@test.com", "password": "wrong"},
    expected_status=401
)

# Test Profile
if admin_token:
    test_endpoint(
        "Admin Profile",
        "GET",
        "/api/v1/auth/profile/",
        token=admin_token
    )

# Test GIS Layers
print("\n--- GIS Layer Tests ---")
test_endpoint("List Layers", "GET", "/api/v1/layers/")
test_endpoint("Layer 1 Features", "GET", "/api/v1/layers/1/features/")
test_endpoint("Layer 2 Features", "GET", "/api/v1/layers/2/features/")
test_endpoint("Layer 3 Features", "GET", "/api/v1/layers/3/features/")

# Test Classrooms
print("\n--- Classroom Tests ---")
if teacher_token:
    response = test_endpoint(
        "List Classrooms (Teacher)",
        "GET",
        "/api/v1/classrooms/",
        token=teacher_token
    )

    # Get first classroom
    if response and response.status_code == 200:
        try:
            classrooms = response.json()
            if classrooms:
                cid = classrooms[0]["id"]
                test_endpoint(f"Classroom {cid} Details", "GET", f"/api/v1/classrooms/{cid}/", token=teacher_token)
                test_endpoint(f"Classroom {cid} Announcements", "GET", f"/api/v1/classrooms/{cid}/announcements/", token=teacher_token)
        except:
            pass

if student_token:
    test_endpoint(
        "List Classrooms (Student)",
        "GET",
        "/api/v1/classrooms/",
        token=student_token
    )

# Test Quizzes
print("\n--- Quiz Tests ---")
if teacher_token:
    response = test_endpoint(
        "List Quizzes (Teacher)",
        "GET",
        "/api/v1/quizzes/",
        token=teacher_token
    )

    if response and response.status_code == 200:
        try:
            quizzes = response.json()
            if quizzes:
                qid = quizzes[0]["id"]
                test_endpoint(f"Quiz {qid} Details", "GET", f"/api/v1/quizzes/{qid}/", token=teacher_token)
        except:
            pass

if student_token:
    test_endpoint("List Quizzes (Student)", "GET", "/api/v1/quizzes/", token=student_token)

# Summary
print("\n" + "=" * 80)
print("TEST SUMMARY")
print("=" * 80)
total = results["passed"] + results["failed"]
print(f"Total Tests: {total}")
print(f"Passed: {results['passed']}")
print(f"Failed: {results['failed']}")
if total > 0:
    print(f"Success Rate: {(results['passed'] / total * 100):.1f}%")
print("=" * 80)

# Print detailed results
print("\nDetailed Results:")
for test in results["tests"]:
    status = "✓" if test.get("success") else "✗"
    print(f"{status} {test['name']}")
    if "error" in test:
        print(f"  Error: {test['error']}")

sys.exit(0 if results["failed"] == 0 else 1)
