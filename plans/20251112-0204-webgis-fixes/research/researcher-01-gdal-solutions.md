# Research Report: GDAL Setup for Windows + Django

**Date**: 2025-11-12
**Researcher**: Agent 01
**Topic**: GDAL installation strategies for Windows development with GeoDjango

---

## Executive Summary

GDAL (Geospatial Data Abstraction Library) is required for GeoDjango to handle spatial database operations. Three viable solutions exist for Windows: Docker (recommended), OSGeo4W (manual), and Windows binaries.

---

## Solution Comparison

### Option 1: Docker with PostGIS (RECOMMENDED)

**Pros**:
- Zero Windows GDAL installation needed
- PostGIS image includes all spatial libraries pre-configured
- Consistent environment across team members
- Easy database management with pgAdmin
- Production-like environment
- Already configured in project (docker-compose.yml exists)

**Cons**:
- Requires Docker Desktop (Windows)
- Slightly more memory overhead
- Learning curve for Docker beginners

**Use Case**: Teams, production-like dev environment, no local GDAL headaches

---

### Option 2: OSGeo4W Manual Installation

**Pros**:
- Native Windows installation
- Full control over versions
- No Docker required
- Better for GDAL tool exploration

**Cons**:
- Complex installation process (10+ steps)
- Path configuration issues common
- Version mismatches between GDAL/Python
- Difficult to replicate across machines
- Windows-specific issues (DLL hell)

**Use Case**: Single developer, GIS-heavy development, existing GDAL workflows

---

### Option 3: Conda/Mamba Environment

**Pros**:
- Python-integrated installation
- Environment isolation
- Cross-platform support
- Easier than OSGeo4W

**Cons**:
- Requires Conda/Mamba setup
- Environment activation needed
- Potential conflicts with system Python
- Not suitable for production

**Use Case**: Data science workflows, multiple Python environments

---

## Docker Solution Details

### Current Project Setup

Project already has `docker-compose.yml` with:
- PostGIS 14-3.4 image (includes GDAL, GEOS, PROJ)
- PostgreSQL database with PostGIS extension
- pgAdmin web interface
- Django backend service with GDAL pre-installed

### Environment Variables

Docker service uses:
```yaml
DB_NAME: webgis_db
DB_USER: webgis_user
DB_PASSWORD: webgis_password
DB_HOST: db (Docker service name)
DB_PORT: 5432
```

**CRITICAL**: Local `.env` has different credentials:
```
DB_USER: postgres
DB_PASSWORD: postgres
DB_HOST: localhost
```

This mismatch prevents local Django from connecting to Docker database.

---

## Implementation Requirements

### For Docker Solution

1. **Install Docker Desktop**
   - Download from docker.com
   - Enable WSL2 backend (Windows 10/11)
   - Verify: `docker --version`

2. **Update Local Environment**
   - Align `.env` with docker-compose.yml credentials
   - OR use environment-specific .env files

3. **Start Services**
   ```powershell
   docker-compose up -d
   ```

4. **Verify GDAL Available**
   ```powershell
   docker exec -it webgis_backend python -c "from django.contrib.gis import gdal; print(gdal.HAS_GDAL)"
   ```

---

## Windows GDAL Manual Installation (Fallback)

### OSGeo4W Approach

1. **Download OSGeo4W Installer**
   - URL: https://trac.osgeo.org/osgeo4w/
   - Choose 64-bit installer
   - Install to `C:\OSGeo4W64`

2. **Install Required Packages**
   - GDAL (gdal-core, gdal-python)
   - GEOS
   - PROJ
   - PostgreSQL client libraries

3. **Configure Django Settings**
   ```python
   # config/settings/development.py
   import os

   if os.name == 'nt':  # Windows
       GDAL_LIBRARY_PATH = r'C:\OSGeo4W64\bin\gdal306.dll'
       GEOS_LIBRARY_PATH = r'C:\OSGeo4W64\bin\geos_c.dll'
   ```

4. **Update System PATH**
   - Add `C:\OSGeo4W64\bin` to PATH
   - Restart terminal/IDE

5. **Install Python GDAL Bindings**
   ```powershell
   pip install GDAL==3.6.4 --find-links=https://www.lfd.uci.edu/~gohlke/pythonlibs/
   ```

---

## Risk Assessment

### Docker Risks

- **Risk**: Docker Desktop not starting on Windows
  - **Mitigation**: Enable virtualization in BIOS, use WSL2

- **Risk**: Port conflicts (5432, 8080, 5050)
  - **Mitigation**: Check ports before starting, modify docker-compose.yml

- **Risk**: Database credentials mismatch
  - **Mitigation**: Sync .env with docker-compose.yml

### Manual Installation Risks

- **Risk**: DLL version mismatches
  - **Mitigation**: Use exact versions, test import

- **Risk**: PATH conflicts with other software
  - **Mitigation**: Use virtual environments, document paths

- **Risk**: Difficult troubleshooting
  - **Mitigation**: Extensive logging, check GDAL config

---

## Recommended Solution

**Use Docker** for the following reasons:

1. Project already configured for Docker
2. Team consistency guaranteed
3. Production environment match
4. Eliminates Windows GDAL complexity
5. Includes pgAdmin for database management
6. Easy to rebuild if issues occur

**Only use manual installation if**:
- Docker unavailable due to system restrictions
- Need native Windows GDAL tools frequently
- Existing OSGeo4W workflow

---

## Key Findings

1. Docker solution is 90% ready - just needs environment sync
2. Dockerfile properly installs GDAL libraries
3. Database credentials mismatch is main blocker
4. Manual GDAL installation has 10+ steps vs Docker's 3 steps
5. PostGIS image includes all required spatial libraries

---

## Next Steps

1. Verify Docker Desktop installed
2. Sync database credentials across configs
3. Start Docker services
4. Test Django connection
5. Apply migrations

---

## References

- GeoDjango Installation: https://docs.djangoproject.com/en/4.2/ref/contrib/gis/install/
- PostGIS Docker: https://registry.hub.docker.com/r/postgis/postgis/
- OSGeo4W: https://trac.osgeo.org/osgeo4w/
- Docker Desktop: https://www.docker.com/products/docker-desktop/
