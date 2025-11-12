# Phase 01: GDAL Setup and Docker Environment

**Date**: 2025-11-12
**Phase**: 1 of 4
**Priority**: P0 CRITICAL
**Status**: NOT STARTED
**Estimated Time**: 45 minutes

---

## Context Links

- Research: [GDAL Solutions](./research/researcher-01-gdal-solutions.md)
- Debug Report: [Debug Report](../20251112-0204-webgis-code-review/debug-report.md)
- Docker Compose: `D:\Webgis\docker-compose.yml`
- Dockerfile: `D:\Webgis\Dockerfile`
- Environment: `D:\Webgis\.env`

---

## Overview

Django backend cannot start due to missing GDAL library. This phase establishes Docker-based development environment with PostGIS, eliminating need for Windows GDAL installation.

**Current Blocker**:
```
django.core.exceptions.ImproperlyConfigured: Could not find the GDAL library
```

**Solution**: Use Docker with PostGIS image that includes all spatial libraries pre-configured.

---

## Key Insights from Research

1. Project already has docker-compose.yml configured
2. Dockerfile includes GDAL installation (for container)
3. Database credentials mismatch between .env and docker-compose.yml
4. Docker solution avoids Windows GDAL complexity
5. PostGIS image includes GDAL, GEOS, PROJ libraries

---

## Requirements

### Prerequisites

- Windows 10/11 with WSL2 enabled
- Docker Desktop for Windows installed
- 4GB free RAM minimum
- 10GB free disk space

### Docker Services

1. **db**: PostgreSQL + PostGIS database
2. **web**: Django backend with GDAL
3. **pgadmin**: Database management UI (optional)

---

## Architecture

```
Windows Host
│
├── Docker Engine (WSL2 backend)
│   │
│   ├── webgis_postgis (Container)
│   │   ├── PostgreSQL 14
│   │   ├── PostGIS 3.4
│   │   ├── GDAL libraries
│   │   └── Port: 5433 -> 5432
│   │
│   ├── webgis_backend (Container)
│   │   ├── Python 3.10
│   │   ├── Django 4.2.11
│   │   ├── GDAL bindings
│   │   └── Port: 8080 -> 8000
│   │
│   └── webgis_pgadmin (Container)
│       └── Port: 5050 -> 80
│
└── D:\Webgis\ (Mounted as /app in web container)
```

---

## Related Code Files

### Configuration Files

- `D:\Webgis\docker-compose.yml` - Service definitions
- `D:\Webgis\Dockerfile` - Django container image
- `D:\Webgis\.env` - Local environment variables
- `D:\Webgis\config\settings\base.py` - Django database config
- `D:\Webgis\config\settings\development.py` - Dev settings

### Migration Files

- `D:\Webgis\apps\classrooms\migrations\0003_*.py` - Pending migration

---

## Implementation Steps

### 1. Install Docker Desktop (if needed)

```powershell
# Check if Docker installed
docker --version

# If not installed:
# 1. Download Docker Desktop for Windows from https://www.docker.com/products/docker-desktop/
# 2. Run installer
# 3. Enable WSL2 backend during setup
# 4. Restart computer if prompted
# 5. Start Docker Desktop
# 6. Verify installation
docker --version
docker-compose --version
```

### 2. Update Environment Configuration

**Problem**: `.env` has different credentials than `docker-compose.yml`

Current `.env`:
```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
```

Docker compose expects:
```yaml
DB_USER: webgis_user
DB_PASSWORD: webgis_password
DB_HOST: db
```

**Solution**: Update `.env` for Docker mode

```powershell
# Backup original
Copy-Item "D:\Webgis\.env" "D:\Webgis\.env.backup"

# Update .env for Docker
# (Will be done via Edit tool)
```

New `.env` content:
```env
# Development mode: local or docker
DEV_MODE=docker

# Django settings
DEBUG=True
SECRET_KEY=your-secret-key-change-in-production
DJANGO_SETTINGS_MODULE=config.settings.development

# Database settings - Docker mode
DB_HOST=localhost
DB_NAME=webgis_db
DB_USER=webgis_user
DB_PASSWORD=webgis_password
DB_PORT=5433

# Note: When connecting from Django container, use DB_HOST=db and DB_PORT=5432
# The docker-compose service will set the correct values via environment vars
```

### 3. Verify Docker Compose Configuration

```powershell
# Check syntax
cd D:\Webgis
docker-compose config

# Verify services defined
docker-compose config --services
# Expected output:
# db
# pgadmin
# web
```

### 4. Start Database Service First

```powershell
cd D:\Webgis

# Start only database (test isolation)
docker-compose up -d db

# Wait for database ready
Start-Sleep -Seconds 10

# Check database health
docker-compose ps db

# Test database connection
docker exec webgis_postgis psql -U webgis_user -d webgis_db -c "\dt"
```

### 5. Build and Start Django Service

```powershell
# Build Django image (includes GDAL)
docker-compose build web

# Start Django service
docker-compose up -d web

# View logs
docker-compose logs -f web

# Wait for "Starting development server..." message
# Press Ctrl+C to stop log viewing
```

