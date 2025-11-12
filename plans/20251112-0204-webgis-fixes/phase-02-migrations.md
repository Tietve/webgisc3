# Phase 02: Database Migrations

**Date**: 2025-11-12
**Phase**: 2 of 4
**Priority**: P1 HIGH
**Status**: NOT STARTED
**Estimated Time**: 20 minutes

---

## Context Links

- Research: [Migration Strategy](./research/researcher-02-migration-strategy.md)
- Previous Phase: [Phase 01 - GDAL Setup](./phase-01-gdal-setup.md)
- Migration File: `D:\Webgis\apps\classrooms\migrations\0003_alter_classroom_teacher_alter_enrollment_student_and_more.py`
- Models: `D:\Webgis\apps\classrooms\models.py`

---

## Overview

Apply pending migration 0003 that creates the Announcement model and updates foreign key relationships. This migration is low-risk (additive only) but blocked by GDAL issue resolved in Phase 01.

**What Changed**:
- Added Announcement model (new table)
- Updated help_text on Classroom and Enrollment models (Django-only, no DB change)

---

## Key Insights from Research

1. Migration 0003 is low-risk - only adds new table
2. No data deletion or schema-breaking changes
3. help_text changes don't affect database schema
4. Rollback is trivial (drop announcements table)
5. No database backup needed for development
6. Execution time < 1 second

---

## Requirements

### Prerequisites

- Phase 01 completed (Docker services running)
- GDAL library available in Django container
- Database accepting connections
- `python manage.py check` passes

### Dependencies

- Migration 0001: Initial models (applied)
- Migration 0002: Relationships (applied)
- AUTH_USER_MODEL: users.User (exists)

---

## Architecture

```
Django ORM
│
├── Migration 0001 (APPLIED)
│   └── Creates Classroom, Enrollment models
│
├── Migration 0002 (APPLIED)
│   └── Sets up relationships
│
└── Migration 0003 (PENDING) ← This Phase
    ├── Adds Announcement model
    │   ├── id (BigAutoField)
    │   ├── content (TextField)
    │   ├── created_at (DateTimeField)
    │   ├── updated_at (DateTimeField)
    │   ├── author_id (ForeignKey → users.User)
    │   └── classroom_id (ForeignKey → classrooms.Classroom)
    │
    └── Updates help_text (metadata only)

PostgreSQL Database
└── webgis_db
    ├── users (existing)
    ├── classrooms (existing)
    ├── enrollments (existing)
    └── announcements (NEW)
```

---

## Related Code Files

### Migration Files

- `D:\Webgis\apps\classrooms\migrations\0003_alter_classroom_teacher_alter_enrollment_student_and_more.py` - Target migration

### Models

- `D:\Webgis\apps\classrooms\models.py` - Announcement model definition
- `D:\Webgis\apps\users\models.py` - User model (referenced)

### Configuration

- `D:\Webgis\config\settings\base.py` - Database backend config
- `D:\Webgis\docker-compose.yml` - Database service

---

## Implementation Steps

### 1. Verify Prerequisites

```powershell
# Check Docker services running
docker-compose ps

# Expected output:
# webgis_backend    Up      8080->8000
# webgis_postgis    Up      5433->5432

# Check Django can connect
docker exec webgis_backend python manage.py check --database default

# Expected output:
# System check identified no issues (0 silenced).
```

### 2. Check Migration Status

```powershell
# View all migrations
docker exec webgis_backend python manage.py showmigrations

# Expected output (classrooms app):
# classrooms
#  [X] 0001_initial
#  [X] 0002_initial
#  [ ] 0003_alter_classroom_teacher_alter_enrollment_student_and_more

# Check specifically classrooms app
docker exec webgis_backend python manage.py showmigrations classrooms
```

### 3. Review Migration Plan

```powershell
# Show what migration will do (dry run)
docker exec webgis_backend python manage.py migrate classrooms 0003 --plan

# Expected output:
# Planned operations:
# classrooms.0003_alter_classroom_teacher_alter_enrollment_student_and_more
#     Alter field teacher on classroom
#     Alter field student on enrollment
#     Create model Announcement
```

