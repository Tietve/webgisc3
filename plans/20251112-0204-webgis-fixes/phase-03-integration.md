# Phase 03: Frontend-Backend Integration Testing

**Date**: 2025-11-12
**Phase**: 3 of 4
**Priority**: P1 HIGH
**Status**: NOT STARTED
**Estimated Time**: 30 minutes

---

## Context Links

- Previous Phase: [Phase 02 - Migrations](./phase-02-migrations.md)
- Debug Report: [Debug Report](../20251112-0204-webgis-code-review/debug-report.md)
- Frontend App: `D:\Webgis\frontend\src\App.jsx`
- API Services: `D:\Webgis\frontend\src\services\`
- Backend URLs: `D:\Webgis\config\urls.py`

---

## Overview

Verify full-stack integration after GDAL and migration fixes. Test authentication flow, classroom CRUD operations, and announcement features across frontend and backend.

**Goal**: Ensure React frontend successfully communicates with Django backend via REST API.

---

## Key Insights from Research

1. Frontend refactored to Hybrid Architecture (feature-based)
2. API client configured with axios interceptors
3. Authentication uses JWT stored in localStorage
4. Vite proxy forwards /api requests to Django
5. CORS configured for ports 3000, 3001
6. Protected routes check authentication state

---

## Requirements

### Prerequisites

- Phase 01 completed (Docker running, GDAL working)
- Phase 02 completed (Migrations applied)
- Django backend accessible at http://localhost:8080
- Frontend dependencies installed (`npm install`)

### Test Data Needed

- At least one test user (teacher role)
- At least one test user (student role)
- Test classroom data
- Test announcement data

---

## Architecture

```
Browser (localhost:3000)
│
├── React App (Vite Dev Server)
│   ├── AuthPage (Login/Register)
│   ├── DashboardPage
│   ├── ClassroomsPage
│   ├── ClassroomDetailPage
│   └── Protected Routes
│
├── Vite Proxy (/api → localhost:8080)
│
└── Django Backend (Docker localhost:8080)
    ├── /api/v1/auth/token/ (JWT login)
    ├── /api/v1/auth/profile/ (User profile)
    ├── /api/v1/classrooms/ (CRUD)
    └── /api/v1/classrooms/:id/announcements/

Database: PostgreSQL + PostGIS (Docker localhost:5433)
```

---

## Related Code Files

### Frontend

- `D:\Webgis\frontend\src\App.jsx` - Main routing
- `D:\Webgis\frontend\src\features\auth\pages\AuthPage.jsx` - Login/Register
- `D:\Webgis\frontend\src\features\classroom\pages\ClassroomsPage.jsx` - Classroom list
- `D:\Webgis\frontend\src\features\classroom\pages\ClassroomDetailPage.jsx` - Detail view
- `D:\Webgis\frontend\src\services\api.js` - Axios client
- `D:\Webgis\frontend\src\services\auth.service.js` - Auth API
- `D:\Webgis\frontend\src\services\classroom.service.js` - Classroom API
- `D:\Webgis\frontend\src\hooks\useAuth.js` - Auth hook
- `D:\Webgis\frontend\vite.config.js` - Proxy config

### Backend

- `D:\Webgis\config\urls.py` - URL routing
- `D:\Webgis\apps\users\views.py` - Auth views
- `D:\Webgis\apps\classrooms\views.py` - Classroom views
- `D:\Webgis\apps\classrooms\urls.py` - Classroom URLs
- `D:\Webgis\apps\classrooms\serializers.py` - API serializers

### Configuration

- `D:\Webgis\config\settings\base.py` - CORS, REST framework
- `D:\Webgis\frontend\vite.config.js` - Dev server, proxy

---

## Implementation Steps

### 1. Create Test Users

```powershell
# Access Django shell
docker exec -it webgis_backend python manage.py shell
```

```python
from apps.users.models import User

# Create teacher
teacher = User.objects.create_user(
    username='teacher_test',
    email='teacher@test.com',
    password='test1234',
    role='teacher',
    full_name='Test Teacher'
)
print(f"Created teacher: {teacher.username}")

# Create student
student = User.objects.create_user(
    username='student_test',
    email='student@test.com',
    password='test1234',
    role='student',
    full_name='Test Student'
)
print(f"Created student: {student.username}")

exit()
```

### 2. Verify Backend API Endpoints

```powershell
# Test health check (if exists)
Invoke-WebRequest -Uri "http://localhost:8080/api/v1/" -Method GET

