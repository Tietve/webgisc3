# QuizPanel Structure Research Report
**Date:** 2025-11-19
**Researcher:** Claude Code
**Goal:** Analyze QuizPanel to understand how to add Assignments tab

---

## 1. QuizPanel Component Architecture

### Current Structure
- **Location:** `frontend/src/components/map/QuizPanel/index.jsx`
- **Type:** Functional React component with Framer Motion animations
- **Size:** ~455 lines, fully self-contained
- **Framework:** React 18 + Framer Motion for animations

### Key Characteristics
- **Slide-in Panel:** Fixed positioning on right side (width: 500px on desktop)
- **State-driven:** Uses multiple useState hooks for quiz workflow
- **Animation-heavy:** Glassmorphism backdrop, smooth transitions
- **Three States:** Loading → Question Navigation → Results

---

## 2. Current State Management

QuizPanel manages internal state for single-flow quiz experience:

```javascript
// Quiz Workflow State
const [currentQuestion, setCurrentQuestion] = useState(0)
const [selectedAnswer, setSelectedAnswer] = useState(null)
const [answers, setAnswers] = useState({})           // All answers object
const [score, setScore] = useState(null)
const [showResults, setShowResults] = useState(false)
const [direction, setDirection] = useState(1)        // Animation direction
const [quizData, setQuizData] = useState(null)       // Quiz questions + metadata
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)
const [submitting, setSubmitting] = useState(false)
```

**Key:** No tab system currently exists. Single linear workflow: Load → Answer → Submit → Results

---

## 3. Tab System Implementation Strategy

### Pattern Analysis from Other Panels
- **LessonsPanel:** Uses filtering buttons (`selectedDifficulty` state) not tabs
- **ToolsPanel:** Uses `CollapsibleSection` for categorization, no tabs
- **QuizPanel:** No tab UI currently

### Recommended Tab Approach
1. **Add tab state:**
   ```javascript
   const [activeTab, setActiveTab] = useState('quiz') // 'quiz' or 'assignments'
   ```

2. **Tab UI structure:**
   - Sticky header with tab buttons (Quiz | Assignments)
   - Conditional rendering below based on activeTab
   - Smooth transitions using AnimatePresence

3. **Tab-specific content areas:**
   - Quiz Tab: Current full quiz flow (unchanged)
   - Assignments Tab: New assignments list + submission tracking

---

## 4. How to Integrate Assignments Tab

### Step 1: Expand State Management
Add to QuizPanel component:
```javascript
const [activeTab, setActiveTab] = useState('quiz')  // Tab selection
const [assignments, setAssignments] = useState([])  // Assignments list
const [selectedAssignment, setSelectedAssignment] = useState(null) // For viewing
const [submittingAssignment, setSubmittingAssignment] = useState(false)
```

### Step 2: Add Tab Navigation UI
Replace current header with tab-based header:
- Tab buttons: "Quiz" and "Assignments"
- Active tab indicator (underline or background)
- Close button still present

### Step 3: Load Assignments Data
When panel opens with `activeTab === 'assignments'`:
```javascript
useEffect(() => {
  if (isOpen && activeTab === 'assignments') {
    loadAssignments()
  }
}, [isOpen, activeTab])

const loadAssignments = async () => {
  // Use assignmentService.list(classroomId) if available
  // Fall back to service calls
}
```

### Step 4: Conditional Rendering
```javascript
<AnimatePresence mode="wait">
  {activeTab === 'quiz' ? (
    <QuizContent />
  ) : (
    <AssignmentsContent />
  )}
</AnimatePresence>
```

---

## 5. Required Props and Data Changes

### Current Props (Unchanged)
```javascript
interface QuizPanelProps {
  isOpen: boolean              // Panel visibility
  onClose: () => void          // Close handler
  quizId?: number              // Quiz to display
}
```

### New Props to Consider
```javascript
interface QuizPanelProps {
  isOpen: boolean
  onClose: () => void
  quizId?: number
  classroomId?: number         // NEW: For loading assignments
  defaultTab?: 'quiz' | 'assignments'  // NEW: Initial tab
}
```

### Data Structure for Assignments
From `assignment.service.js`:
```javascript
// Assignment object structure (from API)
{
  id: number
  title: string
  description: string
  classroom: number
  due_date: string (ISO datetime)
  max_score: number
  attachment: string (file URL)
  created_at: string
  // Additional fields from API response
}
```

---

## 6. Integration Points

### Service Layer
- **Existing:** `assignmentService.list(classroomId)`
- **Existing:** `assignmentService.get(id)`
- **Can use:** Already exported in `frontend/src/services/index.js`

### MapViewerPage Integration
Current QuizPanel usage in MapViewerPage (line 302-305):
```javascript
<QuizPanel
  isOpen={isQuizOpen}
  onClose={() => setIsQuizOpen(false)}
/>
```

**Need to pass:** `classroomId` if available from user context/props

---

## 7. Animation and Styling

### Current Pattern
- **Transitions:** Slide in from right (spring physics)
- **Background:** Glassmorphism (backdrop blur)
- **Header:** Gradient (orange-500 to red-500)
- **Content area:** Scrollable with AnimatePresence mode="wait"

### For Assignments Tab
- Keep **same animation style** for consistency
- Tab buttons: Use similar button styling as quiz options
- Assignment cards: Reuse Panel variant="floating" pattern
- Status indicators: Color-coded (pending, submitted, graded)

---

## 8. Unresolved Questions

1. **Classroom Context:** How does MapViewerPage know current classroom? (needed for `classroomId`)
2. **Assignment Submission:** Should submission UI be inside this panel or separate modal?
3. **Tab Persistence:** Should active tab state persist across panel open/close?
4. **Scope:** Should teachers see different content (grading) vs students (submission)?

---

## 9. Implementation Priority

### High Priority
1. Add activeTab state
2. Create tab button UI
3. Conditional rendering structure
4. Load assignments on tab switch

### Medium Priority
1. Assignment card UI component
2. Submission tracking display
3. Error/loading states for assignments

### Low Priority
1. Assignment filtering (by due date, status)
2. Desktop vs mobile responsive adjustments

---

## Summary

**QuizPanel is ready for tab expansion.** Current single-flow design can be refactored with minimal breaking changes by:
1. Adding `activeTab` state
2. Wrapping content in conditional renderer
3. Keeping animation/styling patterns identical
4. Reusing existing assignmentService for data

**No architectural barriers** - mostly UI state management and component composition updates.
