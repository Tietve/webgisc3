# WebGIS Platform Fix Implementation Plan

**Date**: 2025-11-12
**Project**: Django + PostGIS + React WebGIS Educational Platform
**Plan Type**: Progressive Disclosure (4 Phases)
**Priority**: P0 CRITICAL → P2 MEDIUM

---

## Executive Summary

This plan resolves critical blockers preventing WebGIS platform operation. The debugger agent identified GDAL library missing (P0), pending migrations (P1), and duplicate frontend directories (P2). All issues have clear solutions with minimal risk.

**Status**: Backend non-functional, frontend refactored successfully
**Approach**: Docker-first with manual GDAL as fallback
**Duration**: ~2 hours total across 4 phases
**Rollback**: Available for all phases

---

## Problems to Solve

### P0 CRITICAL: GDAL Library Missing
- **Impact**: Django cannot start at all
- **Error**: `Could not find the GDAL library`
- **Solution**: Use Docker with PostGIS image (GDAL pre-installed)
- **Alternative**: Manual OSGeo4W installation (Windows)

### P1 HIGH: Migration Not Applied
- **Impact**: Announcement model missing from database
- **File**: `0003_alter_classroom_teacher...py`
- **Solution**: Apply migration after GDAL fix
- **Risk**: Low (additive only, no data loss)

### P2 MEDIUM: Duplicate Frontend Directories
- **Impact**: Developer confusion, wasted disk space
- **Directories**: `frontend/` (active) vs `frontend_new/` (obsolete)
- **Solution**: Archive frontend_new/, preserve documentation
- **Risk**: Very low (no code dependencies)

---

## Plan Structure

```
20251112-0204-webgis-fixes/
├── plan.md                           # This file (overview)
├── phase-01-gdal-setup.md            # Docker environment (45 min)
├── phase-02-migrations.md            # Apply migrations (20 min)
├── phase-03-integration.md           # Test integration (30 min)
├── phase-04-cleanup.md               # Cleanup frontend (15 min)
└── research/
    ├── researcher-01-gdal-solutions.md      # GDAL installation options
    ├── researcher-02-migration-strategy.md  # Migration safety
    └── researcher-03-frontend-cleanup.md    # Cleanup approaches
```

---

## Phase Overview

### Phase 01: GDAL Setup (P0)
**Time**: 45 minutes | **Risk**: Low | **Rollback**: Yes

Setup Docker environment with PostGIS image, eliminating Windows GDAL complexity.

**Key Steps**:
1. Install Docker Desktop (if needed)
2. Update environment configuration
3. Start PostgreSQL + PostGIS container
4. Build and start Django container
5. Verify GDAL available

**Success**: `python manage.py check` passes without GDAL errors

**File**: [phase-01-gdal-setup.md](./phase-01-gdal-setup.md)

---

### Phase 02: Migrations (P1)
**Time**: 20 minutes | **Risk**: Very Low | **Rollback**: Yes

Apply migration 0003 that creates Announcement model.

**Key Steps**:
1. Verify Docker services healthy
2. Check migration status
3. Apply migration
4. Verify database schema
5. Test model in Django shell

**Success**: Announcement model exists and queryable

**File**: [phase-02-migrations.md](./phase-02-migrations.md)

---

### Phase 03: Integration Testing (P1)
**Time**: 30 minutes | **Risk**: Low | **Rollback**: N/A (testing only)

Test full-stack integration of React frontend with Django backend.

**Key Steps**:
1. Create test users (teacher, student)
2. Start frontend dev server
3. Test login flow
4. Test classroom creation
5. Test classroom join
6. Test announcements
7. Verify error handling

**Success**: Full user flow works end-to-end

**File**: [phase-03-integration.md](./phase-03-integration.md)

---

### Phase 04: Cleanup (P2)
**Time**: 15 minutes | **Risk**: Very Low | **Rollback**: Yes

Remove obsolete frontend_new/ directory, preserve documentation.

**Key Steps**:
1. Verify frontend working
2. Check for code references
3. Preserve MIGRATION_GUIDE.md
4. Archive frontend_new/
5. Update .gitignore
6. Verify frontend still works

**Success**: frontend_new/ removed, frontend/ functional

**File**: [phase-04-cleanup.md](./phase-04-cleanup.md)

---

## Dependencies

```
Phase 01 (GDAL)
    ↓
Phase 02 (Migrations) ← Requires Phase 01
    ↓
Phase 03 (Integration) ← Requires Phase 01 & 02
    ↓
Phase 04 (Cleanup) ← Requires Phase 03 (verification)
```

**Critical Path**: Phase 01 → Phase 02 → Phase 03
**Optional**: Phase 04 (can defer)

---

## Key Decisions

### Decision 1: Docker vs Manual GDAL
**Choice**: Docker (primary), manual as fallback
**Reason**:
- Project already has docker-compose.yml
- Avoids Windows GDAL complexity
- Production-like environment
- Team consistency

### Decision 2: Archive vs Delete frontend_new/
**Choice**: Archive with timestamp
**Reason**:
- Recoverable if needed
- Preserves documentation
- Low risk approach
- Can delete later if confirmed

### Decision 3: Apply Migrations Now vs Later
**Choice**: Apply during this fix plan
**Reason**:
- Low risk (additive only)
- Required for testing
- Blocks announcement features
- Simple rollback available