# Test token endpoint
$body = @{
    username = 'teacher_test'
    password = 'test1234'
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/token/" -Method POST -Body $body -ContentType "application/json"
echo $response

# Save token for later tests
$token = $response.access
echo "Token: $token"

# Test profile endpoint
$headers = @{
    Authorization = "Bearer $token"
}
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/profile/" -Headers $headers
```

### 3. Install Frontend Dependencies

```powershell
# Navigate to frontend
cd D:\Webgis\frontend

# Verify package.json exists
Test-Path package.json

# Install dependencies (if needed)
npm install

# Expected: node_modules created, no errors
```

### 4. Start Frontend Development Server

```powershell
# Start Vite dev server
cd D:\Webgis\frontend
npm run dev

# Expected output:
# VITE vX.X.X  ready in XXX ms
# ➜  Local:   http://localhost:3000/
# ➜  Network: use --host to expose
```

### 5. Test Login Flow (Teacher Account)

```
Manual Test Steps:

1. Open browser: http://localhost:3000
   - Should redirect to /login (unauthenticated)

2. Click "Login" tab
   - Form should show username and password fields

3. Enter credentials:
   - Username: teacher_test
   - Password: test1234

4. Click "Login" button
   - Should show loading state
   - Network tab should show POST to /api/auth/token/
   - Response should contain access token

5. After login:
   - Should redirect to /dashboard
   - User info stored in localStorage
   - Navigation shows logged-in state
   - User name displayed in header

6. Check localStorage:
   - Open DevTools > Application > Local Storage
   - Should see: token, user object
```

### 6. Test Classroom Creation (Teacher)

```
Manual Test Steps:

1. Navigate to Classrooms page:
   - Click "Classrooms" in navigation
   - URL: http://localhost:3000/classrooms

2. Click "Create Classroom" button
   - Modal should open
   - Form fields: name, description

3. Fill form:
   - Name: "Test Classroom 101"
   - Description: "Integration test classroom"

4. Submit form:
   - Network tab: POST to /api/v1/classrooms/
   - Should create classroom
   - Modal closes
   - New classroom card appears

5. Verify classroom card:
   - Shows classroom name
   - Shows description
   - Shows join code
   - Shows "View Details" button
```

### 7. Test Classroom Join (Student)

```
Manual Test Steps:

1. Logout from teacher account:
   - Click logout button
   - Should redirect to /login
   - localStorage cleared

2. Login as student:
   - Username: student_test
   - Password: test1234
   - Should redirect to /dashboard

3. Navigate to Classrooms:
   - Should see empty state or "Join Classroom" button

4. Click "Join Classroom":
   - Modal opens with join code input

5. Enter join code:
   - Use code from teacher's classroom
   - Click "Join"

6. Verify joined:
   - Network tab: POST to /api/v1/classrooms/enrollments/join/
   - Classroom appears in student's list
   - Shows as "member" not "teacher"
```

### 8. Test Classroom Detail Page

```
Manual Test Steps:

1. Click "View Details" on a classroom:
   - URL: http://localhost:3000/classrooms/:id

2. Verify page loads:
   - Shows classroom name
   - Shows description
   - Shows announcements section
   - Shows members list (if teacher)

3. Test creating announcement (as teacher):
   - Enter announcement text
   - Click "Post"
   - Network tab: POST to /api/v1/classrooms/:id/announcements/
   - Announcement appears in list

4. Verify announcement data:
   - Shows author name
   - Shows timestamp
   - Shows content
   - Ordered by created_at DESC
```

### 9. Test API Error Handling

```powershell
# Stop Django backend
docker-compose stop web

# In browser:
# 1. Try to load classrooms page
#    - Should show error message
#    - Network tab shows connection error

# 2. Try to create classroom
#    - Should handle error gracefully
#    - Shows user-friendly message

# Restart backend
docker-compose start web

# Verify reconnection works
```

### 10. Test Authentication Expiry

```
Manual Test Steps:

1. Login to application

2. Manually expire token:
   - Open DevTools > Application > Local Storage
   - Delete 'token' key

3. Try to access protected route:
   - Navigate to /classrooms
   - Should redirect to /login
   - Shows "Session expired" message (if implemented)

4. Test 401 auto-logout:
   - Modify token to invalid value
   - Make API request (create classroom)
   - Should auto-logout and redirect
```

### 11. Test CORS Configuration

```powershell
# Test CORS headers
$response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/classrooms/" -Method OPTIONS

# Check headers
echo $response.Headers

# Expected headers:
# Access-Control-Allow-Origin: http://localhost:3000
# Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
# Access-Control-Allow-Headers: Authorization, Content-Type
```

### 12. Test Proxy Configuration

```
Browser DevTools Network Tab:

1. Make API request from frontend
2. Check request URL:
   - Shows: http://localhost:3000/api/v1/classrooms/
   - Vite proxy should forward to http://localhost:8080/api/v1/classrooms/

3. Check response headers:
   - Should show Django response headers
   - Proxy adds X-Forwarded-* headers

4. Verify no CORS errors in console
```

---

## Todo List

- [ ] Create test teacher user
- [ ] Create test student user
- [ ] Verify backend API endpoints respond
- [ ] Test token authentication via curl/Postman
- [ ] Install frontend dependencies
- [ ] Start frontend development server
- [ ] Test login flow (teacher account)
- [ ] Verify token stored in localStorage
- [ ] Test dashboard access
- [ ] Test classroom list page loads
- [ ] Test create classroom (teacher)
- [ ] Verify classroom appears in list
- [ ] Test logout functionality
- [ ] Test login flow (student account)
- [ ] Test join classroom (student)
- [ ] Test classroom detail page
- [ ] Test create announcement
- [ ] Test announcement display
- [ ] Test API error handling (backend down)
- [ ] Test authentication expiry
- [ ] Test 401 auto-logout
- [ ] Verify CORS headers
- [ ] Verify proxy configuration
- [ ] Check browser console for errors
- [ ] Check network tab for failed requests

---

## Success Criteria

Phase complete when:

1. Teacher can login and receive JWT token
2. Student can login and receive JWT token
3. Dashboard page loads after login
4. Classrooms page displays properly
5. Teacher can create classroom successfully
6. Classroom appears in list immediately
7. Student can join classroom via code
8. Classroom detail page loads
9. Announcements can be created and viewed
10. Logout works and clears state
11. Protected routes redirect when not authenticated
12. 401 responses trigger auto-logout
13. No CORS errors in browser console
14. No network errors for valid requests
15. Frontend proxy forwards API calls correctly

---

## Verification Checklist

### Authentication
- [ ] Login endpoint responds (200)
- [ ] Returns valid JWT token
- [ ] Token stored in localStorage
- [ ] Token sent in Authorization header
- [ ] Profile endpoint works with token
- [ ] Logout clears localStorage

### Classroom CRUD
- [ ] GET /api/v1/classrooms/ returns list
- [ ] POST /api/v1/classrooms/ creates classroom
- [ ] GET /api/v1/classrooms/:id/ returns detail
- [ ] Classroom join endpoint works
- [ ] Only teachers can create classrooms
- [ ] Join code validation works

### Announcements
- [ ] GET /api/v1/classrooms/:id/announcements/ returns list
- [ ] POST creates announcement
- [ ] Only teachers/members can post
- [ ] Announcements ordered by created_at DESC
- [ ] Author information included

### Error Handling
- [ ] 401 triggers logout
- [ ] 403 shows permission error
- [ ] 404 shows not found
- [ ] 500 shows server error
- [ ] Network errors handled gracefully

### Frontend
- [ ] React app starts without errors
- [ ] All routes defined in App.jsx
- [ ] Protected routes check auth
- [ ] API client adds auth header
- [ ] Loading states work
- [ ] Error messages display

---

## Risk Assessment

### Risks and Mitigations

**Risk 1**: CORS errors block API requests
- **Probability**: Low (CORS configured in settings)
- **Impact**: High (frontend can't communicate)
- **Mitigation**:
  - Verify CORS_ALLOWED_ORIGINS includes http://localhost:3000
  - Check CORS_ALLOW_CREDENTIALS = True
  - Test OPTIONS preflight requests

**Risk 2**: JWT token not sent in requests
- **Probability**: Low (interceptor configured)
- **Impact**: High (all API calls fail)
- **Mitigation**:
  - Check axios interceptor in api.js
  - Verify Authorization header format: "Bearer {token}"
  - Check token stored in localStorage

**Risk 3**: Frontend proxy not working
- **Probability**: Low (vite.config.js has proxy)
- **Impact**: High (API requests fail)
- **Mitigation**:
  - Verify vite.config.js proxy configuration
  - Check target: http://localhost:8080
  - Ensure changeOrigin: true

**Risk 4**: Test users have wrong roles
- **Probability**: Medium (manual creation)
- **Impact**: Medium (permission tests fail)
- **Mitigation**:
  - Verify role field in User model
  - Check permission classes in views
  - Test with both teacher and student accounts

**Risk 5**: Frontend dependencies outdated
- **Probability**: Low
- **Impact**: Medium (build errors)
- **Mitigation**:
  - Run `npm install` fresh
  - Check package-lock.json
  - Clear node_modules if issues

---

## Security Considerations

### Authentication

- JWT tokens stored in localStorage (XSS risk)
- Token expiry enforced by backend
- Refresh token mechanism (if implemented)
- HTTPS required in production

### Authorization

- Role-based access control
- Teacher-only endpoints enforced
- Student permissions limited
- Enrollment validation for access

### Data Validation

- Input sanitization on backend
- Content length limits
- XSS prevention in announcements
- CSRF protection (Django)

### Testing Security

- Don't use test credentials in production
- Change default passwords
- Implement rate limiting
- Add CAPTCHA for registration

---

## Troubleshooting

### Issue: CORS error in browser console

**Symptoms**: `Access to XMLHttpRequest at 'http://localhost:8080' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solutions**:
```python
# Check config/settings/development.py
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
]
CORS_ALLOW_CREDENTIALS = True
```

```powershell
# Restart Django
docker-compose restart web
```

### Issue: 401 Unauthorized on all API calls

**Symptoms**: Every request returns 401 even after login

**Solutions**:
```javascript
// Check localStorage has token
console.log(localStorage.getItem('token'))

// Check Authorization header sent
// DevTools > Network > Request Headers
// Should see: Authorization: Bearer eyJ...

// Check api.js interceptor
// frontend/src/services/api.js
```

### Issue: Frontend shows blank page

**Symptoms**: White screen, no React app

**Solutions**:
```powershell
# Check console for errors
# F12 > Console

# Check Vite dev server running
Get-Process node | Where-Object {$_.MainWindowTitle -like "*vite*"}

# Restart frontend
cd D:\Webgis\frontend
npm run dev

# Check port 3000 not in use
netstat -ano | findstr "3000"
```

### Issue: API requests go to wrong URL

**Symptoms**: Network tab shows requests to wrong host/port

**Solutions**:
```javascript
// Check vite.config.js proxy
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})

// Restart Vite after config change
```

### Issue: Classroom join fails

**Symptoms**: 400 Bad Request or "Invalid join code"

**Solutions**:
```powershell
# Verify classroom has join_code
docker exec webgis_backend python manage.py shell
```

```python
from apps.classrooms.models import Classroom
classroom = Classroom.objects.first()
print(classroom.join_code)  # Should print code like "ABC123"
exit()
```

---

## Next Steps

After this phase completes:

1. **Phase 04**: Clean up frontend directories
   - Remove frontend_new/
   - Preserve documentation
   - Update README

2. **Future Enhancements**:
   - Implement missing pages (LessonViewer, QuizTaker, Tools)
   - Add automated tests (Jest, Playwright)
   - Improve error boundaries
   - Add loading skeletons
   - Implement pagination

Dependencies for Phase 04:
- All integration tests passing
- Both frontend and backend working
- No critical bugs found

---

## Quick Reference

### Frontend Commands

```powershell
# Start dev server
cd D:\Webgis\frontend
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Install dependencies
npm install

# Clear cache
Remove-Item -Recurse -Force node_modules, .vite
npm install
```

### Backend Commands

```powershell
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f web

# Create superuser
docker exec -it webgis_backend python manage.py createsuperuser

# Django shell
docker exec -it webgis_backend python manage.py shell
```

### Test URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api/v1
- API Docs: http://localhost:8080/api/schema/swagger-ui/
- Django Admin: http://localhost:8080/admin/
- pgAdmin: http://localhost:5050

### Test Credentials

```
Teacher:
- Username: teacher_test
- Password: test1234

Student:
- Username: student_test
- Password: test1234

Admin (if created):
- Username: admin
- Password: admin123
```

---

**Phase Status**: Ready for implementation (requires Phase 01 & 02 complete)
**Blockers**: Phase 01 and 02 must complete successfully
**Estimated Duration**: 30 minutes
**Manual Testing**: Required (automated tests future enhancement)
