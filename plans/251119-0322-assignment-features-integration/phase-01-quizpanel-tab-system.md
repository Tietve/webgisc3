# Phase 1: QuizPanel - Add Tab System

**Date:** 2025-11-19
**Priority:** High
**Status:** Not Started
**Duration:** 2-3 hours
**Dependencies:** None

## Context Links

- Main Plan: [plan.md](plan.md)
- Research: [researcher-01-quizpanel-structure.md](research/researcher-01-quizpanel-structure.md)
- Component: `frontend/src/components/map/QuizPanel/index.jsx`

## Overview

Add tab navigation system to QuizPanel component to support both Quiz and Assignments tabs. Maintain existing quiz functionality while enabling tab switching for assignments view.

## Key Insights

- QuizPanel currently single-flow: Load → Answer → Submit → Results
- No tab system exists - need to add from scratch
- Must preserve all existing quiz animations/styling
- Tab state should reset panel state when switching
- Follow patterns from existing panel animations (Framer Motion)

## Requirements

### Functional Requirements

1. Add tab navigation UI with two tabs: "Quiz" and "Assignments"
2. Default to "Quiz" tab when opened via quiz trigger
3. Support opening directly to "Assignments" tab via prop
4. Preserve quiz functionality completely unchanged when in Quiz tab
5. Smooth tab switching with animations
6. Reset panel state when switching tabs
7. Close button works from any tab

### Non-Functional Requirements

- Animation performance: <16ms frame time
- Maintain existing glassmorphism styling
- Responsive on mobile (tabs should stack if needed)
- Accessible keyboard navigation (tab key)

## Architecture

### Component Structure

```
QuizPanel
├── Header
│   ├── Tab Navigation (NEW)
│   │   ├── Quiz Tab Button
│   │   └── Assignments Tab Button
│   └── Close Button
├── Content Area (conditional rendering)
│   ├── Quiz Content (activeTab === 'quiz')
│   └── Assignments Content (activeTab === 'assignments')
└── Backdrop (glassmorphism)
```

### State Management

```javascript
// New state
const [activeTab, setActiveTab] = useState('quiz') // 'quiz' | 'assignments'

// Existing state (unchanged)
const [currentQuestion, setCurrentQuestion] = useState(0)
const [selectedAnswer, setSelectedAnswer] = useState(null)
const [answers, setAnswers] = useState({})
const [score, setScore] = useState(null)
const [showResults, setShowResults] = useState(false)
const [direction, setDirection] = useState(1)
const [quizData, setQuizData] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)
const [submitting, setSubmitting] = useState(false)
```

### Props Interface

```javascript
// Current props
interface QuizPanelProps {
  isOpen: boolean
  onClose: () => void
  quizId?: number
}

// Updated props (backward compatible)
interface QuizPanelProps {
  isOpen: boolean
  onClose: () => void
  quizId?: number
  defaultTab?: 'quiz' | 'assignments'  // NEW - optional
  classroomId?: number                 // NEW - for assignments
}
```

## Related Code Files

### Files to Modify

1. **`frontend/src/components/map/QuizPanel/index.jsx`**
   - Add tab state and navigation UI
   - Implement conditional rendering
   - Add tab switching logic
   - Update prop types

2. **`frontend/src/features/map/pages/MapViewerPage.jsx`**
   - Pass new props to QuizPanel
   - Add state for defaultTab control
   - Wire up assignment button to open panel with assignments tab

## Implementation Steps

### Step 1: Update QuizPanel State

Add tab state to QuizPanel component (after existing useState declarations):

```javascript
const [activeTab, setActiveTab] = useState(defaultTab || 'quiz')
```

### Step 2: Extract Quiz Content to Separate Function

Refactor existing quiz rendering logic into dedicated function:

```javascript
const renderQuizContent = () => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">❌ {error}</div>
        <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-lg">
          Đóng
        </button>
      </div>
    )
  }

  if (showResults) {
    return (
      // Existing results UI
    )
  }

  return (
    // Existing question navigation UI
  )
}
```

### Step 3: Create Tab Navigation UI

Add tab header after the main panel header:

