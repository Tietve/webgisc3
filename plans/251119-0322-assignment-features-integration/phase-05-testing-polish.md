# Phase 5: Testing & Polish

**Date:** 2025-11-19
**Priority:** High
**Status:** Not Started
**Duration:** 2-3 hours
**Dependencies:** Phases 1-4 (all features implemented)

## Context Links

- Main Plan: [plan.md](plan.md)
- All Previous Phases: [phase-01](phase-01-quizpanel-tab-system.md), [phase-02](phase-02-quizpanel-assignments-tab.md), [phase-03](phase-03-quizpanel-submission-flow.md), [phase-04](phase-04-classroom-assignment-creation.md)

## Overview

Comprehensive end-to-end testing of all assignment features, bug fixes, UX polish, performance optimization, and final validation before deployment.

## Key Insights

- Integration testing critical (QuizPanel + ClassroomDetailPage working together)
- Teacher and student workflows must be tested separately
- File upload edge cases most likely source of bugs
- Animation performance needs validation
- Mobile responsiveness must be verified
- Error states often overlooked in implementation

## Requirements

### Functional Testing

1. Student workflow (QuizPanel):
   - View assignments from all enrolled classrooms
   - View assignment details
   - Submit with text answer
   - Submit with PDF file
   - Submit with both text + file
   - View already-submitted assignments
   - View grades when published

2. Teacher workflow (ClassroomDetailPage):
   - Create assignment with all fields
   - Create assignment with minimal fields (title only)
   - Upload assignment attachment
   - View submission status
   - Grade submissions
   - Publish grades

3. Edge cases:
   - No enrolled classrooms
   - No assignments in classroom
   - Late submissions
   - File upload failures
   - Network errors
   - Validation errors

### Non-Functional Testing

- Performance: Load time, animation smoothness
- Responsive: Mobile, tablet, desktop
- Accessibility: Keyboard navigation, screen readers
- Browser compatibility: Chrome, Firefox, Safari, Edge
- Dark mode: All components in dark theme

## Test Scenarios

### Scenario 1: Student Views Assignments (QuizPanel)

**Steps:**
1. Login as student
2. Navigate to MapViewerPage
3. Click QuizPanel button
4. Click "Assignments" tab
5. Wait for assignments to load

**Expected:**
- Loading spinner shows
- Assignments from all enrolled classrooms appear
- Each card shows: classroom name, title, due date, status
- Overdue assignments marked red
- Submitted assignments show green badge
- Empty state if no assignments

**Test Cases:**
- [ ] Student with 0 enrolled classrooms
- [ ] Student with 1 classroom, 0 assignments
- [ ] Student with 1 classroom, 5 assignments
- [ ] Student with 3 classrooms, 20 assignments
- [ ] Student with overdue assignments
- [ ] Student with submitted assignments
- [ ] Student with graded assignments

### Scenario 2: Student Submits Assignment (QuizPanel)

**Steps:**
1. Open QuizPanel → Assignments tab
2. Click unsubmitted assignment
3. View assignment details
4. Fill submission form
5. Submit

**Expected:**
- Detail view shows all assignment info
- Attachment download button if present
- Submission form shows text + file upload
- Late warning if overdue
- Validation prevents empty submission
- Success message after submit
- Returns to list
- Assignment now shows "submitted" status

**Test Cases:**
- [ ] Submit text answer only
- [ ] Submit PDF file only
- [ ] Submit text + PDF
- [ ] Submit late assignment (warning shows)
- [ ] Submit with invalid file type (error)
- [ ] Submit with oversized file (error)
- [ ] Submit with network error (retry)
- [ ] Cancel submission (returns to list)
- [ ] Submit assignment with no due date

### Scenario 3: Student Views Graded Assignment

**Steps:**
1. Open QuizPanel → Assignments tab
2. Click graded assignment
3. View submission details

**Expected:**
- Shows "submitted" status
- Displays grade if published
- Shows feedback if provided
- No submission form (already submitted)
- Back button returns to list

**Test Cases:**
- [ ] View submitted (not graded)
- [ ] View graded (published)
- [ ] View graded (not published - should not show grade)
- [ ] View late submission

### Scenario 4: Teacher Creates Assignment

**Steps:**
1. Login as teacher
2. Navigate to ClassroomDetailPage
3. Click "Classwork" tab
4. Click "Create Assignment" button
5. Fill form
6. Submit

