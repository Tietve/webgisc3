# Phase 4: ClassroomDetailPage - Assignment Creation

**Date:** 2025-11-19
**Priority:** High
**Status:** Not Started
**Duration:** 3-4 hours
**Dependencies:** None (independent from QuizPanel phases)

## Context Links

- Main Plan: [plan.md](plan.md)
- Research: [researcher-02-classroom-detail-page.md](research/researcher-02-classroom-detail-page.md)
- Scout: [scout-01-assignment-files.md](scout/scout-01-assignment-files.md)
- Reference: `frontend/src/features/classroom/pages/ClassroomDetailPage.jsx`

## Overview

Wire up existing "Create Assignment" button in ClassroomDetailPage Classwork tab with modal form for teachers to create assignments with title, description, deadline, max score, and PDF attachment.

## Key Insights

- Button already exists (line 370-377) but no onClick handler
- Teacher permission check already in place: `isOwner` variable
- Existing AnnouncementModal pattern can be adapted
- SubmissionForm patterns applicable for file upload
- Backend API ready: `POST /api/v1/classrooms/{id}/assignments/`
- Success flow: Create → Refresh AssignmentList → Close modal
- AssignmentList component already displays assignments

## Requirements

### Functional Requirements

1. Wire up "Create Assignment" button click handler
2. Show modal with assignment creation form
3. Form fields:
   - Title (required, text input)
   - Description (optional, textarea)
   - Due Date (optional, datetime-local input)
   - Max Score (optional, number input)
   - Attachment (optional, PDF file upload)
4. Validate required fields before submit
5. Submit to backend API with FormData
6. Show success/error messages
7. Refresh AssignmentList after successful creation
8. Close modal on success or cancel
9. Only visible to classroom owner (teacher)

### Non-Functional Requirements

- Form validation immediate (on blur/change)
- Clear error messages for each field
- File upload max 10MB PDF
- Modal responsive on mobile
- Smooth animations (fade in/out)

## Architecture

### Component Structure

```
ClassroomDetailPage (Classwork Tab)
├── Create Assignment Button (existing, wire up)
└── AssignmentCreationModal (NEW)
    ├── Modal Backdrop
    ├── Modal Container
    ├── Header (title + close button)
    ├── Form
    │   ├── Title Field (required)
    │   ├── Description Field (textarea)
    │   ├── Due Date Field (datetime picker)
    │   ├── Max Score Field (number)
    │   └── Attachment Upload (FileUpload component)
    ├── Validation Errors
    └── Actions
        ├── Cancel Button
        └── Create Button (disabled until valid)
```

### State Management

```javascript
// New state in ClassroomDetailPage
const [showAssignmentModal, setShowAssignmentModal] = useState(false)
const [assignmentForm, setAssignmentForm] = useState({
  title: '',
  description: '',
  due_date: '',
  max_score: '',
  attachment: null
})
const [formErrors, setFormErrors] = useState({})
const [submitting, setSubmitting] = useState(false)
const [submitError, setSubmitError] = useState(null)
```

### Data Flow

```
Teacher clicks "Create Assignment" button
  ↓
setShowAssignmentModal(true)
  ↓
Modal renders with empty form
  ↓
Teacher fills form fields
  ↓
Validate on change/blur
  ↓
Teacher clicks "Create"
  ↓
Validate all fields
  ↓
Build FormData with all fields
  ↓
POST to assignmentService.create(classroomId, formData)
  ↓
Success: Refresh AssignmentList, close modal
  ↓
Error: Show error message, keep modal open
```

## Related Code Files

### Files to Modify

1. **`frontend/src/features/classroom/pages/ClassroomDetailPage.jsx`**
   - Add assignment modal state
   - Wire up "Create Assignment" button
   - Add AssignmentCreationModal component
   - Add form submission logic
   - Refresh AssignmentList after creation

### Files to Reference

1. **`frontend/src/components/classroom/SubmissionForm.jsx`**
   - Reference for FormData construction
   - File upload patterns