### 6. Verify GDAL Available

```powershell
# Test GDAL in Django container
docker exec -it webgis_backend python -c "from django.contrib.gis import gdal; print(f'GDAL Available: {gdal.HAS_GDAL}')"

# Expected output:
# GDAL Available: True

# Test GDAL version
docker exec -it webgis_backend python -c "from django.contrib.gis import gdal; print(f'GDAL Version: {gdal.gdal_version()}')"
```

### 7. Test Django Check

```powershell
# Run Django system check
docker exec -it webgis_backend python manage.py check

# Expected output:
# System check identified no issues (0 silenced).

# If errors occur, review logs
docker-compose logs web
```

### 8. Start All Services

```powershell
# Start full stack
docker-compose up -d

# Verify all running
docker-compose ps

# Expected:
# webgis_postgis    running    5433->5432
# webgis_backend    running    8080->8000
# webgis_pgadmin    running    5050->80
```

### 9. Test Database Access via pgAdmin

```powershell
# Open browser
Start-Process "http://localhost:5050"

# Login credentials (from docker-compose.yml):
# Email: admin@webgis.com
# Password: admin123

# Add server:
# Name: WebGIS Local
# Host: db (container name)
# Port: 5432
# Database: webgis_db
# Username: webgis_user
# Password: webgis_password
```

### 10. Verify Django Admin Access

```powershell
# Open browser
Start-Process "http://localhost:8080/admin/"

# Should see Django admin login page
# (Cannot login yet - no superuser created)
```

---

## Todo List

- [ ] Verify Docker Desktop installed and running
- [ ] Backup current .env file
- [ ] Update .env with Docker credentials
- [ ] Validate docker-compose.yml syntax
- [ ] Start database service only
- [ ] Wait for database health check pass
- [ ] Build Django container image
- [ ] Start Django service
- [ ] Verify GDAL available in container
- [ ] Run Django system check
- [ ] Start all services together
- [ ] Access pgAdmin web interface
- [ ] Access Django admin page
- [ ] Document Docker commands in README

---

## Success Criteria

Phase complete when:

1. Docker Desktop running without errors
2. All three services healthy (db, web, pgadmin)
3. GDAL library detected in Django container
4. `python manage.py check` passes with no errors
5. Django admin accessible at http://localhost:8080/admin/
6. pgAdmin accessible at http://localhost:5050
7. No GDAL-related errors in logs
8. Database accepts connections from Django container

---

## Verification Commands

```powershell
# 1. Docker status
docker --version
docker-compose --version

# 2. Services running
docker-compose ps

# 3. Container health
docker inspect webgis_postgis --format='{{.State.Health.Status}}'

# 4. GDAL available
docker exec webgis_backend python -c "from django.contrib.gis import gdal; print(gdal.HAS_GDAL)"

# 5. Django check
docker exec webgis_backend python manage.py check

# 6. Database connection
docker exec webgis_postgis psql -U webgis_user -d webgis_db -c "SELECT version();"

# 7. Logs
docker-compose logs --tail=50 web
```

---

## Risk Assessment

### Risks and Mitigations

**Risk 1**: Docker Desktop not starting on Windows
- **Probability**: Low
- **Impact**: High (cannot proceed)
- **Mitigation**:
  - Enable virtualization in BIOS
  - Ensure WSL2 installed: `wsl --install`
  - Check Windows updates
  - Restart Windows