**Expected:**
- Modal opens
- All form fields render
- Validation shows for required fields
- File upload works
- Success creates assignment
- Modal closes
- AssignmentList refreshes
- New assignment appears in list

**Test Cases:**
- [ ] Create with title only (minimal)
- [ ] Create with all fields
- [ ] Create with PDF attachment
- [ ] Create with future due date
- [ ] Create without due date
- [ ] Validation: empty title (error)
- [ ] Validation: past due date (error)
- [ ] Validation: negative max score (error)
- [ ] Validation: invalid file type (error)
- [ ] Cancel creation (modal closes, no assignment created)
- [ ] Network error during creation (error shown, retry)

### Scenario 5: Tab Switching (QuizPanel)

**Steps:**
1. Open QuizPanel with quiz
2. Switch to Assignments tab
3. Switch back to Quiz tab
4. Verify state

**Expected:**
- Tab switch animations smooth
- Quiz state resets when leaving quiz tab
- Assignments load when switching to assignments tab
- No state corruption between tabs
- Active tab clearly indicated

**Test Cases:**
- [ ] Switch Quiz → Assignments
- [ ] Switch Assignments → Quiz
- [ ] Switch during quiz submission (should block)
- [ ] Switch during assignment loading
- [ ] Close panel and reopen (state resets)

### Scenario 6: Mobile Responsiveness

**Steps:**
1. Open on mobile device (or Chrome DevTools mobile view)
2. Test all features

**Expected:**
- QuizPanel width adapts to screen
- Tab navigation stacks if needed
- Assignment cards responsive
- Form fields full width
- Buttons touch-friendly (min 44px)
- Modals full screen or properly sized

**Test Cases:**
- [ ] QuizPanel on mobile (320px width)
- [ ] Assignment cards readable on mobile
- [ ] Submission form on mobile
- [ ] File upload on mobile
- [ ] ClassroomDetailPage modal on mobile
- [ ] Tablet view (768px)

### Scenario 7: Dark Mode

**Steps:**
1. Enable dark mode
2. Test all features

**Expected:**
- All components use dark theme colors
- Text readable (sufficient contrast)
- Borders/dividers visible
- Hover states clear
- No white flashes

**Test Cases:**
- [ ] QuizPanel in dark mode
- [ ] Assignment cards in dark mode
- [ ] Submission form in dark mode
- [ ] File upload in dark mode
- [ ] Assignment modal in dark mode
- [ ] Success/error messages in dark mode

### Scenario 8: Error Handling

**Test Cases:**
- [ ] Network error loading assignments (retry works)
- [ ] Network error submitting assignment (error shown)
- [ ] Network error creating assignment (error shown)
- [ ] Invalid file upload (error shown)
- [ ] Validation errors (shown per field)
- [ ] Backend error responses (parsed and shown)
- [ ] Empty classrooms (empty state helpful)
- [ ] No assignments (empty state helpful)

### Scenario 9: Performance

**Test Cases:**
- [ ] Load 50 assignments <2s
- [ ] Assignment card animations 60fps
- [ ] Tab switching <100ms
- [ ] File upload shows progress
- [ ] Scroll smooth with 100 assignments
- [ ] No memory leaks (open/close panel 10x)
- [ ] No excessive API calls

### Scenario 10: Accessibility

**Test Cases:**
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader announces tab changes
- [ ] Form labels associated
- [ ] Error messages announced
- [ ] Focus management (modal traps focus)
- [ ] Color contrast sufficient (WCAG AA)
- [ ] Touch targets min 44x44px

## Bug Fixes Checklist

Common bugs to watch for:

- [ ] State not resetting between tabs
- [ ] File upload not clearing after submit
- [ ] Validation errors persisting after field change
- [ ] Modal not closing on success
- [ ] AssignmentList not refreshing
- [ ] Datetime input timezone issues
- [ ] FileUpload component not removing file
- [ ] Animation flickering
- [ ] Dark mode color issues
- [ ] Mobile layout breaking
- [ ] Tab indicator not updating
- [ ] Network errors not shown
- [ ] Loading spinners not showing
- [ ] Success messages not appearing
- [ ] Back button not working

## Polish Checklist

UX improvements:

- [ ] Add loading skeletons instead of spinners
- [ ] Add micro-interactions (button press feedback)
- [ ] Smooth scroll to top when switching tabs
- [ ] Add success toast notifications
- [ ] Add assignment count badge on Assignments tab
- [ ] Add keyboard shortcuts (Esc to close)
- [ ] Add drag-and-drop file upload visual feedback
- [ ] Add file upload progress bar for large files
- [ ] Add empty state illustrations
- [ ] Add tooltip explanations for icons
- [ ] Add confirmation dialog before cancel
- [ ] Add auto-save draft functionality (optional)
- [ ] Add assignment search/filter (optional)

## Performance Optimization

- [ ] Memoize expensive computations (useMemo)
- [ ] Debounce validation functions
- [ ] Lazy load modal components
- [ ] Optimize re-renders (React.memo)
- [ ] Virtual scrolling for 100+ assignments
- [ ] Compress images/icons
- [ ] Minimize bundle size
- [ ] Cache assignments in localStorage (5min TTL)

## Code Quality

- [ ] Remove console.log statements
- [ ] Add proper PropTypes or TypeScript
- [ ] Document complex functions
- [ ] Consistent code formatting
- [ ] Remove unused imports
- [ ] Remove commented code
- [ ] Fix linting warnings
- [ ] Add error boundaries

## Documentation

- [ ] Update README with new features
- [ ] Add JSDoc comments to new functions
- [ ] Document API integration
- [ ] Create user guide for assignments
- [ ] Document configuration options

## Deployment Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] No linting errors
- [ ] Build succeeds
- [ ] Bundle size acceptable
- [ ] Environment variables set
- [ ] Backend APIs verified in production
- [ ] Database migrations applied
- [ ] File upload storage configured
- [ ] CORS configured
- [ ] SSL certificates valid

## Success Criteria

### Must Have (Blockers)

- [ ] Students can view assignments
- [ ] Students can submit assignments
- [ ] Teachers can create assignments
- [ ] File upload works (PDF)
- [ ] No critical bugs
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Dark mode works

### Should Have (High Priority)

- [ ] All test scenarios pass
- [ ] Performance acceptable
- [ ] Accessibility compliance
- [ ] Error handling comprehensive
- [ ] UX polished

### Nice to Have (Optional)

- [ ] Advanced filtering
- [ ] Draft auto-save
- [ ] Real-time updates
- [ ] Advanced analytics

## Testing Tools

### Manual Testing
- Chrome DevTools (mobile view, network throttling)
- Browser extensions (React DevTools, Axe for accessibility)
- Multiple browsers (Chrome, Firefox, Safari, Edge)
- Real mobile devices

### Automated Testing (if time permits)
- Unit tests for helper functions
- Integration tests for API calls
- E2E tests for critical workflows
- Screenshot testing for visual regressions

## Regression Testing

Verify existing features still work:

- [ ] Quiz functionality unchanged in Quiz tab
- [ ] Classroom list/detail pages work
- [ ] Lessons panel works
- [ ] Tools panel works
- [ ] Map viewer works
- [ ] Authentication works
- [ ] Profile page works

## Risk Assessment

### High Risk Areas

- File upload (most complex, most likely to fail)
- State management (multiple tabs, view modes)
- API integration (network errors, data format)

### Mitigation

- Extra testing on file upload scenarios
- Thorough state reset testing
- Mock API responses for testing
- Add error boundaries
- Add retry logic for network calls

## Post-Deployment Monitoring

After deployment, monitor:

- [ ] Error tracking (Sentry, LogRocket)
- [ ] Performance metrics (Lighthouse)
- [ ] User feedback
- [ ] API error rates
- [ ] File upload success rates
- [ ] Browser console errors

## Rollback Plan

If critical issues found:

1. Document the issue
2. Disable feature flag (if implemented)
3. Revert to previous version
4. Fix in development
5. Re-test thoroughly
6. Re-deploy

## Next Steps

After completing this phase:

1. Deploy to staging environment
2. User acceptance testing
3. Fix any bugs found
4. Deploy to production
5. Monitor for issues
6. Gather user feedback
7. Plan future enhancements

## Unresolved Questions

1. Need analytics tracking for assignment features?
2. Need feature flags for gradual rollout?
3. Need A/B testing for UI variations?
4. Need user onboarding/tutorial?
5. Need admin dashboard for assignment monitoring?
