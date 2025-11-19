# Quick Reference Card - QuizPanel Assignments Tab

## TL;DR (Too Long; Didn't Read)

**Can we add an Assignments tab to QuizPanel?** ✅ YES
**Is it safe?** ✅ LOW RISK - Backward compatible
**How long?** ⏱️ 6-8 hours basic version
**What do we need?** 🔧 Tab state + conditional rendering + assignment cards

---

## 30-Second Summary

QuizPanel currently shows a single quiz experience. We want to add a second "Assignments" tab that:
1. Displays list of assignments for the class
2. Shows assignment details (due date, description, attachment)
3. Allows students to submit work (optional, phase 2)
4. Lets teachers grade submissions (optional, phase 2)

**Solution:** Add `activeTab` state to QuizPanel, switch between quiz/assignments content using Framer Motion animations, reuse existing assignmentService API calls.

---

## The 4-Step Plan

```
Step 1: Add Tab UI (1-2 hours)
├─ Add state: activeTab = 'quiz' | 'assignments'
├─ Add buttons: "Quiz" | "Assignments" in header
└─ Wrap content in AnimatePresence

Step 2: Load Assignments (1 hour)
├─ Call: assignmentService.list(classroomId)
├─ Handle: loading and error states
└─ Show: assignment card list

Step 3: Integrate (1 hour)
├─ Pass classroomId from MapViewerPage
├─ Test: dark mode, mobile, animations
└─ Debug: any API errors

Step 4: Polish (2-3 hours)
├─ Submission workflow (optional)
├─ Filtering and sorting (optional)
└─ Additional features (optional)
```

---

## Code You'll Need

### New State (Add to QuizPanel)
```javascript
const [activeTab, setActiveTab] = useState('quiz')
const [assignments, setAssignments] = useState([])
const [assignmentsLoading, setAssignmentsLoading] = useState(false)
const [assignmentsError, setAssignmentsError] = useState(null)
```

### Load Function (Add to QuizPanel)
```javascript
const loadAssignments = async () => {
  try {
    setAssignmentsLoading(true)
    const data = await assignmentService.list(classroomId)
    setAssignments(data)
  } catch (err) {
    setAssignmentsError(err.message)
  } finally {
    setAssignmentsLoading(false)
  }
}
```

### Tab Switching (Replace header content)
```javascript
<div className="flex gap-4 border-b border-gray-200">
  <button
    onClick={() => setActiveTab('quiz')}
    className={activeTab === 'quiz' ? 'border-b-2 border-blue-500' : ''}
  >
    Quiz
  </button>
  <button
    onClick={() => setActiveTab('assignments')}
    className={activeTab === 'assignments' ? 'border-b-2 border-blue-500' : ''}
  >
    Assignments
  </button>
</div>
```

### Content Rendering (Replace content div)
```javascript
<AnimatePresence mode="wait">
  {activeTab === 'quiz' ? (
    <motion.div key="quiz">{/* existing quiz content */}</motion.div>
  ) : (
    <motion.div key="assignments">{/* new assignments content */}</motion.div>
  )}
</AnimatePresence>
```

---

## Critical Info You Need BEFORE Coding

❓ **Question 1:** How do we get `classroomId`?
- MapViewerPage doesn't seem to have it
- Need to get it from user context or props

❓ **Question 2:** Should UI differ for teachers vs students?
- Teachers: grading interface?
- Students: submission interface?

❓ **Question 3:** File upload location?
- Inside panel or separate modal?
- Impacts component complexity

❓ **Question 4:** Tab state reset behavior?
- Remember tab selection across sessions?
- Or reset when panel closes?

❓ **Question 5:** Real-time updates?
- Refresh button or auto-refresh?
- Check for new assignments how often?

**⚠️ Answer these BEFORE starting Phase 1**

---

## What's Already Available (Don't Reinvent)