**Risk 2**: Port conflicts (5432, 8080, 5050)
- **Probability**: Medium
- **Impact**: Medium (services won't start)
- **Mitigation**:
  - Check ports before starting: `netstat -ano | findstr "5432 8080 5050"`
  - Stop conflicting services
  - Modify docker-compose.yml ports if needed

**Risk 3**: Database connection fails despite running
- **Probability**: Low
- **Impact**: High (migrations can't run)
- **Mitigation**:
  - Check health status: `docker-compose ps`
  - Review logs: `docker-compose logs db`
  - Verify credentials match in all configs
  - Test connection manually with psql

**Risk 4**: GDAL still not found in container
- **Probability**: Very Low (Dockerfile installs it)
- **Impact**: High (blocks migrations)
- **Mitigation**:
  - Rebuild image: `docker-compose build --no-cache web`
  - Check Dockerfile GDAL installation steps
  - Exec into container: `docker exec -it webgis_backend bash`
  - Manually test: `python -c "import gdal"`

**Risk 5**: File permissions on Windows/WSL2 mount
- **Probability**: Low
- **Impact**: Medium (can't write files)
- **Mitigation**:
  - Use bind mount (already configured)
  - Check Docker Desktop settings for file sharing
  - Run as non-root user in container if needed

---

## Security Considerations

### Development Environment

1. **Default Passwords**: docker-compose.yml uses weak passwords
   - **Risk**: Low (local development only)
   - **Action**: Change in production, keep simple for dev

2. **Exposed Ports**: Services exposed on localhost
   - **Risk**: Low (bound to 127.0.0.1)
   - **Action**: Verify firewall blocks external access

3. **Docker Socket Access**: Container has host access
   - **Risk**: Medium (container compromise = host compromise)
   - **Mitigation**: Don't run untrusted code, keep images updated

4. **Database Backups**: No automatic backups configured
   - **Risk**: Low (development data)
   - **Action**: Manual backups before risky operations

### Production Considerations

- Use Docker secrets for credentials
- Enable SSL/TLS for database connections
- Run containers as non-root users
- Use specific image tags (not `latest`)
- Implement network policies
- Regular security updates
- Volume backup strategy

---

## Troubleshooting

### Issue: Docker Desktop won't start

**Symptoms**: Application shows "Docker Desktop starting..." indefinitely

**Solutions**:
```powershell
# 1. Check WSL2
wsl --status
wsl --update

# 2. Restart Docker
Restart-Service docker

# 3. Reset Docker Desktop
# Settings > Troubleshoot > Reset to factory defaults

# 4. Check Windows event logs
Get-EventLog -LogName Application -Source Docker -Newest 10
```

### Issue: Port 5432 already in use

**Symptoms**: `Error starting userland proxy: listen tcp 0.0.0.0:5433: bind: address already in use`

**Solutions**:
```powershell
# Find process using port
netstat -ano | findstr "5433"

# Kill process (use PID from above)
Stop-Process -Id <PID> -Force

# Or change port in docker-compose.yml
# ports: "5434:5432"  # Use different host port
```

### Issue: Django can't connect to database

**Symptoms**: `django.db.utils.OperationalError: could not connect to server`

**Solutions**:
```powershell
# 1. Check database running
docker-compose ps db

# 2. Check health
docker inspect webgis_postgis --format='{{.State.Health.Status}}'

# 3. Test from Django container
docker exec -it webgis_backend psql -h db -U webgis_user -d webgis_db

# 4. Check environment variables
docker exec webgis_backend env | findstr "DB_"

# 5. Review logs
docker-compose logs db
```

### Issue: GDAL still not found

**Symptoms**: Same GDAL error in container

**Solutions**:
```powershell
# 1. Rebuild without cache
docker-compose build --no-cache web

# 2. Check GDAL installed in container
docker exec -it webgis_backend which gdalinfo

# 3. Check Python GDAL module
docker exec -it webgis_backend python -c "import osgeo; print(osgeo.__file__)"

# 4. Manually install if missing
docker exec -it webgis_backend apt-get update
docker exec -it webgis_backend apt-get install -y gdal-bin libgdal-dev
```

---

## Rollback Plan

If Docker approach fails catastrophically:

### Fallback: Manual GDAL Installation

```powershell
# 1. Stop Docker services
docker-compose down

# 2. Install OSGeo4W
# Download from https://trac.osgeo.org/osgeo4w/
# Install to C:\OSGeo4W64

# 3. Update Django settings
# Add to config/settings/development.py:
# GDAL_LIBRARY_PATH = r'C:\OSGeo4W64\bin\gdal306.dll'
# GEOS_LIBRARY_PATH = r'C:\OSGeo4W64\bin\geos_c.dll'

# 4. Update .env for local PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres

# 5. Test Django
python manage.py check
```

---

## Performance Considerations

### Resource Usage

- **Database Container**: ~300MB RAM, 1GB disk
- **Django Container**: ~200MB RAM, 500MB disk
- **pgAdmin Container**: ~100MB RAM, 200MB disk
- **Total**: ~600MB RAM, 2GB disk

### Optimization

1. Stop unused services:
   ```powershell
   # Run only db and web
   docker-compose up -d db web
   ```

2. Limit container resources:
   ```yaml
   # Add to docker-compose.yml
   services:
     web:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 512M
   ```

3. Use volumes for faster I/O (already configured)

---

## Next Steps

After this phase completes:

1. **Phase 02**: Apply database migrations
2. **Phase 03**: Test frontend-backend integration
3. **Phase 04**: Clean up frontend directories

Dependencies for Phase 02:
- Docker services running
- GDAL available
- Database accepting connections
- Django check passing

---

## Quick Reference

### Common Commands

```powershell
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart single service
docker-compose restart web

# View logs
docker-compose logs -f web

# Execute Django command
docker exec -it webgis_backend python manage.py <command>

# Access Django shell
docker exec -it webgis_backend python manage.py shell

# Access database shell
docker exec -it webgis_postgis psql -U webgis_user -d webgis_db

# Rebuild containers
docker-compose build --no-cache

# Remove all containers and volumes
docker-compose down -v
```

### Service URLs

- Django Admin: http://localhost:8080/admin/
- API Docs: http://localhost:8080/api/schema/swagger-ui/
- pgAdmin: http://localhost:5050
- Frontend: http://localhost:3000 (Phase 03)

---

**Phase Status**: Ready for implementation
**Blockers**: None (all prerequisites documented)
**Estimated Duration**: 45 minutes
**Team Dependencies**: None (can be done by single developer)
