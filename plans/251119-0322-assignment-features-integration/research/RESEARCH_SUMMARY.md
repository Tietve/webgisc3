# Research Summary: QuizPanel Assignments Tab Integration

**Status:** COMPLETE
**Duration:** Analysis of 455-line component + service layer
**Date:** 2025-11-19

---

## Executive Summary

QuizPanel is **architecturally ready** for Assignments tab integration. The component uses standard React patterns (hooks, Framer Motion animations) that cleanly support multi-tab interfaces through conditional rendering. No breaking changes to existing quiz functionality required.

---

## Key Findings

### 1. Component Ready for Expansion
- **Current:** Single-flow quiz panel (load → answer → submit → results)
- **Proposal:** Add second tab alongside quiz tab
- **Change Scope:** ~50-100 new lines of state + UI code
- **Breaking Changes:** None (backward compatible)

### 2. State Management Pattern Established
```javascript
// Current QuizPanel state pattern
const [currentQuestion, setCurrentQuestion] = useState(0)
const [selectedAnswer, setSelectedAnswer] = useState(null)
const [showResults, setShowResults] = useState(false)
// ... etc

// Add for tabs:
const [activeTab, setActiveTab] = useState('quiz')
```

### 3. Animation Framework Compatible
- Uses Framer Motion with spring physics
- AnimatePresence for state transitions
- Pattern: direct import, no CSS modules
- **Reusable for:** Tab content switching, assignment cards, status indicators

### 4. Service Layer Exists
- `assignmentService` already implemented and exported
- Methods: `list(classroomId)`, `get(id)`, `getSubmissions(id)`
- Error handling: Try-catch with user-friendly messages (established pattern)

### 5. Styling Consistency Maintained
- Tailwind CSS utility-first approach
- Dark mode support built-in (`dark:` prefix)
- No custom CSS files (inline styles only)
- Reusable components: Panel, CollapsibleSection available

---

## Implementation Checklist

### Phase 1: Tab Infrastructure
- [ ] Add `activeTab` state variable
- [ ] Create tab button UI in header
- [ ] Implement tab switching logic
- [ ] Wrap content in conditional renderer (AnimatePresence)

### Phase 2: Assignments Tab Content
- [ ] Add `assignments` state array
- [ ] Add `selectedAssignment` state
- [ ] Implement `loadAssignments()` function
- [ ] Create assignment card component

### Phase 3: Integration & Polish
- [ ] Handle loading/error states
- [ ] Add submission workflow (if applicable)
- [ ] Test dark mode compatibility
- [ ] Verify mobile responsiveness (500px panel)

### Phase 4: Optional Enhancements
- [ ] Add filtering (due date, status)
- [ ] Implement pagination for large lists
- [ ] Add assignment detail view
- [ ] Support submission file upload

---

## Code Patterns to Follow

### Error Handling
```javascript
try {
  setLoading(true)
  const data = await service.list()
  setData(data)
} catch (err) {
  setError(err.response?.data?.message || 'Default error')
} finally {
  setLoading(false)
}
```

### Animations
```javascript
<motion.div
  initial={{ x: 100, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  exit={{ x: -100, opacity: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### Conditional Content
```javascript
<AnimatePresence mode="wait">
  {activeTab === 'quiz' ? (
    <QuizContent key="quiz" />
  ) : (
    <AssignmentsContent key="assignments" />
  )}
</AnimatePresence>
```

---

## Potential Issues & Mitigations

| Issue | Mitigation |
|-------|-----------|
| Missing classroomId | Pass from MapViewerPage or detect from context |
| Large assignment lists | Implement pagination or virtual scrolling |
| Teacher vs Student view | Branch UI based on user role (from auth) |
| Tab state persistence | Decide if state should reset on panel close |
| Animation conflicts | Use `mode="wait"` in AnimatePresence |

---

## Files to Modify

1. **QuizPanel Component** (`frontend/src/components/map/QuizPanel/index.jsx`)
   - Add tab state
   - Refactor header structure
   - Add conditional rendering

2. **MapViewerPage** (`frontend/src/features/map/pages/MapViewerPage.jsx`)
   - Pass `classroomId` prop to QuizPanel (if needed)
   - Pass `defaultTab` prop (optional)

3. **Possibly Create:**
   - `AssignmentCard.jsx` - Reusable assignment display component
   - `AssignmentSubmission.jsx` - Submission workflow (optional)

---

## Dependencies & Imports Required

```javascript
// Already available in QuizPanel
import { motion, AnimatePresence } from 'framer-motion'
import Panel from '../../ui/Panel'
import { assignmentService } from '@services'

// May need to add icons
import { Clock, FileText, Download, Upload } from 'lucide-react'
```

---

## Questions Needing Clarification

1. **Classroom Context:** How to determine current classroom in MapViewerPage?
2. **User Role Handling:** Should panel show different content for teachers vs students?
3. **Submission Workflow:** File upload UI inside panel or separate modal?
4. **Tab Persistence:** Reset tab selection when panel closes?
5. **Data Refresh:** Auto-refresh assignments on interval or manual button?

---

## Next Steps

1. **Review** this research with team
2. **Address** unresolved questions (Section "Questions Needing Clarification")
3. **Create implementation plan** using Phase checklist
4. **Build assignments UI component** (separate file or inline)
5. **Integrate** with MapViewerPage and test
6. **Deploy** with quiz functionality (backward compatible)

---

## Conclusion

Adding an Assignments tab to QuizPanel is **straightforward and low-risk**. The component architecture, animation framework, and service layer all support this extension naturally. Implementation can proceed with high confidence.

**Estimated Implementation Time:** 2-4 hours (basic tab + assignment listing)
**Estimated Full Feature Time:** 6-8 hours (with submission workflow)

---

**Research Completed By:** Claude Code (Research Specialist)
**Report Location:** `/plans/251119-0322-assignment-features-integration/research/`
