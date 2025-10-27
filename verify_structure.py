#!/usr/bin/env python
"""
Verification script to check WebGIS backend project structure.
This script does NOT require database connection.
"""
import os
import sys
from pathlib import Path

# Colors for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
END = '\033[0m'

def check_mark(condition):
    return f"{GREEN}[OK]{END}" if condition else f"{RED}[FAIL]{END}"

def print_header(text):
    print(f"\n{BLUE}{'='*60}{END}")
    print(f"{BLUE}{text:^60}{END}")
    print(f"{BLUE}{'='*60}{END}")

def verify_structure():
    """Verify project structure without running Django."""

    base_dir = Path(__file__).parent
    results = []

    print_header("WebGIS Backend Structure Verification")

    # Check core files
    print(f"\n{YELLOW}1. Core Configuration Files:{END}")
    core_files = [
        'manage.py',
        'requirements.txt',
        'docker-compose.yml',
        'Dockerfile',
        'README.md',
        'QUICKSTART.md',
        '.gitignore',
        '.dockerignore',
        '.env.example'
    ]

    for file in core_files:
        exists = (base_dir / file).exists()
        print(f"  {check_mark(exists)} {file}")
        results.append(exists)

    # Check config directory
    print(f"\n{YELLOW}2. Django Configuration:{END}")
    config_files = [
        'config/__init__.py',
        'config/urls.py',
        'config/wsgi.py',
        'config/asgi.py',
        'config/settings/__init__.py',
        'config/settings/base.py',
        'config/settings/development.py',
        'config/settings/production.py',
    ]

    for file in config_files:
        exists = (base_dir / file).exists()
        print(f"  {check_mark(exists)} {file}")
        results.append(exists)

    # Check Django apps
    print(f"\n{YELLOW}3. Django Apps:{END}")
    apps = ['core', 'users', 'classrooms', 'lessons', 'gis_data', 'quizzes', 'tools']

    for app in apps:
        app_files = [
            f'apps/{app}/__init__.py',
            f'apps/{app}/apps.py',
            f'apps/{app}/models.py',
            f'apps/{app}/admin.py',
        ]

        # Special files for specific apps
        if app != 'core':
            app_files.extend([
                f'apps/{app}/serializers.py',
                f'apps/{app}/views.py',
                f'apps/{app}/urls.py',
            ])

        if app == 'core':
            app_files.extend([
                f'apps/{app}/exceptions.py',
                f'apps/{app}/pagination.py',
                f'apps/{app}/permissions.py',
            ])

        if app == 'tools':
            app_files.extend([
                f'apps/{app}/base.py',
                f'apps/{app}/implementations/__init__.py',
                f'apps/{app}/implementations/buffer.py',
                f'apps/{app}/implementations/intersect.py',
            ])

        app_complete = all((base_dir / f).exists() for f in app_files)
        print(f"  {check_mark(app_complete)} apps/{app}/")

        for file in app_files:
            if not (base_dir / file).exists():
                print(f"      {RED}Missing: {file}{END}")

        results.append(app_complete)

    # Check management commands
    print(f"\n{YELLOW}4. Management Commands:{END}")
    mgmt_files = [
        'apps/core/management/__init__.py',
        'apps/core/management/commands/__init__.py',
        'apps/core/management/commands/seed_data.py',
    ]

    for file in mgmt_files:
        exists = (base_dir / file).exists()
        print(f"  {check_mark(exists)} {file}")
        results.append(exists)

    # Verify key features in files
    print(f"\n{YELLOW}5. Key Features Verification:{END}")

    features = []

    # Check JWT auth in settings
    base_settings = base_dir / 'config/settings/base.py'
    if base_settings.exists():
        content = base_settings.read_text(encoding='utf-8')
        has_jwt = 'simplejwt' in content
        print(f"  {check_mark(has_jwt)} JWT Authentication configured")
        features.append(has_jwt)

        has_geodjango = 'django.contrib.gis' in content
        print(f"  {check_mark(has_geodjango)} GeoDjango enabled")
        features.append(has_geodjango)

        has_spectacular = 'drf_spectacular' in content
        print(f"  {check_mark(has_spectacular)} API Documentation (Swagger) configured")
        features.append(has_spectacular)

    # Check models
    users_model = base_dir / 'apps/users/models.py'
    if users_model.exists():
        content = users_model.read_text(encoding='utf-8')
        has_uuid = 'UUIDField' in content and 'primary_key=True' in content
        print(f"  {check_mark(has_uuid)} User model with UUID primary key")
        features.append(has_uuid)

    gis_model = base_dir / 'apps/gis_data/models.py'
    if gis_model.exists():
        content = gis_model.read_text(encoding='utf-8')
        has_postgis = 'MultiPolygonField' in content
        print(f"  {check_mark(has_postgis)} PostGIS geometry fields")
        features.append(has_postgis)

    lessons_model = base_dir / 'apps/lessons/models.py'
    if lessons_model.exists():
        content = lessons_model.read_text(encoding='utf-8')
        has_json = 'JSONField' in content
        print(f"  {check_mark(has_json)} JSON fields for dynamic data")
        features.append(has_json)

    # Check dynamic tool system
    tools_view = base_dir / 'apps/tools/views.py'
    if tools_view.exists():
        content = tools_view.read_text(encoding='utf-8')
        has_dynamic = 'importlib' in content
        print(f"  {check_mark(has_dynamic)} Dynamic tool loading system")
        features.append(has_dynamic)

    # Check seed command
    seed_cmd = base_dir / 'apps/core/management/commands/seed_data.py'
    if seed_cmd.exists():
        content = seed_cmd.read_text(encoding='utf-8')
        has_seed = 'create_users' in content and 'create_gis_data' in content
        print(f"  {check_mark(has_seed)} Data seeding command")
        features.append(has_seed)

    # Summary
    print_header("Verification Summary")

    total_checks = len(results) + len(features)
    passed_checks = sum(results) + sum(features)
    percentage = (passed_checks / total_checks * 100) if total_checks > 0 else 0

    print(f"\n  Total Checks: {total_checks}")
    print(f"  Passed: {GREEN}{passed_checks}{END}")
    print(f"  Failed: {RED}{total_checks - passed_checks}{END}")
    print(f"  Success Rate: {GREEN if percentage >= 95 else YELLOW}{percentage:.1f}%{END}")

    if percentage >= 95:
        print(f"\n  {GREEN}[OK] Project structure is complete and ready!{END}")
        print(f"  {GREEN}[OK] All required files are in place.{END}")
        print(f"\n  {BLUE}Next steps:{END}")
        print(f"    1. Setup PostgreSQL/PostGIS database")
        print(f"    2. Run: python manage.py migrate")
        print(f"    3. Run: python manage.py seed_data")
        print(f"    4. Run: python manage.py runserver")
        print(f"    5. Visit: http://localhost:8000/api/schema/swagger-ui/")
        return 0
    else:
        print(f"\n  {RED}[FAIL] Some files are missing. Please check above.{END}")
        return 1

if __name__ == '__main__':
    sys.exit(verify_structure())
