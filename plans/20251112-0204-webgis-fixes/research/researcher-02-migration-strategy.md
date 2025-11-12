# Research Report: Django Migration Best Practices

**Date**: 2025-11-12
**Researcher**: Agent 02
**Topic**: Safe migration application and rollback strategies

---

## Executive Summary

Django migration 0003 creates the Announcement model and updates foreign key relationships. Safe application requires database backup, verification steps, and rollback preparation.

---

## Migration Analysis

### File: 0003_alter_classroom_teacher_alter_enrollment_student_and_more.py

**Changes**:
1. Alters `Classroom.teacher` field - adds help_text
2. Alters `Enrollment.student` field - adds help_text
3. Creates `Announcement` model with fields:
   - id (auto BigAutoField)
   - content (TextField)
   - created_at (DateTimeField, auto_now_add)
   - updated_at (DateTimeField, auto_now)
   - author (ForeignKey to User)
   - classroom (ForeignKey to Classroom)

**Risk Level**: LOW
- No data deletion
- No schema-breaking changes
- Only adds new table and help_text metadata
- help_text changes don't affect database schema (Django-only)

---

## Migration Safety Checklist

### Pre-Migration Verification

1. **Check Migration Status**
   ```bash
   python manage.py showmigrations classrooms
   ```
   Expected: `[ ] 0003_alter_classroom_teacher...`

2. **Verify Dependencies**
   - Depends on: `classrooms.0002_initial`
   - Depends on: `users` app migrations
   - Check both are applied

3. **Database Backup**
   ```bash
   # Docker database
   docker exec webgis_postgis pg_dump -U webgis_user webgis_db > backup_$(date +%Y%m%d_%H%M%S).sql

   # Local PostgreSQL
   pg_dump -U postgres webgis_db > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

4. **Test Migration (Dry Run)**
   ```bash
   python manage.py migrate classrooms 0003 --plan
   ```
   Shows operations without executing

---

## Migration Application

### Standard Process

```bash
# 1. Check database connection
python manage.py check --database default

# 2. Apply migration
python manage.py migrate classrooms

# 3. Verify success
python manage.py showmigrations classrooms

# 4. Test model in shell
python manage.py shell
>>> from apps.classrooms.models import Announcement
>>> Announcement.objects.count()
0
>>> exit()
```

### With Docker

```bash
# Access Django container
docker exec -it webgis_backend python manage.py migrate

# Or via docker-compose
docker-compose exec web python manage.py migrate
```

---

## Rollback Strategy

### If Migration Fails

1. **Check Error Message**
   - Read full traceback
   - Common issues: missing dependencies, database connection

2. **Roll Back to Previous Migration**
   ```bash
   python manage.py migrate classrooms 0002
   ```

3. **Restore Database Backup (if needed)**
   ```bash
   # Docker
   docker exec -i webgis_postgis psql -U webgis_user webgis_db < backup_file.sql

   # Local
   psql -U postgres webgis_db < backup_file.sql
   ```

4. **Investigate Issue**
   - Check logs: `D:\Webgis\logs\django.log`
   - Verify model definitions match migration
   - Check database user permissions

---

## Post-Migration Verification

### Database Schema Check

```sql
-- Connect to database
\c webgis_db

-- Check announcements table exists
\d announcements

-- Expected columns:
-- id, content, created_at, updated_at, author_id, classroom_id

-- Check foreign keys
SELECT constraint_name, table_name, column_name
FROM information_schema.key_column_usage
WHERE table_name = 'announcements';

-- Verify indexes
\di announcements*
```

### Django ORM Test

```python
# python manage.py shell

from apps.classrooms.models import Classroom, Announcement
from apps.users.models import User

# Test create
teacher = User.objects.filter(role='teacher').first()
classroom = Classroom.objects.first()

announcement = Announcement.objects.create(
    classroom=classroom,
    author=teacher,
    content="Test announcement"
)

# Test retrieve
print(announcement.id, announcement.created_at)

# Test relationships
print(classroom.announcements.count())
print(teacher.announcements.count())

