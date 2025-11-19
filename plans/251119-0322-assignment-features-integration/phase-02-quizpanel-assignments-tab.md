# Phase 2: QuizPanel - Assignments Tab UI

**Date:** 2025-11-19
**Priority:** High
**Status:** Not Started
**Duration:** 3-4 hours
**Dependencies:** Phase 1 (Tab System)

## Context Links

- Main Plan: [plan.md](plan.md)
- Previous Phase: [phase-01-quizpanel-tab-system.md](phase-01-quizpanel-tab-system.md)
- Research: [researcher-01-quizpanel-structure.md](research/researcher-01-quizpanel-structure.md)
- Scout: [scout-01-assignment-files.md](scout/scout-01-assignment-files.md)

## Overview

Build assignments list view in QuizPanel's Assignments tab showing all assignments from user's enrolled classrooms with submission status tracking.

## Key Insights

- Student sees assignments from ALL enrolled classrooms (not just one)
- Need to aggregate assignments across multiple classrooms
- Submission status critical: not submitted, submitted, graded, late
- Due date urgency should be visually prominent (color coding)
- Click assignment → view details → submit (Phase 3)
- Reuse existing AssignmentList patterns but adapt for panel context

## Requirements

### Functional Requirements

1. Load assignments from all enrolled classrooms on tab open
2. Display assignment cards with: title, classroom name, due date, status
3. Color-code by deadline urgency (red=overdue, yellow=due soon, green=upcoming)
4. Show submission status badge (pending, submitted, graded, late)
5. Sort assignments by due date (earliest first)
6. Handle loading, error, empty states
7. Click assignment card → open detail view (Phase 3)
8. Refresh assignments when tab becomes active

### Non-Functional Requirements

- Load time <2s for 50 assignments
- Smooth scroll for long lists
- Animations match panel style (Framer Motion)
- Empty state helpful and encouraging

## Architecture

### Data Flow

```
QuizPanel (Assignments Tab)
  ↓ useEffect when activeTab === 'assignments'
  ↓ Call enrollmentService.list() to get enrolled classrooms
  ↓ For each classroom, call assignmentService.list(classroomId)
  ↓ Aggregate all assignments
  ↓ For each assignment, check submissionService for user's submission
  ↓ Combine assignment + submission status
  ↓ Sort by due_date
  ↓ Render assignment cards
```

### Component Structure

```
renderAssignmentsContent()
├── Loading State (spinner)
├── Error State (error message + retry)
├── Empty State (no assignments message)
└── Assignments List
    ├── Assignment Card 1
    │   ├── Header (classroom name badge)
    │   ├── Title
    │   ├── Due Date Badge (color-coded)
    │   ├── Status Badge (submission status)
    │   └── Click Handler → Detail View
    ├── Assignment Card 2
    └── ...
```

### State Management

```javascript
// New state for assignments tab
const [assignments, setAssignments] = useState([])
const [assignmentsLoading, setAssignmentsLoading] = useState(false)
const [assignmentsError, setAssignmentsError] = useState(null)
const [selectedAssignment, setSelectedAssignment] = useState(null) // Phase 3
const [enrolledClassrooms, setEnrolledClassrooms] = useState([])
```

### Data Structure

```javascript
// Aggregated assignment object
{
  id: number,
  title: string,
  description: string,
  classroom: {
    id: number,
    name: string
  },
  due_date: string | null,
  max_score: number,
  attachment: string | null,
  created_at: string,
  // Submission status (added by frontend)
  submissionStatus: 'not_submitted' | 'submitted' | 'graded' | 'late',
  submissionId: number | null,
  grade: number | null,
  // Computed
  isOverdue: boolean,
  daysUntilDue: number
}
```

## Related Code Files

### Files to Modify

1. **`frontend/src/components/map/QuizPanel/index.jsx`**
   - Replace placeholder renderAssignmentsContent
   - Add assignments state management
   - Add data loading logic
   - Implement assignment card rendering

### Files to Reference

1. **`frontend/src/components/classroom/AssignmentList.jsx`**
   - Reference for card styling and layout
   - Reuse date formatting logic
   - Adapt status badge patterns

2. **`frontend/src/services/assignment.service.js`**
   - Use list(classroomId) method

3. **`frontend/src/services/submission.service.js`**
   - Use getMySubmissions(classroomId) method

4. **`frontend/src/services/enrollment.service.js`**
   - Use list() to get enrolled classrooms

## Implementation Steps

### Step 1: Add Assignment State

Add state declarations in QuizPanel component:

```javascript
const [assignments, setAssignments] = useState([])
const [assignmentsLoading, setAssignmentsLoading] = useState(false)
const [assignmentsError, setAssignmentsError] = useState(null)
const [enrolledClassrooms, setEnrolledClassrooms] = useState([])
```

