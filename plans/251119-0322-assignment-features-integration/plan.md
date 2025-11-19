# Assignment Features Integration Plan

**Date:** 2025-11-19
**Status:** Ready for Implementation
**Priority:** High
**Complexity:** Medium

## Overview

Integrate assignment features into two main UI locations:
1. QuizPanel - Add Assignments tab for students to view/submit assignments
2. ClassroomDetailPage - Add assignment creation for teachers

Backend APIs are 100% complete and ready. Focus is pure frontend integration.

## Goals

- Students can view all assignments from enrolled classrooms in QuizPanel
- Students can submit assignments with PDF uploads via QuizPanel
- Teachers can create assignments from ClassroomDetailPage Classwork tab
- Teachers can view submission status and grade submissions
- Maintain existing UI/UX patterns and animations

## Architecture Summary

```
QuizPanel (bottom-right floating button)
├── Quiz Tab (existing, unchanged)
└── Assignments Tab (NEW)
    ├── Assignment List (from all enrolled classrooms)
    ├── Assignment Detail View
    └── Submission Form with PDF upload

ClassroomDetailPage (Classwork tab)
├── Assignment List (existing, enhanced)
├── Create Assignment Button (existing, wire up)
└── Assignment Creation Modal (NEW)
    ├── Form: title, description, due_date, max_score
    └── File upload for assignment resources
```

## Implementation Phases

### Phase 1: QuizPanel - Add Tab System
**File:** [phase-01-quizpanel-tab-system.md](phase-01-quizpanel-tab-system.md)
**Duration:** 2-3 hours
**Status:** Not Started

Add tab navigation to QuizPanel, conditional rendering for Quiz vs Assignments.

### Phase 2: QuizPanel - Assignments Tab UI
**File:** [phase-02-quizpanel-assignments-tab.md](phase-02-quizpanel-assignments-tab.md)
**Duration:** 3-4 hours
**Status:** Not Started

Build assignments list view with submission tracking for students.

### Phase 3: QuizPanel - Assignment Detail & Submission
**File:** [phase-03-quizpanel-submission-flow.md](phase-03-quizpanel-submission-flow.md)
**Duration:** 3-4 hours
**Status:** Not Started

Implement assignment detail view with submission form and PDF upload.

### Phase 4: ClassroomDetailPage - Assignment Creation
**File:** [phase-04-classroom-assignment-creation.md](phase-04-classroom-assignment-creation.md)
**Duration:** 3-4 hours
**Status:** Not Started

Wire up "Create Assignment" button with modal form for teachers.

### Phase 5: Testing & Polish
**File:** [phase-05-testing-polish.md](phase-05-testing-polish.md)
**Duration:** 2-3 hours
**Status:** Not Started

End-to-end testing, bug fixes, UX polish, animations.

## Timeline

**Total Estimated Time:** 13-18 hours
**Recommended Approach:** Phase-by-phase with testing after each

## Key Dependencies

- Backend APIs (READY ✓)
- Existing components:
  - FileUpload component (READY ✓)
  - AssignmentList component (READY ✓)
  - SubmissionForm component (READY ✓)
  - GradingInterface component (READY ✓)
- Services:
  - assignmentService (READY ✓)
  - submissionService (READY ✓)

## Success Criteria

- [ ] Students can view assignments from all enrolled classrooms in QuizPanel
- [ ] Students can submit assignments with PDF via QuizPanel
- [ ] Teachers can create assignments from ClassroomDetailPage
- [ ] Teachers can view submission status
- [ ] Teachers can grade submissions
- [ ] All features work with existing animations/styling
- [ ] No regressions in existing quiz functionality
- [ ] Responsive on mobile and desktop

## Risk Assessment

**Low Risk:**
- Backend APIs complete and tested
- Reusable components already exist
- Clear UI patterns established

**Medium Risk:**
- QuizPanel state management complexity (multiple tabs)
- Classroom context availability in MapViewerPage

**Mitigation:**
- Follow existing component patterns closely
- Add classroom context to QuizPanel props
- Test tab switching thoroughly

## Related Files

**Research Reports:**
- [researcher-01-quizpanel-structure.md](research/researcher-01-quizpanel-structure.md)
- [researcher-02-classroom-detail-page.md](research/researcher-02-classroom-detail-page.md)
- [researcher-03-backend-api-status.md](research/researcher-03-backend-api-status.md)
- [scout-01-assignment-files.md](scout/scout-01-assignment-files.md)
- [scout-02-file-upload-components.md](scout/scout-02-file-upload-components.md)

## Next Steps

1. Review this plan
2. Start with Phase 1 (QuizPanel tab system)
3. Test after each phase before proceeding
4. Deploy incrementally if possible
