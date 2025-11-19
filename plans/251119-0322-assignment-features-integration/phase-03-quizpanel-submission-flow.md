# Phase 3: QuizPanel - Assignment Detail & Submission

**Date:** 2025-11-19
**Priority:** High
**Status:** Not Started
**Duration:** 3-4 hours
**Dependencies:** Phase 2 (Assignments Tab UI)

## Context Links

- Main Plan: [plan.md](plan.md)
- Previous Phase: [phase-02-quizpanel-assignments-tab.md](phase-02-quizpanel-assignments-tab.md)
- Research: [researcher-01-quizpanel-structure.md](research/researcher-01-quizpanel-structure.md)
- Scout: [scout-02-file-upload-components.md](scout/scout-02-file-upload-components.md)
- Reference: `frontend/src/components/classroom/SubmissionForm.jsx`

## Overview

Implement assignment detail view with submission form when student clicks assignment card. Enable PDF upload and text answer submission within QuizPanel.

## Key Insights

- Reuse existing SubmissionForm component patterns
- FileUpload component already available and tested
- Submission requires: text_answer OR file (at least one)
- Late submission warning critical for UX
- Backend API complete: `POST /api/v1/assignments/{id}/submissions/submit/`
- Success flow: Submit → Show success → Return to list → Refresh
- View mode for already-submitted assignments (show grade if published)

## Requirements

### Functional Requirements

1. Click assignment card → Show detail view in panel
2. Display assignment: title, description, due date, max score, attachment
3. Download assignment attachment if present
4. Show submission form if not submitted yet
5. Submission form: text answer textarea + file upload
6. Validate: require at least text OR file
7. Show late submission warning if past due
8. Submit to backend API with FormData
9. Show success confirmation
10. Return to assignments list after submit
11. If already submitted: show submission details + grade (if published)
12. Back button to return to assignments list

### Non-Functional Requirements

- File upload max 10MB (PDF only for assignments)
- Submission within 3 seconds for text-only
- Clear error messages for validation/network failures
- Animations consistent with panel theme

## Architecture

### View States

```
Assignment Detail View
├── Header (Back Button + Assignment Title)
├── Assignment Info Section
│   ├── Classroom Name
│   ├── Description
│   ├── Due Date
│   ├── Max Score
│   └── Attachment Download Button
├── Conditional Content
│   ├── Not Submitted → Submission Form
│   ├── Submitted (no grade) → View Submission
│   └── Graded → View Submission + Grade
└── Action Buttons
    ├── Back to List
    └── Submit (if form shown)
```

### State Management

```javascript
// New state
const [viewMode, setViewMode] = useState('list') // 'list' | 'detail'
const [selectedAssignment, setSelectedAssignment] = useState(null)
const [submissionText, setSubmissionText] = useState('')
const [submissionFile, setSubmissionFile] = useState(null)
const [submitting, setSubmitting] = useState(false)
const [submitError, setSubmitError] = useState(null)
const [showSuccessMessage, setShowSuccessMessage] = useState(false)
```

### Data Flow

```
User clicks assignment card
  ↓
setSelectedAssignment(assignment)
setViewMode('detail')
  ↓
Render detail view with assignment info
  ↓
Check assignment.submissionStatus
  ↓ (if not submitted)
Show submission form
  ↓
User enters text and/or uploads file
  ↓
Validate (at least one field filled)
  ↓
Submit FormData to submissionService.submit()
  ↓
Show success message
  ↓
Refresh assignments list
  ↓
Return to list view
```

## Related Code Files

### Files to Modify

1. **`frontend/src/components/map/QuizPanel/index.jsx`**
   - Add detail view rendering
   - Add submission form logic
   - Add state for view mode and submission
   - Handle back navigation

### Files to Reference

1. **`frontend/src/components/classroom/SubmissionForm.jsx`**
   - Reuse form validation logic
   - Adapt FormData construction
   - Reference late warning UI

2. **`frontend/src/components/common/FileUpload/index.jsx`**
   - Use for file upload UI
   - Props: accept=".pdf", maxSize=10MB

3. **`frontend/src/services/submission.service.js`**
   - Use submit(assignmentId, formData) method

## Implementation Steps

### Step 1: Add Detail View State

Add state for detail view management:

```javascript
const [viewMode, setViewMode] = useState('list') // 'list' | 'detail'
const [selectedAssignment, setSelectedAssignment] = useState(null)
const [submissionText, setSubmissionText] = useState('')
const [submissionFile, setSubmissionFile] = useState(null)
const [submitting, setSubmitting] = useState(false)
const [submitError, setSubmitError] = useState(null)
const [showSuccessMessage, setShowSuccessMessage] = useState(false)
```

### Step 2: Update Assignment Card Click Handler

Modify click handler in assignment cards:

```javascript
onClick={() => {
  setSelectedAssignment(assignment)
  setViewMode('detail')
  setSubmissionText('')
  setSubmissionFile(null)
  setSubmitError(null)
}}
```