### 4. Apply Migration

```powershell
# Run migration
docker exec webgis_backend python manage.py migrate classrooms

# Expected output:
# Running migrations:
#   Applying classrooms.0003_alter_classroom_teacher_alter_enrollment_student_and_more... OK
```

### 5. Verify Migration Applied

```powershell
# Check migration status again
docker exec webgis_backend python manage.py showmigrations classrooms

# Expected output:
# classrooms
#  [X] 0001_initial
#  [X] 0002_initial
#  [X] 0003_alter_classroom_teacher_alter_enrollment_student_and_more

# Check all apps
docker exec webgis_backend python manage.py migrate --check

# Expected output:
# System check identified no issues (0 silenced).
```

### 6. Verify Database Schema

```powershell
# Access database shell
docker exec -it webgis_postgis psql -U webgis_user -d webgis_db

# Check announcements table exists
\d announcements

# Expected output:
# Table "public.announcements"
#  Column      |           Type           | Nullable | Default
# -------------+--------------------------+----------+---------
#  id          | bigint                   | not null | nextval(...)
#  content     | text                     | not null |
#  created_at  | timestamp with time zone | not null |
#  updated_at  | timestamp with time zone | not null |
#  author_id   | bigint                   | not null |
#  classroom_id| bigint                   | not null |

# Check foreign keys
\d+ announcements

# Expected: Foreign key constraints to users and classrooms

# List all classrooms app tables
\dt classrooms*

# Exit psql
\q
```

### 7. Test Model in Django Shell

```powershell
# Open Django shell
docker exec -it webgis_backend python manage.py shell
```

```python
# Test Announcement model import
from apps.classrooms.models import Announcement, Classroom
from apps.users.models import User

# Check model registered
print(Announcement._meta.db_table)  # Should print: announcements

# Check fields
for field in Announcement._meta.get_fields():
    print(f"{field.name}: {field.__class__.__name__}")

# Expected:
# id: BigAutoField
# content: TextField
# created_at: DateTimeField
# updated_at: DateTimeField
# author: ForeignKey
# classroom: ForeignKey

# Test querying (should be empty)
count = Announcement.objects.count()
print(f"Announcements: {count}")  # Should print: 0

# Exit shell
exit()
```

### 8. Test Creating Announcement (Optional)

```powershell
# Create test data via shell
docker exec -it webgis_backend python manage.py shell
```

```python
from apps.classrooms.models import Announcement, Classroom
from apps.users.models import User

# Get first teacher and classroom
teacher = User.objects.filter(role='teacher').first()
classroom = Classroom.objects.first()

# If no data exists, skip this test
if teacher and classroom:
    # Create announcement
    announcement = Announcement.objects.create(
        classroom=classroom,
        author=teacher,
        content="Test announcement from migration test"
    )

    print(f"Created: {announcement.id}")
    print(f"Created at: {announcement.created_at}")
    print(f"Author: {announcement.author.username}")
    print(f"Classroom: {announcement.classroom.name}")

    # Test relationships
    print(f"Classroom announcements: {classroom.announcements.count()}")
    print(f"Author announcements: {teacher.announcements.count()}")

    # Clean up test data
    announcement.delete()
    print("Test data cleaned up")
else:
    print("No teacher or classroom data - skipping creation test")

exit()
```

### 9. Verify API Endpoint (if exists)

```powershell
# Check if announcements URL exists
docker exec webgis_backend python manage.py show_urls | Select-String "announcement"

# Expected output (if endpoint configured):
# /api/v1/classrooms/<id>/announcements/

# Test endpoint (requires auth)
# Will do in Phase 03 during integration testing
```

### 10. Check Django Admin

```powershell
# Create superuser if not exists
docker exec -it webgis_backend python manage.py createsuperuser

# Username: admin
# Email: admin@webgis.com
# Password: admin123 (dev only)

# Open admin in browser
Start-Process "http://localhost:8080/admin/"

# Login with superuser credentials
# Navigate to Classrooms > Announcements
# Should see "Announcements" model listed
```

---

## Todo List