### Step 2: Create Assignment Loading Logic

Add function to load assignments from all classrooms:

```javascript
const loadAssignments = async () => {
  setAssignmentsLoading(true)
  setAssignmentsError(null)

  try {
    // 1. Get enrolled classrooms
    const classrooms = await enrollmentService.list()
    setEnrolledClassrooms(classrooms)

    // 2. Load assignments from each classroom
    const assignmentPromises = classrooms.map(classroom =>
      assignmentService.list(classroom.id)
        .then(assignments => assignments.map(a => ({
          ...a,
          classroom: {
            id: classroom.id,
            name: classroom.name
          }
        })))
        .catch(() => []) // Graceful failure per classroom
    )

    const assignmentArrays = await Promise.all(assignmentPromises)
    const allAssignments = assignmentArrays.flat()

    // 3. Load submission status for each assignment
    const assignmentsWithStatus = await Promise.all(
      allAssignments.map(async (assignment) => {
        try {
          const submissions = await submissionService.getMySubmissions(assignment.classroom.id)
          const mySubmission = submissions.find(s => s.assignment === assignment.id)

          return {
            ...assignment,
            submissionStatus: getSubmissionStatus(assignment, mySubmission),
            submissionId: mySubmission?.id || null,
            grade: mySubmission?.grade?.score || null,
            isOverdue: isAssignmentOverdue(assignment.due_date),
            daysUntilDue: getDaysUntilDue(assignment.due_date)
          }
        } catch {
          return {
            ...assignment,
            submissionStatus: 'not_submitted',
            submissionId: null,
            grade: null,
            isOverdue: isAssignmentOverdue(assignment.due_date),
            daysUntilDue: getDaysUntilDue(assignment.due_date)
          }
        }
      })
    )

    // 4. Sort by due date (earliest first)
    const sortedAssignments = assignmentsWithStatus.sort((a, b) => {
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return new Date(a.due_date) - new Date(b.due_date)
    })

    setAssignments(sortedAssignments)
  } catch (error) {
    console.error('Failed to load assignments:', error)
    setAssignmentsError('Không thể tải danh sách bài tập. Vui lòng thử lại.')
  } finally {
    setAssignmentsLoading(false)
  }
}
```

### Step 3: Add Helper Functions

Add utility functions for date/status calculations:

```javascript
const getSubmissionStatus = (assignment, submission) => {
  if (!submission) return 'not_submitted'
  if (submission.grade) return 'graded'
  if (submission.is_late) return 'late'
  return 'submitted'
}

const isAssignmentOverdue = (dueDate) => {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return Infinity
  const diff = new Date(dueDate) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const formatDueDate = (dueDate) => {
  if (!dueDate) return 'Không có hạn'
  const date = new Date(dueDate)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getDueDateBadgeColor = (assignment) => {
  if (!assignment.due_date) return 'gray'
  if (assignment.isOverdue) return 'red'
  if (assignment.daysUntilDue <= 3) return 'yellow'
  return 'green'
}
```

### Step 4: Add useEffect to Load on Tab Open

Load assignments when Assignments tab becomes active:

```javascript
useEffect(() => {
  if (isOpen && activeTab === 'assignments') {
    loadAssignments()
  }
}, [isOpen, activeTab])
```

### Step 5: Implement Assignment Cards Rendering

Replace placeholder renderAssignmentsContent:

```javascript
const renderAssignmentsContent = () => {
  if (assignmentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Đang tải bài tập...</p>
        </div>
      </div>
    )
  }

  if (assignmentsError) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">⚠️</div>
        <div className="text-red-500 mb-4">{assignmentsError}</div>
        <button
          onClick={loadAssignments}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    )
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-bold mb-2">Chưa có bài tập</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Bạn chưa có bài tập nào. Hãy tham gia lớp học để nhận bài tập!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
      {assignments.map((assignment, index) => (
        <motion.div
          key={assignment.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700"
          onClick={() => setSelectedAssignment(assignment)}
        >
          {/* Classroom Badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
              📚 {assignment.classroom.name}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">
            {assignment.title}
          </h3>

          {/* Description Preview */}
          {assignment.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {assignment.description}
            </p>
          )}

          {/* Metadata Row */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            {/* Due Date Badge */}
            <span className={`text-xs px-2 py-1 rounded-full ${
              getDueDateBadgeColor(assignment) === 'red'
                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                : getDueDateBadgeColor(assignment) === 'yellow'
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                : getDueDateBadgeColor(assignment) === 'green'
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {assignment.isOverdue ? '⚠️ Quá hạn' : `📅 ${formatDueDate(assignment.due_date)}`}
            </span>

            {/* Submission Status Badge */}
            <span className={`text-xs px-2 py-1 rounded-full ${
              assignment.submissionStatus === 'graded'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : assignment.submissionStatus === 'submitted'
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : assignment.submissionStatus === 'late'
                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {assignment.submissionStatus === 'graded' && `✅ Đã chấm (${assignment.grade}/${assignment.max_score})`}
              {assignment.submissionStatus === 'submitted' && '📤 Đã nộp'}
              {assignment.submissionStatus === 'late' && '⏰ Nộp trễ'}
              {assignment.submissionStatus === 'not_submitted' && '⏳ Chưa nộp'}
            </span>
          </div>

          {/* Max Score */}
          {assignment.max_score && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Điểm tối đa: {assignment.max_score}
            </div>
          )}

          {/* Attachment Indicator */}
          {assignment.attachment && (
            <div className="mt-2 text-xs text-blue-500">
              📎 Có tài liệu đính kèm
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
```

### Step 6: Add Refresh Button (Optional Enhancement)

Add refresh button to assignments header:

```javascript
// In tab navigation or header area
<button
  onClick={loadAssignments}
  disabled={assignmentsLoading}
  className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
>
  {assignmentsLoading ? '⏳ Đang tải...' : '🔄 Làm mới'}
</button>
```

## Todo List

- [ ] Add assignments state to QuizPanel
- [ ] Create loadAssignments function with multi-classroom support
- [ ] Add helper functions (status, date formatting, badge colors)
- [ ] Add useEffect to load on tab open
- [ ] Implement loading state UI
- [ ] Implement error state UI with retry
- [ ] Implement empty state UI
- [ ] Implement assignment cards rendering
- [ ] Add classroom name badges
- [ ] Add due date color coding
- [ ] Add submission status badges
- [ ] Add click handlers for assignment cards
- [ ] Test with 0 assignments
- [ ] Test with 50+ assignments (scroll performance)
- [ ] Test with multiple classrooms
- [ ] Test error handling (network failure)
- [ ] Verify animations smooth

## Success Criteria

### Functional

- [ ] Assignments load from all enrolled classrooms
- [ ] Assignment cards display all required info
- [ ] Submission status accurate for each assignment
- [ ] Due dates color-coded correctly
- [ ] Overdue assignments marked clearly
- [ ] Click assignment card triggers selection
- [ ] Loading state shows while fetching
- [ ] Error state allows retry
- [ ] Empty state helpful when no assignments

### Visual

- [ ] Cards visually consistent with panel theme
- [ ] Animations stagger nicely (0.05s delay)
- [ ] Scroll smooth for long lists
- [ ] Badges readable and distinguishable
- [ ] Mobile responsive (cards stack properly)

### Performance

- [ ] Load time <2s for 50 assignments
- [ ] No UI freeze during loading
- [ ] Smooth scroll (60fps)
- [ ] Graceful failure per classroom (don't block all)

## Risk Assessment

### Medium Risk

- Loading assignments from multiple classrooms could be slow
- Submission status checks require many API calls
- Large assignment lists could cause scroll lag

### Mitigation

- Use Promise.all for parallel classroom fetching
- Cache submission status in state
- Implement virtual scrolling if >100 assignments
- Add pagination or "load more" if performance issues
- Graceful degradation (show assignments without status if slow)

## Security Considerations

- Backend enforces enrollment checking (student only sees their classrooms)
- No sensitive data exposed in assignment cards
- Submission status comes from authenticated endpoints

## Performance Optimization

### Optimization Strategies

1. **Parallel Loading:** Use Promise.all for classroom assignment fetching
2. **Graceful Failure:** Don't block entire list if one classroom fails
3. **Memoization:** Memoize helper functions with useMemo
4. **Debouncing:** Debounce refresh button to prevent spam
5. **Caching:** Consider caching assignments in localStorage (5 min TTL)

### Virtual Scrolling (if needed)

If >100 assignments cause lag, use react-window:

```javascript
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={500}
  itemCount={assignments.length}
  itemSize={120}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <AssignmentCard assignment={assignments[index]} />
    </div>
  )}
</FixedSizeList>
```

## Accessibility

- Assignment cards have hover states
- Click areas large enough (min 44x44px)
- Color not sole indicator (use icons + text)
- Screen reader announces assignment count
- Keyboard navigation (Tab to cards, Enter to select)

## Next Steps

After completing this phase:

1. Test assignment list thoroughly
2. Verify all enrolled classrooms load correctly
3. Proceed to Phase 3: Assignment detail view and submission
4. Consider adding filters (by classroom, by status)

## Unresolved Questions

1. Should there be search/filter for assignments?
2. Pagination needed or infinite scroll?
3. Should assignments update in real-time (WebSocket)?
4. Cache assignments in localStorage?
5. Show classroom avatar/icon in badges?
