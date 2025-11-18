# Implementation Plan: Classroom & Quiz System Upgrade

**Plan ID**: 251118-1826-classroom-quiz-system
**Created**: 2025-11-18
**Status**: Ready for Implementation
**Estimated Duration**: 30-42 hours

---

## Overview

Upgrade WebGIS classroom and quiz system with assignment submission, quiz grading workflow, and modernized UI panels. Backend foundation 80% complete - focus on connecting frontend to APIs and adding missing features.

---

## Requirements Summary

1. **Classroom Assignments**: Admin posts assignments (not just announcements), students submit text/PDF answers, admin grades with feedback
2. **Quiz System**: Display all deadlines from classrooms in map view, students submit answers, admin grades and provides feedback, students view scores in classroom
3. **UI Modernization**: Upgrade tools, layers, and lessons panels with modern design patterns

---

## Architecture Context

**Existing Infrastructure**:
- Django 4.2 + GeoDjango + DRF backend
- React 18 + Vite + Mapbox GL JS frontend
- PostgreSQL 14 + PostGIS 3.3 database
- JWT authentication with role-based permissions (teacher/student)
- Classroom, Quiz, Lesson models with working APIs
- Frontend components with hardcoded data (needs connection)

**Key Gaps**:
- No Assignment model (only Announcement exists)
- No Submission/Grade models with file upload
- Quiz lacks deadline and classroom assignment
- Frontend Quiz/Lesson panels not connected to backend
- UI panels need modernization

---

## Implementation Phases

### Phase 1: Assignment & Submission Backend
**Status**: 🔵 Not Started | **Progress**: 0%
**File**: [phase-01-assignment-submission-backend.md](./phase-01-assignment-submission-backend.md)
**Duration**: 8-10 hours
**Priority**: Critical

Create Assignment model with file upload, Submission workflow with text+file support, Grade model with feedback. Establish foundation for homework system.

---

### Phase 2: Quiz Deadline & Grading System
**Status**: 🔵 Not Started | **Progress**: 0%
**File**: [phase-02-quiz-deadline-grading.md](./phase-02-quiz-deadline-grading.md)
**Duration**: 6-8 hours
**Priority**: High

Add deadline management to Quiz model, classroom assignment relationship, deadline aggregation endpoint for map view, grading workflow with feedback.

---

### Phase 3: Frontend API Integration
**Status**: 🔵 Not Started | **Progress**: 0%
**File**: [phase-03-frontend-integration.md](./phase-03-frontend-integration.md)
**Duration**: 10-14 hours
**Priority**: High

Connect QuizPanel and LessonsPanel to backend APIs, implement file upload component, create assignment submission UI, display deadline aggregation in map view.

---

### Phase 4: UI Panel Modernization
**Status**: 🔵 Not Started | **Progress**: 0%
**File**: [phase-04-ui-modernization.md](./phase-04-ui-modernization.md)
**Duration**: 6-10 hours
**Priority**: Medium

Modernize ToolsPanel, LayersPanel, LessonsPanel with glassmorphism, smooth animations (Framer Motion), collapsible sections, responsive design improvements.

---

## Dependencies

```
Phase 1 (Backend Foundation)
    ↓
Phase 2 (Quiz Enhancements) ← parallel to Phase 1
    ↓
Phase 3 (Frontend Integration) ← depends on Phase 1 & 2
    ↓
Phase 4 (UI Polish) ← independent, can run parallel to Phase 3
```

**Critical Path**: Phase 1 → Phase 3
**Quick Wins**: Phase 2, Phase 4 (can start early)

---

## Success Criteria

- [ ] Teachers create assignments with file attachments
- [ ] Students submit text answers + PDF files
- [ ] Teachers grade submissions with feedback
- [ ] Students view grades in classroom detail
- [ ] Quiz deadlines display in map view (all classrooms)
- [ ] Students submit quiz answers via map interface
- [ ] Teachers view quiz results and grade
- [ ] Lessons panel loads from `/api/v1/lessons/`
- [ ] UI panels use modern design patterns (glassmorphism, animations)
- [ ] All features work on mobile and desktop

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| File upload security vulnerabilities | High | Medium | Use libmagic validation, size limits, secure storage |
| Migration conflicts with existing data | Medium | Low | Test migrations on dev DB first |
| Frontend-backend API mismatch | Medium | Medium | Use Swagger docs, add integration tests |
| UI performance with animations | Low | Low | Use CSS transforms, optimize with React.memo |

---

## Documentation Links

- [Scout Report](./scout/scout-01-codebase-analysis.md) - Existing implementation analysis
- [Research: Classroom Systems](./research/researcher-01-classroom-systems.md) - RBAC, Django patterns
- [Research: Quiz Submission](./research/researcher-02-quiz-submission.md) - File handling, grading
- [Research: UI Patterns](./research/researcher-03-ui-patterns.md) - Modern sidebar designs
- [System Architecture](/home/user/webgisc3/docs/system-architecture.md) - Project architecture
- [README](/home/user/webgisc3/README.md) - Project overview

---

## Notes

- Sacrifice grammar for concision in all documentation
- Use existing permission classes (IsTeacher, IsStudent, IsTeacherOrReadOnly)
- Follow Django best practices from research reports
- Test file uploads with PDF, DOC, DOCX formats
- Ensure mobile-responsive design (Tailwind mobile-first)

---

## Unresolved Questions

None at planning stage. Questions will be tracked in individual phase files.