2. **`frontend/src/components/common/FileUpload/index.jsx`**
   - Use for attachment upload

3. **`frontend/src/services/assignment.service.js`**
   - Use create(classroomId, formData) method

## Implementation Steps

### Step 1: Add Assignment Modal State

Add state to ClassroomDetailPage component:

```javascript
const [showAssignmentModal, setShowAssignmentModal] = useState(false)
const [assignmentForm, setAssignmentForm] = useState({
  title: '',
  description: '',
  due_date: '',
  max_score: '',
  attachment: null
})
const [formErrors, setFormErrors] = useState({})
const [submitting, setSubmitting] = useState(false)
const [submitError, setSubmitError] = useState(null)
```

### Step 2: Wire Up Create Button

Update existing "Create Assignment" button with onClick handler (around line 370):

```javascript
{isOwner && (
  <div className="flex justify-end">
    <button
      onClick={() => setShowAssignmentModal(true)}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200"
    >
      <span className="text-xl">➕</span>
      <span className="font-medium">Tạo bài tập</span>
    </button>
  </div>
)}
```

### Step 3: Create Modal Component

Add AssignmentCreationModal component in same file:

```javascript
const AssignmentCreationModal = () => {
  if (!showAssignmentModal) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">📝 Tạo bài tập mới</h2>
            <button
              onClick={handleCloseModal}
              className="text-white hover:bg-white/20 p-1 rounded transition-colors"
              disabled={submitting}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Title Field */}
          <div>
            <label className="block font-semibold mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={assignmentForm.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              onBlur={() => validateField('title')}
              placeholder="Nhập tiêu đề bài tập..."
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              disabled={submitting}
            />
            {formErrors.title && (
              <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className="block font-semibold mb-2">Mô tả</label>
            <textarea
              value={assignmentForm.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Mô tả chi tiết bài tập..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-32"
              disabled={submitting}
            />
          </div>

          {/* Due Date Field */}
          <div>
            <label className="block font-semibold mb-2">Hạn nộp</label>
            <input
              type="datetime-local"
              value={assignmentForm.due_date}
              onChange={(e) => handleFieldChange('due_date', e.target.value)}
              onBlur={() => validateField('due_date')}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.due_date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              disabled={submitting}
            />
            {formErrors.due_date && (
              <p className="text-red-500 text-sm mt-1">{formErrors.due_date}</p>
            )}
          </div>

          {/* Max Score Field */}
          <div>
            <label className="block font-semibold mb-2">Điểm tối đa</label>
            <input
              type="number"
              value={assignmentForm.max_score}
              onChange={(e) => handleFieldChange('max_score', e.target.value)}
              onBlur={() => validateField('max_score')}
              placeholder="VD: 10"
              min="0"
              step="0.5"
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.max_score ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              disabled={submitting}
            />
            {formErrors.max_score && (
              <p className="text-red-500 text-sm mt-1">{formErrors.max_score}</p>
            )}
          </div>

          {/* Attachment Upload */}
          <div>
            <label className="block font-semibold mb-2">Tài liệu đính kèm</label>
            <FileUpload
              accept=".pdf,.doc,.docx"
              maxSize={10 * 1024 * 1024} // 10MB
              onFileSelect={(file) => handleFieldChange('attachment', file)}
              onFileRemove={() => handleFieldChange('attachment', null)}
              disabled={submitting}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Chấp nhận: PDF, DOC, DOCX (tối đa 10MB)
            </p>
          </div>

          {/* Global Error */}
          {submitError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3">
              <p className="text-red-700 dark:text-red-300">{submitError}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 rounded-b-lg flex justify-end gap-3">
          <button
            onClick={handleCloseModal}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            disabled={submitting}
          >
            Hủy
          </button>
          <button
            onClick={handleCreateAssignment}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting || !assignmentForm.title}
          >
            {submitting ? '⏳ Đang tạo...' : '✅ Tạo bài tập'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
```

### Step 4: Add Form Handler Functions

Add form management functions:

```javascript
const handleFieldChange = (field, value) => {
  setAssignmentForm(prev => ({
    ...prev,
    [field]: value
  }))
  // Clear error when field changes
  if (formErrors[field]) {
    setFormErrors(prev => ({
      ...prev,
      [field]: null
    }))
  }
}

const validateField = (field) => {
  const errors = {}

  if (field === 'title') {
    if (!assignmentForm.title.trim()) {
      errors.title = 'Tiêu đề không được để trống'
    } else if (assignmentForm.title.length > 200) {
      errors.title = 'Tiêu đề không được quá 200 ký tự'
    }
  }

  if (field === 'due_date') {
    if (assignmentForm.due_date) {
      const dueDate = new Date(assignmentForm.due_date)
      const now = new Date()
      if (dueDate < now) {
        errors.due_date = 'Hạn nộp phải là thời gian trong tương lai'
      }
    }
  }

  if (field === 'max_score') {
    if (assignmentForm.max_score !== '' && assignmentForm.max_score <= 0) {
      errors.max_score = 'Điểm tối đa phải lớn hơn 0'
    }
  }

  setFormErrors(prev => ({
    ...prev,
    ...errors
  }))

  return Object.keys(errors).length === 0
}

const validateAllFields = () => {
  const allValid = ['title', 'due_date', 'max_score'].every(validateField)
  return allValid && assignmentForm.title.trim()
}

const handleCloseModal = () => {
  if (submitting) return
  setShowAssignmentModal(false)
  setAssignmentForm({
    title: '',
    description: '',
    due_date: '',
    max_score: '',
    attachment: null
  })
  setFormErrors({})
  setSubmitError(null)
}
```

### Step 5: Implement Create Assignment Handler

Add submission logic:

```javascript
const handleCreateAssignment = async () => {
  // Validate all fields
  if (!validateAllFields()) {
    setSubmitError('Vui lòng kiểm tra lại các trường thông tin.')
    return
  }

  setSubmitting(true)
  setSubmitError(null)

  try {
    // Build FormData
    const formData = new FormData()
    formData.append('title', assignmentForm.title.trim())

    if (assignmentForm.description.trim()) {
      formData.append('description', assignmentForm.description.trim())
    }

    if (assignmentForm.due_date) {
      // Convert to ISO format for backend
      const dueDate = new Date(assignmentForm.due_date)
      formData.append('due_date', dueDate.toISOString())
    }

    if (assignmentForm.max_score !== '') {
      formData.append('max_score', assignmentForm.max_score)
    }

    if (assignmentForm.attachment) {
      formData.append('attachment', assignmentForm.attachment)
    }

    // Submit to API
    await assignmentService.create(id, formData) // id from useParams

    // Success: refresh assignment list
    // AssignmentList component should have a ref or state trigger
    // For now, we'll reload the entire classroom data
    await loadClassroom() // Re-fetch classroom data

    // Close modal
    handleCloseModal()

    // Optional: Show success toast
    // toast.success('Bài tập đã được tạo thành công!')

  } catch (error) {
    console.error('Create assignment error:', error)
    setSubmitError(
      error.response?.data?.message ||
      error.response?.data?.title?.[0] ||
      'Không thể tạo bài tập. Vui lòng thử lại.'
    )
  } finally {
    setSubmitting(false)
  }
}
```

### Step 6: Render Modal in JSX

Add modal to component render (before final closing tag):

```javascript
return (
  <div>
    {/* ... existing ClassroomDetailPage content ... */}

    {/* Assignment Creation Modal */}
    <AnimatePresence>
      {showAssignmentModal && <AssignmentCreationModal />}
    </AnimatePresence>
  </div>
)
```

### Step 7: Add AssignmentList Refresh Logic

Modify AssignmentList to refresh after creation. Option 1: Use key prop:

```javascript
// In Classwork tab rendering
<AssignmentList
  key={assignments.length} // Force re-render when count changes
  classroomId={id}
  isTeacher={isOwner}
/>
```

Option 2: Add refresh callback to AssignmentList component (better):