### Step 3: Create Assignment Detail Renderer

Add detail view rendering function:

```javascript
const renderAssignmentDetail = () => {
  if (!selectedAssignment) return null

  const isLate = selectedAssignment.isOverdue
  const canSubmit = selectedAssignment.submissionStatus === 'not_submitted'

  return (
    <div className="space-y-4">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setViewMode('list')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          ← Quay lại
        </button>
        <h2 className="text-xl font-bold flex-1">{selectedAssignment.title}</h2>
      </div>

      {/* Assignment Info */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-700 dark:text-blue-300">
            📚 {selectedAssignment.classroom.name}
          </span>
        </div>

        {selectedAssignment.description && (
          <div>
            <h3 className="font-semibold mb-1">Mô tả:</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {selectedAssignment.description}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-semibold">Hạn nộp:</span>
            <p className={isLate ? 'text-red-500' : ''}>
              {formatDueDate(selectedAssignment.due_date)}
              {isLate && ' (Quá hạn)'}
            </p>
          </div>
          <div>
            <span className="font-semibold">Điểm tối đa:</span>
            <p>{selectedAssignment.max_score || 'N/A'}</p>
          </div>
        </div>

        {selectedAssignment.attachment && (
          <div>
            <a
              href={selectedAssignment.attachment}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              📎 Tải tài liệu đính kèm
            </a>
          </div>
        )}
      </div>

      {/* Submission Section */}
      {canSubmit ? renderSubmissionForm() : renderSubmissionView()}
    </div>
  )
}
```

### Step 4: Create Submission Form Renderer

Add submission form with validation:

```javascript
const renderSubmissionForm = () => {
  const isLate = selectedAssignment.isOverdue

  return (
    <div className="space-y-4">
      {/* Late Warning */}
      {isLate && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold text-yellow-800 dark:text-yellow-300">
                Bài tập đã quá hạn nộp
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Bài nộp của bạn sẽ được đánh dấu là nộp muộn.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Text Answer */}
      <div>
        <label className="block font-semibold mb-2">
          Câu trả lời văn bản:
        </label>
        <textarea
          value={submissionText}
          onChange={(e) => setSubmissionText(e.target.value)}
          placeholder="Nhập câu trả lời của bạn..."
          className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={submitting}
        />
      </div>

      {/* File Upload */}
      <div>
        <label className="block font-semibold mb-2">
          Hoặc tải file lên:
        </label>
        <FileUpload
          accept=".pdf"
          maxSize={10 * 1024 * 1024} // 10MB
          onFileSelect={(file) => setSubmissionFile(file)}
          onFileRemove={() => setSubmissionFile(null)}
          disabled={submitting}
          error={submitError}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Chấp nhận: PDF (tối đa 10MB)
        </p>
      </div>

      {/* Validation Error */}
      {submitError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3">
          <p className="text-red-700 dark:text-red-300">{submitError}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setViewMode('list')}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          disabled={submitting}
        >
          Hủy
        </button>
        <button
          onClick={handleSubmitAssignment}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={submitting || (!submissionText && !submissionFile)}
        >
          {submitting ? '⏳ Đang nộp...' : '📤 Nộp bài'}
        </button>
      </div>
    </div>
  )
}
```

### Step 5: Create Submission View Renderer

Show existing submission with grade:

```javascript
const renderSubmissionView = () => {
  const { submissionStatus, grade, max_score } = selectedAssignment

  return (
    <div className="space-y-4">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">✅</span>
          <h3 className="font-bold text-green-800 dark:text-green-300">
            Đã nộp bài
          </h3>
        </div>
        <p className="text-green-700 dark:text-green-400">
          Bạn đã nộp bài tập này.
          {submissionStatus === 'late' && ' (Nộp muộn)'}
        </p>

        {submissionStatus === 'graded' && grade !== null && (
          <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
            <p className="font-semibold">Điểm số:</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {grade} / {max_score}
            </p>
          </div>
        )}

        {submissionStatus === 'submitted' && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Bài của bạn đang chờ giáo viên chấm điểm.
          </p>
        )}
      </div>

      <button
        onClick={() => setViewMode('list')}
        className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
      >
        ← Quay lại danh sách
      </button>
    </div>
  )
}
```

### Step 6: Implement Submit Handler

Add submission logic with validation:

```javascript
const handleSubmitAssignment = async () => {
  // Validation
  if (!submissionText && !submissionFile) {
    setSubmitError('Vui lòng nhập câu trả lời hoặc tải file lên.')
    return
  }

  setSubmitting(true)
  setSubmitError(null)

  try {
    // Build FormData
    const formData = new FormData()
    if (submissionText) {
      formData.append('text_answer', submissionText)
    }
    if (submissionFile) {
      formData.append('file', submissionFile)
    }

    // Submit to API
    await submissionService.submit(selectedAssignment.id, formData)

    // Show success
    setShowSuccessMessage(true)

    // Refresh assignments list
    await loadAssignments()

    // Return to list after 2 seconds
    setTimeout(() => {
      setShowSuccessMessage(false)
      setViewMode('list')
      setSelectedAssignment(null)
      setSubmissionText('')
      setSubmissionFile(null)
    }, 2000)

  } catch (error) {
    console.error('Submission error:', error)
    setSubmitError(
      error.response?.data?.message ||
      'Không thể nộp bài. Vui lòng thử lại.'
    )
  } finally {
    setSubmitting(false)
  }
}
```