✅ **Service:** `assignmentService.list(classroomId)` - Gets all assignments
✅ **Service:** `assignmentService.get(id)` - Gets one assignment details
✅ **UI Components:** `Panel` wrapper - Reuse for assignment cards
✅ **Icons:** Lucide React - 15+ icon types available
✅ **Animations:** Framer Motion - Already imported in QuizPanel
✅ **Styling:** Tailwind CSS - Dark mode utilities built-in

---

## Files to Touch

| File | What to Do | Time |
|------|-----------|------|
| QuizPanel/index.jsx | Add tab state, UI, conditional render | 2-3h |
| MapViewerPage.jsx | Pass classroomId prop | 15m |
| (new) AssignmentCard.jsx | Display single assignment | 1h |
| (optional) API integration | Handle submissions | 2-3h |

---

## Gotchas to Avoid

❌ **Don't:** Forget to pass `classroomId` to QuizPanel
✅ **Do:** Get it from user/auth context or parent props

❌ **Don't:** Use separate scroll states for quiz vs assignments
✅ **Do:** Let AnimatePresence handle content switching

❌ **Don't:** Forget dark mode classes (`dark:bg-gray-900` etc)
✅ **Do:** Copy existing pattern from quiz content

❌ **Don't:** Make individual API calls per assignment
✅ **Do:** Use `assignmentService.list()` to get all at once

❌ **Don't:** Hardcode classroom filters
✅ **Do:** Make it dynamic from props

---

## Testing Checklist

- [ ] Tab buttons appear and switch correctly
- [ ] Quiz tab shows quiz (no change from original)
- [ ] Assignments tab shows loading spinner while fetching
- [ ] Assignments tab shows error message if API fails
- [ ] Assignment cards display title, due date, description
- [ ] Dark mode works (classes have `dark:` prefix)
- [ ] Mobile responsive (stays in 500px width)
- [ ] Animations smooth (no janky transitions)
- [ ] No console errors in devtools
- [ ] Close button works on both tabs

---

## Success Criteria

✅ **Basic Feature (6-8 hours)**
- Quiz and Assignments tabs both working
- Assignments load from API and display in list
- Dark mode supported
- Mobile responsive

✅ **Full Feature (12-16 hours)**
- Above + submission workflow
- Teachers can grade submissions
- Status indicators (pending, submitted, graded)
- Real-time updates

---

## If You Get Stuck

1. **Panel won't open?** → Check `isOpen` prop from MapViewerPage
2. **Assignments not showing?** → Check classroomId is passed correctly
3. **Animation janky?** → Use AnimatePresence `mode="wait"`
4. **Dark mode broken?** → Add `dark:` prefix to all Tailwind classes
5. **API errors?** → Check error message in component state

---

## File Paths (Copy-Paste Ready)

```
Component:  d:\Webgis\frontend\src\components\map\QuizPanel\index.jsx
Services:   d:\Webgis\frontend\src\services\assignment.service.js
Parent:     d:\Webgis\frontend\src\features\map\pages\MapViewerPage.jsx
Research:   d:\Webgis\plans\251119-0322-assignment-features-integration\research\
```

---

## Import You'll Need

```javascript
import { assignmentService } from '@services'
// Already in QuizPanel:
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, FileText, Download } from 'lucide-react'  // Add if needed
```

---

## Cost-Benefit Analysis

**Effort:** 6-8 hours (medium)
**Risk:** LOW (backward compatible)
**Benefit:** HIGH (new feature for students)
**User Impact:** Positive (better assignment management)

**ROI:** Worth it ✅

---

## Questions?

**Read These Documents (In Order):**
1. INDEX.md (navigation)
2. RESEARCH_SUMMARY.md (overview)
3. researcher-01-quizpanel-structure.md (detailed)
4. technical-findings.md (code examples)

---

**Last Updated:** 2025-11-19
**Version:** 1.0
**Status:** READY TO IMPLEMENT
