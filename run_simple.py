"""
Simple runner script for testing without Docker/PostGIS
"""
import os
import sys
import subprocess

def main():
    # Set Django settings module to simple
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.simple')

    print("=" * 60)
    print("WebGIS Backend - Simple Mode (SQLite)")
    print("=" * 60)

    # Check if db exists
    db_path = 'db.sqlite3'
    if not os.path.exists(db_path):
        print("\n1. Creating database...")
        subprocess.run([sys.executable, 'manage.py', 'migrate'], check=True)

        print("\n2. Creating superuser...")
        print("   Email: admin@example.com")
        print("   Password: admin123")
        subprocess.run([
            sys.executable, 'manage.py', 'createsuperuser',
            '--noinput',
            '--email', 'admin@example.com'
        ], env={**os.environ, 'DJANGO_SUPERUSER_PASSWORD': 'admin123'})

        print("\n3. Loading seed data...")
        subprocess.run([sys.executable, 'manage.py', 'seed_data'], check=True)

    print("\n" + "=" * 60)
    print("Starting development server...")
    print("Backend API: http://localhost:8000")
    print("Admin panel: http://localhost:8000/admin")
    print("API docs: http://localhost:8000/api/schema/swagger-ui/")
    print("=" * 60 + "\n")

    # Run server
    subprocess.run([sys.executable, 'manage.py', 'runserver'])

if __name__ == '__main__':
    main()
