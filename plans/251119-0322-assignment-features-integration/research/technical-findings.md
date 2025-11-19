# Technical Findings - QuizPanel Tab Integration

## Component Composition Hierarchy

```
MapViewerPage (line 15)
├── QuizFloatingButton (line 296)
├── QuizPanel (line 302)
│   ├── Backdrop (motion.div - line 203)
│   ├── Main Panel (motion.div - line 212)
│   │   ├── Header (sticky - line 220)
│   │   │   ├── Title + Close button
│   │   │   └── Progress bar (only in question view)
│   │   └── Content (flex-1 - line 264)
│   │       ├── Loading state (line 122)
│   │       ├── Error state (line 149)
│   │       ├── Questions view (AnimatePresence - line 265)
│   │       └── Results view (motion.div - line 383)
```

## State Flow Analysis

### Quiz Completion Flow
```
isOpen → loading → error? → quizData loaded
         ↓
    currentQuestion = 0 → handleNext() → submit → showResults = true
    ↓ (for each question)
    selectedAnswer → answers object → final submit
```

### Props to Parent
- `isOpen`: boolean from MapViewerPage state (line 19)
- `onClose`: setter from MapViewerPage (line 20)
- `quizId`: Currently hardcoded/undefined (not passed in line 302)

## Service Integration Points

### Quiz Service Pattern
```javascript
// frontend/src/services/quiz.service.js
quizService.get(quizId)           // Fetch questions
quizService.submit(quizId, answers)  // Submit answers
// Returns: { score, details, ... }
```

### Assignment Service Pattern
```javascript
// frontend/src/services/assignment.service.js
assignmentService.list(classroomId)  // Fetch assignments
assignmentService.get(id)              // Fetch assignment detail
assignmentService.getSubmissions(id)   // Fetch submissions (teacher view)
// Returns: Array of assignment objects
```

## CSS/Styling Architecture

### Key Classes Used
- **Responsive:** `w-full md:w-[500px]` (panel width)
- **Dark Mode:** `dark:bg-gray-900`, `dark:text-gray-100` throughout
- **Gradients:** `from-orange-500 to-red-500` (header)
- **Animations:** All via Framer Motion (not CSS keyframes)
- **Spacing:** Tailwind defaults (p-6, gap-2, etc.)

### No CSS Modules or Styled Components
Custom scrollbar via inline `<style jsx>` (example in LessonsPanel line 285-297)

## Animation Specifications

### Current Animations in QuizPanel
1. **Panel Entry/Exit:** spring physics (stiffness: 300, damping: 30)
2. **Question Slides:** direction-aware animation (leftward vs rightward)
3. **Answer Selection:** button scale + gradient overlay with layoutId
4. **Results Display:** spring appear with delayed cascade

### Code Pattern
```javascript
initial={{ x: '100%' }}              // Off-screen right
animate={{ x: 0 }}                    // On-screen
exit={{ x: '100%' }}                  // Off-screen right
transition={{ type: 'spring', stiffness: 300, damping: 30 }}
```

## Data Structure Examples

### Quiz Data Structure (from API)
```javascript
{
  id: 1,
  title: "GIS Basics",
  description: "Introduction to GIS concepts",
  questions: [
    {
      id: 101,
      question: "What is GIS?",
      options: ["...", "...", "...", "..."],
      correct_answer: 0
    },
    // ... more questions
  ]
}
```

### Assignment Data Structure (from API)
```javascript
{
  id: 1,
  title: "Map Analysis Project",
  description: "Analyze provided GIS data",
  classroom: 5,
  due_date: "2025-12-01T23:59:00Z",
  max_score: 100,
  attachment: "https://...",
  created_at: "2025-11-10T10:00:00Z",
  status: "active" // or "completed"
}
```

## Error Handling Pattern

Current QuizPanel error states:
1. **Loading Error** (line 149): Shows AlertCircle icon + error message + retry
2. **Submission Error** (line 94): Alert popup + stays in question view
3. **Service Errors:** Caught in try-catch, stored in state

Pattern to replicate for Assignments tab:
```javascript
try {
  setLoading(true)
  const data = await assignmentService.list(classroomId)
  setAssignments(data)
} catch (err) {
  setError(err.response?.data?.message || 'Failed to load')
} finally {
  setLoading(false)
}
```

## Import Dependencies

Current QuizPanel imports:
```javascript
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'  // Animations
import { X, CheckCircle, ... } from 'lucide-react'       // Icons (15+ icons used)
import Panel from '../../ui/Panel'                       // Custom UI wrapper
import { quizService } from '@services'                  // API service
```

For Assignments tab, would need to add:
```javascript
import { assignmentService } from '@services'
// Possibly new icons: Clock, FileText, CheckSquare, AlertSquare, Download, etc.
```

## Performance Considerations

### Current Optimizations
- **Lazy loading:** Quiz data only fetched when `isOpen && quizId`
- **AnimatePresence mode="wait":** Prevents simultaneous animations
- **Conditional rendering:** Questions/results toggle with `showResults` boolean

### For Assignments Tab
- Consider pagination if >10 assignments per classroom
- Virtual scrolling if assignment list grows large
- Memoize assignment card component to prevent re-renders

## Accessibility Notes

Current implementation issues (not addressed in original):
- No ARIA labels on buttons
- Color-only status indicators (need text labels)
- Animation may cause issues for motion-sensitive users

Should address when adding Assignments tab.

---

## File Locations Quick Reference

| Purpose | File Path |
|---------|-----------|
| QuizPanel Component | `frontend/src/components/map/QuizPanel/index.jsx` |
| Quiz Service | `frontend/src/services/quiz.service.js` |
| Assignment Service | `frontend/src/services/assignment.service.js` |
| UI Panel Wrapper | `frontend/src/components/ui/Panel` |
| Map Viewer Page | `frontend/src/features/map/pages/MapViewerPage.jsx` |
| Map Constants | `frontend/src/constants/map.constants.js` |