---

## Prerequisites

### System Requirements
- Windows 10/11 with WSL2
- Docker Desktop installed (or can install)
- 4GB free RAM
- 10GB free disk space
- Port 5432, 8080, 3000 available

### Existing Setup
- PostgreSQL database (via Docker)
- Django project configured
- React frontend refactored
- Git repository initialized

---

## Success Criteria

Plan complete when:

1. **Backend Operational**
   - Django starts without GDAL errors
   - All migrations applied
   - API endpoints respond
   - Database accessible

2. **Frontend Functional**
   - React app builds successfully
   - Dev server starts
   - Login flow works
   - Classroom features work
   - API integration works

3. **Codebase Clean**
   - Single frontend directory
   - Documentation preserved
   - No duplicate dependencies
   - Git status clean

---

## Risk Matrix

| Phase | Probability | Impact | Mitigation |
|-------|------------|--------|------------|
| Phase 01: Docker won't start | Low | High | Enable WSL2, check virtualization |
| Phase 01: Port conflicts | Medium | Medium | Check ports, modify docker-compose.yml |
| Phase 02: Migration fails | Very Low | Medium | Auto-rollback, low-risk changes |
| Phase 03: CORS errors | Low | High | CORS pre-configured, verify settings |
| Phase 04: Delete wrong dir | Low | Critical | Use Move not Delete, verify first |

**Overall Risk**: LOW - Clear solutions for all identified issues

---

## Rollback Strategy

### Phase 01 Rollback
```powershell
# Stop Docker services
docker-compose down -v

# Restore original .env
Copy-Item .env.backup .env

# Fallback to manual GDAL (documented in phase-01)
```

### Phase 02 Rollback
```powershell
# Unapply migration
docker exec webgis_backend python manage.py migrate classrooms 0002
```

### Phase 04 Rollback
```powershell
# Restore archive
Move-Item archive\frontend_new_* frontend_new
```

---

## Timeline

### Optimal Sequence (Single Session)
- **00:00-00:45**: Phase 01 (GDAL Setup)
- **00:45-01:05**: Phase 02 (Migrations)
- **01:05-01:35**: Phase 03 (Integration Testing)
- **01:35-01:50**: Phase 04 (Cleanup)
- **01:50-02:00**: Final verification

**Total**: 2 hours

### Split Sequence (Multiple Sessions)
- **Day 1**: Phase 01 + Phase 02 (1 hour)
- **Day 2**: Phase 03 (30 min)
- **Day 3**: Phase 04 (15 min)

---

## Communication Plan

### Before Starting
- [ ] Announce planned work in team channel
- [ ] Estimate completion time
- [ ] Note any downtime (none for dev)

### During Phases
- [ ] Update progress after each phase
- [ ] Report blockers immediately
- [ ] Document unexpected issues

### After Completion
- [ ] Summarize changes in team channel
- [ ] Update project documentation
- [ ] Note any deviations from plan
- [ ] Share lessons learned

---

## Documentation Updates

After plan execution:

1. **README.md**
   - Add Docker setup instructions
   - Document GDAL solution
   - Update project structure
   - Add troubleshooting section

2. **DEVELOPMENT.md** (create if not exists)
   - Docker commands
   - Migration workflow
   - Testing procedures
   - Common issues

3. **ARCHITECTURE.md** (preserve from frontend_new/)
   - Frontend architecture
   - API integration
   - Authentication flow
   - State management

---

## Related Documents

### Research Reports
- [GDAL Solutions](./research/researcher-01-gdal-solutions.md)
- [Migration Strategy](./research/researcher-02-migration-strategy.md)
- [Frontend Cleanup](./research/researcher-03-frontend-cleanup.md)

### Debug Report
- [Debug Report](../20251112-0204-webgis-code-review/debug-report.md)

### Configuration Files
- `docker-compose.yml` - Service definitions
- `Dockerfile` - Django container
- `.env` - Environment variables
- `vite.config.js` - Frontend proxy

---

## Quick Start

Execute plan in order:

```powershell
# Phase 01: GDAL Setup
cd D:\Webgis
docker-compose up -d
docker exec webgis_backend python manage.py check

# Phase 02: Migrations
docker exec webgis_backend python manage.py migrate

# Phase 03: Integration
cd frontend
npm install
npm run dev
# Manual browser testing

# Phase 04: Cleanup
Move-Item frontend_new archive\frontend_new_$(Get-Date -Format yyyyMMdd)
```

See individual phase files for detailed steps.

---

## Notes

- **YAGNI**: Only fix what's broken, don't over-engineer
- **KISS**: Docker is simpler than manual GDAL installation
- **DRY**: Reuse existing docker-compose.yml configuration
- **Testing**: Manual testing acceptable for Phase 03 (automated tests future work)
- **Backup**: Archive approach for Phase 04 (safer than delete)

---

## Questions & Clarifications

If issues arise during execution:

1. Check individual phase troubleshooting sections
2. Review research documents for alternatives
3. Consult debug report for context
4. Check Docker/Django logs for errors

---

**Plan Status**: READY FOR EXECUTION
**Created By**: Claude Planner Agent
**Reviewed By**: Pending
**Approved By**: Pending
