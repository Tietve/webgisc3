# Research: ClassroomDetailPage Component Analysis

**Date:** 2025-11-19
**File:** `frontend/src/features/classroom/pages/ClassroomDetailPage.jsx`
**Purpose:** Identify where assignment creation UI should integrate

---

## 1. Page Structure

ClassroomDetailPage uses tab-based layout with 3 main sections:

```
Header (Gradient + Classroom Name + Owner Badge)
  ↓
Tab Navigation (sticky)
  - Bảng tin (stream)
  - Bài tập trên lớp (classwork)
  - Mọi người (people)
  ↓
Main Content (tab-specific rendering)
```

### Key Components in classwork tab:
- AssignmentList: Displays all assignments
- SubmissionForm: Student submission (conditionally shown)
- GradingInterface: Teacher grading (conditionally shown)
- Create Assignment Button (visible only for teachers)

---

## 2. Teacher vs Student Permission Checks

**Permission Gate:**
```jsx
const isOwner = classroom?.teacher_email === user?.email
```

**Teacher-only UI Elements:**
1. "👑 Quản lý" badge in header (line 189-193)
2. "Thông báo mới" button in stream tab (line 262-272)
3. "Tạo bài tập" button in classwork tab (line 370-377)
4. ⋮ menu on announcements (line 298-302)

---

## 3. Assignment Creation UI Location

**Placement:** Lines 370-377 in classwork tab

```jsx
{isOwner && (
  <div className="flex justify-end">
    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200">
      <span className="text-xl">➕</span>
      <span className="font-medium">Tạo bài tập</span>
    </button>
  </div>
)}
```

**Current state:** Button is static (no onClick handler). Needs assignment creation modal/form.

**Suggested integration:**
- Add state: `const [showAssignmentModal, setShowAssignmentModal] = useState(false)`
- Add onClick handler to button
- Create modal component with AssignmentForm

---

## 4. Existing Form Patterns

### SubmissionForm Pattern (line 1-216)
- Uses FormData for multipart uploads
- Validation: require text OR file (not empty)
- Late submission warning alert
- Success/error feedback with animations
- Modal closure on success
- Uses lucide-react icons

### GradingInterface Pattern (line 1-370)
- Two-column layout (submissions list + detail)
- Form fields: score (number), feedback (textarea)
- Conditional rendering based on selection state
- Error handling with try-catch
- Loading states with spinners

### AnnouncementModal Pattern (line 431-483)
- Modal wrapper with backdrop
- Form fields: textarea for content
- Cancel/Submit buttons
- Disabled submit when empty
- State management: showModal, content text

---

## 5. Expected Assignment Form Structure

Based on backend requirements (from AssignmentList):
```javascript
{
  title: string (required),
  description: string (optional),
  due_date: ISO datetime (optional),
  max_score: number (optional),
  classroom_id: number (auto from params)
}
```

**Recommended Form Fields:**
1. Title (text input, required)
2. Description (textarea, optional)
3. Due Date (datetime input, optional)
4. Max Score (number input, optional)
5. File attachment (optional - for assignment resources)

---

## 6. Integration Checklist

- [ ] Add `showAssignmentModal` state to ClassroomDetailPage
- [ ] Add onClick handler to "Tạo bài tập" button
- [ ] Create AssignmentForm component in `/components/classroom/`
- [ ] Create assignment modal container (similar to AnnouncementModal)
- [ ] Add assignment submission handler
- [ ] Refresh AssignmentList after successful creation
- [ ] Add loading/error states
- [ ] Match styling with existing components (gradient buttons, dark mode support)

---

## Key Files to Reference

- **Page:** `/frontend/src/features/classroom/pages/ClassroomDetailPage.jsx`
- **Components:** `/frontend/src/components/classroom/`
  - AssignmentList.jsx (display pattern)
  - SubmissionForm.jsx (form pattern with validation)
  - GradingInterface.jsx (complex form + list layout)
- **Service:** `@services` → `assignmentService`

---

## Open Questions

1. Should assignment resources (PDFs, images) be uploadable?
2. Should teachers preview assignments before publishing?
3. Can assignments be edited after creation?
4. Should there be categories/sections for organizing assignments?