# Cleanup test data
announcement.delete()
```

---

## Common Migration Issues

### Issue 1: Foreign Key Constraint Violation

**Symptom**: `IntegrityError: foreign key constraint fails`

**Cause**: Referenced model doesn't exist or ID invalid

**Solution**:
- Verify User model exists and has data
- Check Classroom model exists
- Ensure AUTH_USER_MODEL is properly configured

### Issue 2: Database Connection Error

**Symptom**: `could not connect to server`

**Cause**: Database not running or credentials wrong

**Solution**:
- Start Docker services: `docker-compose up -d db`
- Check `.env` credentials match docker-compose.yml
- Verify port 5432 not blocked

### Issue 3: Migration Already Applied

**Symptom**: `No migrations to apply`

**Cause**: Migration file exists but Django thinks it's applied

**Solution**:
```bash
# Check migration history
python manage.py showmigrations

# Force re-apply (DANGEROUS)
python manage.py migrate classrooms 0003 --fake

# Better: rollback and reapply
python manage.py migrate classrooms 0002
python manage.py migrate classrooms 0003
```

---

## Best Practices

### Development Workflow

1. Always create migrations in feature branch
2. Review migration file before committing
3. Test migration on local database first
4. Document breaking changes in migration docstring
5. Never edit applied migrations (create new ones)

### Team Coordination

1. Pull latest migrations before creating new ones
2. Communicate breaking migrations in PR description
3. Run migrations immediately after merge
4. Keep migration files in version control

### Production Safety

1. Always backup production database
2. Test migrations on staging first
3. Plan downtime for risky migrations
4. Have rollback plan ready
5. Monitor application after migration

---

## Migration Dependencies

### Current Migration Tree

```
classrooms app:
├── 0001_initial (models creation)
├── 0002_initial (relationships setup)
└── 0003_alter_classroom... (THIS MIGRATION)
    ├── adds Announcement model
    └── updates help_text (non-destructive)

Dependencies:
- AUTH_USER_MODEL (users.User)
- Classroom model (from 0001)
- Enrollment model (from 0001)
```

### Dependency Check

```bash
# Verify all dependencies applied
python manage.py migrate --plan

# Check users app migrations
python manage.py showmigrations users

# Ensure no conflicts
python manage.py makemigrations --check --dry-run
```

---

## Testing Checklist

After migration applied:

- [ ] Django starts without errors
- [ ] Announcement model importable
- [ ] Can create Announcement via Django admin
- [ ] Can create Announcement via API endpoint
- [ ] Foreign key relationships work
- [ ] created_at/updated_at auto-populate
- [ ] Ordering by -created_at works
- [ ] Cascading delete from Classroom deletes Announcements
- [ ] Cascading delete from User deletes Announcements

---

## Performance Considerations

### Migration 0003 Performance

**Table Size Impact**: Minimal
- Creates empty table
- No data migration
- No index rebuilding on existing tables
- help_text changes are Django-only (no SQL)

**Execution Time**: < 1 second

**Locks**: Brief table-level lock during CREATE TABLE

**Downtime**: None required (non-blocking operation)

---

## Rollback Decision Matrix

| Scenario | Action | Rollback? |
|----------|--------|-----------|
| Migration fails mid-way | Automatic Django rollback | Yes |
| Migration succeeds but app errors | Manual rollback | Yes |
| Migration succeeds, no issues | Continue | No |
| Migration succeeds, need schema change | New migration | No |

---

## Key Findings

1. Migration 0003 is low-risk (only adds new table)
2. No data loss risk - purely additive
3. help_text changes don't affect database schema
4. Rollback is trivial (drop announcements table)
5. Database backup is safety net, not necessity
6. Docker complicates backup but simplifies migration execution

---

## Recommended Approach

1. Start Docker database service
2. Verify connection from Django
3. Run migration (no backup needed for dev)
4. Test Announcement model in shell
5. Test API endpoint if exists
6. Commit migration file to git

**For Production**:
1. Take database backup
2. Test on staging environment
3. Apply during low-traffic window
4. Monitor for 15 minutes
5. Rollback if issues detected

---

## References

- Django Migrations: https://docs.djangoproject.com/en/4.2/topics/migrations/
- PostgreSQL Backup: https://www.postgresql.org/docs/current/backup.html
- Django Database API: https://docs.djangoproject.com/en/4.2/ref/databases/