### Step 7: Add Success Message Overlay

Show success animation after submit:

```javascript
const renderSuccessMessage = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
  >
    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-xl text-center">
      <div className="text-6xl mb-4">✅</div>
      <h3 className="text-2xl font-bold mb-2">Nộp bài thành công!</h3>
      <p className="text-gray-600 dark:text-gray-400">
        Bài tập của bạn đã được gửi đến giáo viên.
      </p>
    </div>
  </motion.div>
)
```

### Step 8: Update Main Render Logic

Update renderAssignmentsContent to support view modes:

```javascript
const renderAssignmentsContent = () => {
  if (viewMode === 'detail') {
    return (
      <>
        {renderAssignmentDetail()}
        <AnimatePresence>
          {showSuccessMessage && renderSuccessMessage()}
        </AnimatePresence>
      </>
    )
  }

  // Existing list view rendering
  return renderAssignmentsList()
}
```

### Step 9: Reset State on Tab Switch

Reset detail view when switching tabs:

```javascript
useEffect(() => {
  if (activeTab !== 'assignments') {
    setViewMode('list')
    setSelectedAssignment(null)
    setSubmissionText('')
    setSubmissionFile(null)
    setSubmitError(null)
  }
}, [activeTab])
```

## Todo List

- [ ] Add detail view state management
- [ ] Update assignment card click handlers
- [ ] Create renderAssignmentDetail function
- [ ] Create renderSubmissionForm function
- [ ] Create renderSubmissionView function
- [ ] Implement handleSubmitAssignment with validation
- [ ] Add FileUpload component integration
- [ ] Add late submission warning UI
- [ ] Add success message overlay
- [ ] Update main render logic for view modes
- [ ] Add back button navigation
- [ ] Test text-only submission
- [ ] Test file-only submission
- [ ] Test text + file submission
- [ ] Test late submission warning
- [ ] Test validation errors
- [ ] Test network errors
- [ ] Test submission view for already-submitted
- [ ] Test grade display when published
- [ ] Verify file upload (10MB PDF)

## Success Criteria

### Functional

- [ ] Click assignment → Detail view shows
- [ ] Assignment info displays correctly
- [ ] Attachment download works
- [ ] Submission form validates (require text OR file)
- [ ] File upload accepts PDF only, max 10MB
- [ ] Late warning shows if overdue
- [ ] Submit button disabled until valid
- [ ] Submission succeeds and shows success message
- [ ] Returns to list after success
- [ ] Assignments list refreshes after submit
- [ ] Already-submitted assignments show submission view
- [ ] Grade displays when published
- [ ] Back button works from detail view

### Visual

- [ ] Detail view animations smooth
- [ ] Success message animates nicely
- [ ] Loading states clear during submit
- [ ] Error messages prominent and helpful
- [ ] Layout responsive on mobile

### Performance

- [ ] Submission <3s for text-only
- [ ] File upload shows progress if slow
- [ ] No UI freeze during submit
- [ ] Animations 60fps

## Risk Assessment

### Medium Risk

- File upload might be slow on poor network
- FormData construction might have issues
- State management complexity with view modes

### Mitigation

- Add upload progress indicator for files
- Test FormData thoroughly with different combinations
- Add comprehensive state reset logic
- Add loading states for all async operations

## Security Considerations

- Backend validates file type and size
- Frontend validation is UX only (backend enforces)
- Submission endpoint requires authentication
- No client-side file content validation needed (backend handles)

## Performance Optimization

### File Upload Progress

Add progress tracking for large files:

```javascript
const handleSubmitAssignment = async () => {
  // ... existing code

  const config = {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      )
      setUploadProgress(percentCompleted)
    }
  }

  await submissionService.submit(selectedAssignment.id, formData, config)
}
```

## Accessibility

- Form labels properly associated
- File upload keyboard accessible
- Error messages announced to screen readers
- Focus management (focus on error, success message)
- Submit button has clear disabled state

## Next Steps

After completing this phase:

1. Test all submission scenarios thoroughly
2. Verify file upload works with PDFs
3. Test on mobile devices
4. Proceed to Phase 4: ClassroomDetailPage assignment creation
5. Consider adding submission editing (if time permits)

## Unresolved Questions

1. Allow editing submissions after submit?
2. Show submission history/versioning?
3. Add file preview before upload?
4. Support multiple file uploads?
5. Add draft auto-save functionality?