- [ ] Verify Docker services running and healthy
- [ ] Check Django database connection works
- [ ] Review current migration status
- [ ] Run migration plan (dry run)
- [ ] Apply migration 0003
- [ ] Verify migration marked as applied
- [ ] Check announcements table in database
- [ ] Verify table schema (columns, foreign keys)
- [ ] Test Announcement model import in shell
- [ ] Test model field access
- [ ] Verify empty queryset works
- [ ] Create test announcement (optional)
- [ ] Test relationships work (optional)
- [ ] Clean up test data (if created)
- [ ] Create superuser for admin access
- [ ] Verify Announcement in Django admin
- [ ] Document migration success

---

## Success Criteria

Phase complete when:

1. Migration 0003 shows as applied in `showmigrations`
2. `announcements` table exists in database
3. Table has correct schema (6 columns)
4. Foreign keys properly configured
5. Announcement model imports without errors
6. Can query Announcement.objects.count()
7. Announcement visible in Django admin
8. No migration warnings in `migrate --check`

---

## Verification Commands

```powershell
# 1. Migration applied
docker exec webgis_backend python manage.py showmigrations classrooms | Select-String "0003"

# Expected: [X] 0003_alter_classroom...

# 2. No pending migrations
docker exec webgis_backend python manage.py migrate --check

# Expected: No output (all applied)

# 3. Table exists
docker exec webgis_postgis psql -U webgis_user -d webgis_db -c "\d announcements"

# 4. Model imports
docker exec webgis_backend python -c "from apps.classrooms.models import Announcement; print('OK')"

# 5. Can query
docker exec webgis_backend python manage.py shell -c "from apps.classrooms.models import Announcement; print(Announcement.objects.count())"
```

---

## Risk Assessment

### Risks and Mitigations