```javascript
const renderTabNavigation = () => (
  <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
    <button
      onClick={() => setActiveTab('quiz')}
      className={`flex-1 py-3 text-center font-medium transition-all duration-200 ${
        activeTab === 'quiz'
          ? 'text-orange-500 border-b-2 border-orange-500'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      📝 Quiz
    </button>
    <button
      onClick={() => setActiveTab('assignments')}
      className={`flex-1 py-3 text-center font-medium transition-all duration-200 ${
        activeTab === 'assignments'
          ? 'text-blue-500 border-b-2 border-blue-500'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      📋 Assignments
    </button>
  </div>
)
```

### Step 4: Implement Conditional Content Rendering

Replace existing content area with conditional renderer:

```javascript
<AnimatePresence mode="wait">
  {activeTab === 'quiz' ? (
    <motion.div
      key="quiz-content"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      {renderQuizContent()}
    </motion.div>
  ) : (
    <motion.div
      key="assignments-content"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      {renderAssignmentsContent()}
    </motion.div>
  )}
</AnimatePresence>
```

### Step 5: Create Placeholder Assignments Content

Add temporary assignments renderer (will be implemented in Phase 2):

```javascript
const renderAssignmentsContent = () => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">📋</div>
    <h3 className="text-xl font-bold mb-2">Assignments</h3>
    <p className="text-gray-500 dark:text-gray-400">
      Assignment features coming soon...
    </p>
  </div>
)
```

### Step 6: Add Tab Reset Logic

Reset quiz state when switching to assignments tab:

```javascript
useEffect(() => {
  if (activeTab === 'assignments') {
    // Reset quiz state to default
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResults(false)
    setScore(null)
  }
}, [activeTab])
```

### Step 7: Update MapViewerPage Integration

Modify MapViewerPage to pass new props:

```javascript
// Add state for controlling panel
const [quizPanelTab, setQuizPanelTab] = useState('quiz')

// Update QuizPanel usage
<QuizPanel
  isOpen={isQuizOpen}
  onClose={() => setIsQuizOpen(false)}
  quizId={selectedQuizId}
  defaultTab={quizPanelTab}
  classroomId={currentClassroomId} // from user context if available
/>

// Add handler for opening assignments
const openAssignmentsPanel = () => {
  setQuizPanelTab('assignments')
  setIsQuizOpen(true)
}
```

### Step 8: Update Component Props

Add prop types at top of QuizPanel component:

```javascript
const QuizPanel = ({
  isOpen,
  onClose,
  quizId,
  defaultTab = 'quiz',
  classroomId
}) => {
  // Component logic
}
```

## Todo List

- [ ] Add activeTab state to QuizPanel
- [ ] Extract quiz content to renderQuizContent function
- [ ] Create tab navigation UI component
- [ ] Implement conditional content rendering with AnimatePresence
- [ ] Add placeholder assignments content renderer
- [ ] Add tab reset effect
- [ ] Update QuizPanel props interface
- [ ] Update MapViewerPage to pass new props
- [ ] Test tab switching animations
- [ ] Test quiz functionality unchanged in Quiz tab
- [ ] Verify responsive behavior on mobile
- [ ] Test keyboard navigation (Tab key)

## Success Criteria

### Functional

- [ ] Tab buttons render correctly in panel header
- [ ] Active tab has visual indicator (underline, color)
- [ ] Clicking tab switches content smoothly
- [ ] Quiz tab shows all existing quiz functionality unchanged
- [ ] Assignments tab shows placeholder content
- [ ] Close button works from both tabs
- [ ] defaultTab prop controls initial tab selection
- [ ] Tab state resets when panel closes and reopens

### Visual

- [ ] Tab animations smooth (<16ms frame time)
- [ ] Tab styling matches panel glassmorphism theme
- [ ] Active tab clearly distinguishable
- [ ] Transitions between tabs feel natural
- [ ] No layout shift when switching tabs

### Technical

- [ ] No console errors
- [ ] No prop type warnings
- [ ] Component renders without flickering
- [ ] State management clean and predictable
- [ ] Backward compatible (works without new props)

## Risk Assessment

### Low Risk

- Tab UI pattern simple and well-established
- AnimatePresence already used in component
- Quiz content extraction is straightforward refactor

### Medium Risk

- State reset logic might miss edge cases
- Tab switching during quiz submission could cause issues

### Mitigation

- Disable tab switching during quiz submission
- Reset all quiz state thoroughly when leaving quiz tab
- Add guards to prevent state corruption
- Test all quiz workflows after refactor

## Security Considerations

- No new security concerns (pure UI change)
- Maintain existing authentication checks
- No data exposure through tab switching

## Performance Considerations

- Tab switching should be instant (<100ms)
- Use AnimatePresence mode="wait" to prevent double rendering
- Lazy load assignments content only when tab active
- Memoize tab content renderers if performance issues

## Accessibility

- Tab buttons have proper ARIA labels
- Active tab has aria-selected="true"
- Keyboard navigation works (Tab, Enter, Arrow keys)
- Focus management when switching tabs
- Screen reader announces tab changes

## Next Steps

After completing this phase:

1. Test tab system thoroughly
2. Verify quiz functionality unchanged
3. Proceed to Phase 2: Build Assignments tab content
4. Consider adding tab badge counts (e.g., "5 pending assignments")

## Unresolved Questions

1. Should tab preference persist in localStorage?
2. Should there be badge indicators on tabs (e.g., assignment count)?
3. How to handle classroom context if user not in any classroom?
4. Should tabs be disabled based on context (e.g., no quiz = disable quiz tab)?
