# UI Design Workflow - ClaudeKit

**When to use**: Creating new web pages, redesigning UI, building user interfaces

---

## Workflow Steps

### Phase 1: Discovery & Research (15-30 min)

**Agents**: Brainstormer + Researchers

1. **Brainstormer Agent**
   - Understand user needs
   - Define page purpose
   - Identify key features
   - Generate design ideas

2. **Parallel Researchers** (spawn 2-3)
   - Research design patterns (e.g., dashboard layouts)
   - Research component libraries (e.g., shadcn/ui, Material-UI)
   - Research similar websites for inspiration
   - Research accessibility standards

**Trigger Commands**:
```
/brainstorm "what should a user profile page include?"
```

**Output**:
- `plans/YYYYMMDD-HHmm-ui-design-name/research/`
- Design requirements document

---

### Phase 2: Design Planning (30-60 min)

**Agents**: UI/UX Designer + Planner

3. **UI/UX Designer Agent**
   - Create wireframes (describe or generate)
   - Define component hierarchy
   - Choose color scheme
   - Define typography
   - Plan responsive breakpoints
   - Design interactions

4. **Planner Agent**
   - Break down into components
   - Define implementation phases
   - Identify reusable components
   - Plan state management

**Trigger Commands**:
```
/design:good "create user profile page with avatar, stats, activity feed"
```

**Output**:
- Wireframe descriptions
- Component tree
- Implementation plan
- `plans/YYYYMMDD-HHmm-ui-design-name/design-specs.md`

---

### Phase 3: Implementation (1-3 hours)

**Agents**: Main Agent + AI-Multimodal Skill

5. **Component Development**
   - Create React components
   - Implement Tailwind CSS styling
   - Add responsive design
   - Integrate with backend API

6. **Asset Generation** (if needed)
   - Use ai-multimodal skill to generate images
   - Optimize images with ImageMagick
   - Generate icons

**Trigger Commands**:
```
/cook "implement user profile page following design specs"
```

**Output**:
- React components in `frontend/src/features/profile/`
- Styled components
- API integration

---

### Phase 4: Visual Testing (30 min)

**Agents**: Tester Agent + Manual Review

7. **Automated Tests**
   - Component rendering tests
   - Responsive design tests
   - Accessibility tests
   - Visual regression tests

8. **Manual Review**
   - Browser testing (Chrome, Firefox, Safari)
   - Mobile responsive check
   - Accessibility audit (WCAG)
   - UX flow validation

**Trigger Commands**:
```
/test "validate user profile page UI"
```

**Output**:
- Test results
- Screenshots
- Accessibility report

---

### Phase 5: Refinement (30-60 min)

**Agents**: Code Reviewer + Docs Manager

9. **Code Review**
   - Check component quality
   - Verify design system compliance
   - Performance optimization
   - Code organization

10. **Documentation**
   - Component documentation
   - Usage examples
   - Storybook stories (if applicable)
   - Update design system docs

**Trigger Commands**:
```
/review "review profile page components"
/docs "update component documentation"
```

**Output**:
- Code review report
- Component docs
- Storybook files

---

## Full Workflow Command Sequence

### Option A: Step-by-Step (Recommended)

```bash
# Step 1: Brainstorm
/brainstorm "what features should a user dashboard have?"

# Step 2: Design
/design:good "create modern user dashboard with widgets, charts, notifications"

# Step 3: Implement
/cook "implement dashboard following design specs"

# Step 4: Test
/test "validate dashboard UI and responsiveness"

# Step 5: Review
/review "review dashboard code quality"
/docs "update dashboard documentation"
```

### Option B: Fast Track

```bash
# All-in-one (less detailed)
/cook:auto "create user dashboard page with widgets and charts"
```

### Option C: Natural Language (ClaudeKit Auto-Detects)

```
"I want to create a user dashboard page with widgets showing stats,
recent activity, and notifications. Use Tailwind CSS and make it responsive."

→ ClaudeKit automatically:
  1. Spawns brainstormer
  2. Spawns UI/UX designer
  3. Creates design plan
  4. Implements components
  5. Tests responsiveness
  6. Reviews quality
```

---

## Workflow Customization

### For Simple Pages (landing page, about page)

```
Skip: Brainstormer, Heavy research
Use: UI/UX Designer → Implement → Quick Test
Time: 30-60 min
```

### For Complex Apps (dashboard, admin panel)

```
Use: Full workflow with multiple researchers
Add: System Architecture agent for state management
Time: 4-8 hours
```

### For Design System Work

```
Focus: Component library creation
Agents: UI/UX Designer + Code Reviewer + Docs Manager
Output: Reusable components + Storybook
Time: 1-2 days
```

---

## Templates by Page Type