```javascript
// Update AssignmentList component to accept onRefresh prop
// Then call it after successful creation
await assignmentService.create(id, formData)
assignmentListRef.current?.refresh()
```

## Todo List

- [ ] Add assignment modal state to ClassroomDetailPage
- [ ] Wire up "Create Assignment" button onClick
- [ ] Create AssignmentCreationModal component
- [ ] Add form fields: title, description, due_date, max_score, attachment
- [ ] Implement handleFieldChange function
- [ ] Implement validateField function
- [ ] Implement validateAllFields function
- [ ] Implement handleCloseModal function
- [ ] Implement handleCreateAssignment function
- [ ] Add FileUpload integration for attachment
- [ ] Add FormData construction logic
- [ ] Add form validation errors display
- [ ] Add global error handling
- [ ] Add loading state during submission
- [ ] Render modal with AnimatePresence
- [ ] Add AssignmentList refresh logic
- [ ] Test form validation (required fields)
- [ ] Test date validation (future dates)
- [ ] Test score validation (positive numbers)
- [ ] Test file upload (PDF, DOC, DOCX)
- [ ] Test success flow (create + refresh + close)
- [ ] Test error handling (network, validation)
- [ ] Verify modal responsive on mobile
- [ ] Test cancel button

## Success Criteria

### Functional

- [ ] "Create Assignment" button visible only to teacher
- [ ] Modal opens when button clicked
- [ ] All form fields render correctly
- [ ] Title field required validation works
- [ ] Due date must be future (validation)
- [ ] Max score must be positive (validation)
- [ ] File upload accepts PDF/DOC/DOCX only
- [ ] File upload validates 10MB limit
- [ ] Submit button disabled until title filled
- [ ] Form submits successfully to backend
- [ ] AssignmentList refreshes after creation
- [ ] Modal closes on success
- [ ] Cancel button closes modal without submitting
- [ ] Error messages clear and helpful

### Visual

- [ ] Modal animations smooth (fade in/out)
- [ ] Form layout clean and organized
- [ ] Validation errors prominent in red
- [ ] Loading state shows during submit
- [ ] Modal responsive on mobile (full screen if needed)
- [ ] Dark mode styling consistent

### Technical

- [ ] No console errors
- [ ] FormData constructed correctly
- [ ] API called with correct parameters
- [ ] State resets properly on close
- [ ] No memory leaks from modal

## Risk Assessment

### Low Risk

- Modal pattern already established (AnnouncementModal)
- Backend API complete and tested
- FileUpload component proven

### Medium Risk

- Form validation might have edge cases
- Datetime-local input browser compatibility
- AssignmentList refresh mechanism

### Mitigation

- Comprehensive validation testing
- Fallback for datetime input (text input with format hint)
- Use key prop for guaranteed AssignmentList refresh
- Test on multiple browsers

## Security Considerations

- Backend validates all fields (title required, dates, scores)
- Backend validates file type and size
- Teacher-only permission enforced by backend (`classroom.teacher == request.user`)
- No XSS risk (all inputs sanitized by React)

## Performance Optimization

- Lazy load modal content (render only when open)
- Debounce validation on change (validate on blur instead)
- Memoize validation functions
- Optimize file upload (chunking for large files if needed)

## Accessibility

- Form labels properly associated with inputs
- Required fields marked with asterisk and aria-required
- Error messages linked to fields with aria-describedby
- Modal traps focus (Tab cycles within modal)
- Escape key closes modal
- Submit on Enter key in title field

## Next Steps

After completing this phase:

1. Test assignment creation thoroughly
2. Verify AssignmentList shows new assignments
3. Test with different file types
4. Proceed to Phase 5: Testing & Polish
5. Consider adding assignment editing (future enhancement)

## Unresolved Questions

1. Should there be assignment templates for common types?
2. Allow draft assignments (not visible to students)?
3. Support recurring assignments (weekly, etc.)?
4. Add assignment categories/tags?
5. Bulk assignment creation from CSV/Excel?
6. Assignment preview before publishing?