**Risk 1**: Migration fails due to missing User model
- **Probability**: Very Low (users app exists)
- **Impact**: High (can't create foreign key)
- **Mitigation**:
  - Verify users app migrations applied
  - Check AUTH_USER_MODEL setting
  - Rollback if fails (automatic)

**Risk 2**: Foreign key constraint violation
- **Probability**: Very Low (no data exists yet)
- **Impact**: Medium (migration blocked)
- **Mitigation**:
  - Fresh database (no conflicting data)
  - Rollback and investigate

**Risk 3**: Database connection lost during migration
- **Probability**: Low
- **Impact**: Medium (partial migration)
- **Mitigation**:
  - Django auto-rollback on failure
  - Transaction-safe migration
  - Re-run migration if needed

**Risk 4**: Migration applied but table not created
- **Probability**: Very Low
- **Impact**: High (app won't work)
- **Mitigation**:
  - Verify table with psql
  - Check migration history
  - Manual rollback and reapply

---

## Security Considerations

### Data Exposure

- Announcements contain user-generated content
- Foreign keys link to User table (PII)
- created_at/updated_at reveal activity patterns

### Access Control

- Implement permission checks in views
- Teachers can create announcements
- Students can only read
- Proper CASCADE behavior on delete

### Validation

- Sanitize announcement content (XSS prevention)
- Limit content length in serializer
- Rate limit creation endpoint

---

## Troubleshooting

### Issue: Migration fails with "relation already exists"

**Symptoms**: `django.db.utils.ProgrammingError: relation "announcements" already exists`

**Cause**: Table created manually or migration applied but not recorded

**Solutions**:
```powershell
# 1. Check if table exists
docker exec webgis_postgis psql -U webgis_user -d webgis_db -c "\d announcements"

# 2. If exists and matches schema, fake migration
docker exec webgis_backend python manage.py migrate classrooms 0003 --fake

# 3. If schema wrong, drop and reapply
docker exec webgis_postgis psql -U webgis_user -d webgis_db -c "DROP TABLE announcements CASCADE;"
docker exec webgis_backend python manage.py migrate classrooms 0003
```

### Issue: Foreign key constraint fails

**Symptoms**: `django.db.utils.IntegrityError: foreign key constraint fails`

**Cause**: Referenced table doesn't exist or has wrong name

**Solutions**:
```powershell
# 1. Check User table exists
docker exec webgis_postgis psql -U webgis_user -d webgis_db -c "\d users"

# 2. Check Classroom table exists
docker exec webgis_postgis psql -U webgis_user -d webgis_db -c "\d classrooms"

# 3. Check AUTH_USER_MODEL setting
docker exec webgis_backend python manage.py shell -c "from django.conf import settings; print(settings.AUTH_USER_MODEL)"

# Expected: users.User
```

### Issue: Migration shows applied but table missing

**Symptoms**: Showmigrations shows [X] but table doesn't exist

**Cause**: Migration rolled back but history not updated

**Solutions**:
```powershell
# 1. Unapply migration
docker exec webgis_backend python manage.py migrate classrooms 0002

# 2. Reapply
docker exec webgis_backend python manage.py migrate classrooms 0003

# 3. If still fails, check migration file
docker exec webgis_backend cat apps/classrooms/migrations/0003_alter_classroom_teacher_alter_enrollment_student_and_more.py
```

---

## Rollback Plan

If migration causes issues:

### Rollback to 0002

```powershell
# 1. Unapply migration
docker exec webgis_backend python manage.py migrate classrooms 0002

# Expected output:
# Unapplying classrooms.0003... OK

# 2. Verify announcements table dropped
docker exec webgis_postgis psql -U webgis_user -d webgis_db -c "\d announcements"

# Expected: relation "announcements" does not exist

# 3. Check migration status
docker exec webgis_backend python manage.py showmigrations classrooms

# Expected: [ ] 0003...
```

### Manual Table Removal

```powershell
# If rollback fails, manually drop table
docker exec webgis_postgis psql -U webgis_user -d webgis_db -c "DROP TABLE IF EXISTS announcements CASCADE;"

# Then mark migration as unapplied
docker exec webgis_backend python manage.py migrate classrooms 0002 --fake
```

---

## Performance Considerations

### Migration Execution

- **Duration**: < 1 second (single CREATE TABLE)
- **Locks**: Brief table-level lock
- **Downtime**: None (dev environment)
- **Impact**: Zero (no existing data)

### Query Performance

- **Indexes**: Auto-created on foreign keys
- **created_at ordering**: Add index if needed
- **Pagination**: Required for large datasets

### Optimization

```sql
-- If many announcements, add index:
CREATE INDEX idx_announcements_created ON announcements(created_at DESC);

-- If filtering by classroom frequently:
-- Already indexed via foreign key

-- If filtering by author:
-- Already indexed via foreign key
```

---

## Next Steps

After this phase completes:

1. **Phase 03**: Test frontend-backend integration
   - Test authentication flow
   - Test classroom creation
   - Test announcement API endpoints

2. **Phase 04**: Clean up frontend directories

Dependencies for Phase 03:
- All migrations applied
- Database schema complete
- Models accessible via API
- Django backend running

---

## Quick Reference

### Migration Commands

```powershell
# Show migration status
docker exec webgis_backend python manage.py showmigrations

# Apply all pending migrations
docker exec webgis_backend python manage.py migrate

# Apply specific app migrations
docker exec webgis_backend python manage.py migrate classrooms

# Apply specific migration
docker exec webgis_backend python manage.py migrate classrooms 0003

# Rollback to specific migration
docker exec webgis_backend python manage.py migrate classrooms 0002

# Show plan (dry run)
docker exec webgis_backend python manage.py migrate --plan

# Check for unapplied migrations
docker exec webgis_backend python manage.py migrate --check

# Fake apply (mark as applied without running)
docker exec webgis_backend python manage.py migrate classrooms 0003 --fake
```

### Database Commands

```powershell
# Access database
docker exec -it webgis_postgis psql -U webgis_user -d webgis_db

# List tables
\dt

# Describe table
\d announcements

# Show foreign keys
\d+ announcements

# Query table
SELECT * FROM announcements;

# Exit
\q
```

---

**Phase Status**: Ready for implementation (requires Phase 01 complete)
**Blockers**: Phase 01 must complete successfully
**Estimated Duration**: 20 minutes
**Rollback Risk**: Very Low (simple rollback available)
