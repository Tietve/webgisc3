#!/bin/bash
# Complete setup script for PostGIS

echo "🚀 Starting PostGIS Setup..."

# Wait for database
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Run migrations
echo "📦 Running migrations..."
python manage.py makemigrations
python manage.py migrate

# Create demo users
echo "👥 Creating demo users..."
python create_demo_users.py

# Import provinces
echo "🗺️  Importing Vietnam provinces..."
python manage.py import_provinces

echo "✅ PostGIS setup complete!"
echo ""
echo "🌐 Access the application:"
echo "   Backend API: http://localhost:8080"
echo "   Django Admin: http://localhost:8080/admin"
echo "   Frontend: http://localhost:3001"
echo ""
echo "👤 Demo accounts:"
echo "   Admin: admin@example.com / admin123"
echo "   Teacher: teacher@example.com / teacher123"
echo "   Student: student@example.com / student123"