### 1. Landing Page
```
Agents: UI/UX Designer → Implement → Visual Test
Focus: Hero section, CTA, responsive images
Time: 1-2 hours
```

### 2. Dashboard
```
Agents: Brainstormer → Researcher (chart libraries) →
        UI/UX Designer → Implement → Tester
Focus: Data visualization, widgets, real-time updates
Time: 4-6 hours
```

### 3. Form Pages (login, register, profile edit)
```
Agents: UI/UX Designer → Implement → Tester (validation)
Focus: Form validation, error handling, UX
Time: 2-3 hours
```

### 4. Data Tables (admin, listings)
```
Agents: Researcher (table libraries) → UI/UX Designer →
        Implement → Tester
Focus: Pagination, sorting, filtering
Time: 3-4 hours
```

### 5. Content Pages (blog, docs)
```
Agents: Content Writer (copywriter) → UI/UX Designer → Implement
Focus: Typography, readability, SEO
Time: 1-2 hours
```

---

## Agent Roles in UI Design

### Brainstormer
- Generate design ideas
- User need analysis
- Feature prioritization

### Researchers
- Design pattern research
- Component library comparison
- Competitor analysis
- Accessibility guidelines

### UI/UX Designer
- Wireframe creation
- Visual design
- Component hierarchy
- Interaction design
- Responsive strategy

### Planner
- Break into components
- Implementation phases
- State management plan
- API integration plan

### Tester
- Visual regression testing
- Responsive testing
- Accessibility audit
- Cross-browser testing

### Code Reviewer
- Design system compliance
- Code quality
- Performance optimization
- Best practices

### Docs Manager
- Component documentation
- Usage examples
- Design system updates

---

## Skills to Activate

For UI design workflows, commonly used skills:

- **ai-multimodal**: Generate images, analyze designs
- **ImageMagick**: Image optimization, manipulation
- **shadcn-ui**: Component library integration
- **tailwind-css**: Styling framework
- **remix-icon**: Icon system
- **canvas-design**: Visual asset generation

---

## Output Structure

```
plans/YYYYMMDD-HHmm-page-name/
├── plan.md                    # Overview
├── design-specs.md            # Design specifications
├── component-hierarchy.md     # Component tree
├── research/
│   ├── design-patterns.md
│   ├── component-libraries.md
│   └── accessibility.md
├── wireframes/                # Generated or described
├── implementation/
│   ├── phase-01-layout.md
│   ├── phase-02-components.md
│   └── phase-03-integration.md
└── test-report.md             # Visual testing results
```

---

## Example: Creating User Profile Page

### User Request
```
"Create a user profile page with avatar upload,
personal info editing, activity history, and settings"
```

### ClaudeKit Workflow

**Phase 1: Discovery** (15 min)
```
→ Brainstormer: Analyze requirements
→ Researcher #1: Profile page design patterns
→ Researcher #2: Avatar upload solutions
→ Researcher #3: Activity feed patterns
→ Output: Requirements doc
```

**Phase 2: Design** (30 min)
```
→ UI/UX Designer: Create wireframe
  - Header: Avatar + Name + Bio
  - Tabs: Info | Activity | Settings
  - Forms: Edit profile form
  - Components: ActivityCard, SettingsPanel
→ Planner: Break into components
→ Output: Design specs + component tree
```

**Phase 3: Implementation** (2 hours)
```
→ Create components:
  - ProfileHeader.jsx
  - ProfileInfo.jsx
  - ActivityFeed.jsx
  - SettingsPanel.jsx
  - AvatarUpload.jsx
→ Integrate API calls
→ Add responsive design
→ Output: Working profile page
```

**Phase 4: Testing** (30 min)
```
→ Tester: Run visual tests
  - Mobile responsive ✓
  - Avatar upload ✓
  - Form validation ✓
  - Accessibility ✓
→ Output: Test report
```

**Phase 5: Review** (15 min)
```
→ Code Reviewer: Quality check
  - Component structure ✓
  - Styling consistency ✓
  - Performance ✓
→ Docs Manager: Document components
→ Output: Review report + docs
```

**Total Time**: ~3.5 hours
**Total Agents**: 7 (Brainstormer, 3 Researchers, Designer, Planner, Tester, Reviewer)

---

## Quick Reference

| Task | Commands | Time | Agents |
|------|----------|------|--------|
| Simple page | `/design:fast` → `/cook` | 1h | 2-3 |
| Complex page | `/brainstorm` → `/design:good` → `/cook` | 3-4h | 5-7 |
| Full app | `/bootstrap` → Design workflow | 1-2 days | 8+ |
| Redesign | `/design:screenshot` → `/cook` | 2-3h | 3-4 |

---

**Remember**: This workflow is FLEXIBLE. Adapt based on:
- Page complexity
- Time constraints
- Quality requirements
- Team size
