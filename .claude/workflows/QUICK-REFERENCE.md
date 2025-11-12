# ClaudeKit Workflows - Quick Reference

**TL;DR**: ClaudeKit adapts workflow to your task type. You don't need to memorize - just describe what you want!

---

## 🚀 Quick Decision Tree

```
What do you want to do?
│
├─ Fix a bug?
│  → Just say: "Fix [describe issue]"
│  → ClaudeKit uses: Debugger → Planner → Fix → Test
│  → Time: 1-2 hours
│
├─ Create new page/UI?
│  → Just say: "Create [describe page]"
│  → ClaudeKit uses: Designer → Planner → Implement → Test
│  → Time: 2-4 hours
│  → File: .claude/workflows/ui-design-workflow.md
│
├─ Add new feature?
│  → Just say: "Add [describe feature]"
│  → ClaudeKit uses: Brainstorm → Research → Plan → Build → Test
│  → Time: 4-8 hours
│
├─ Need to decide/research?
│  → Just say: "What's the best [question]?"
│  → ClaudeKit uses: Parallel Researchers → Report
│  → Time: 1-2 hours
│
└─ Build new project from scratch?
   → Just say: "Create new [type] project"
   → ClaudeKit uses: Bootstrap workflow (all agents)
   → Time: 1-3 days
```

---

## 💬 Natural Language Examples

### Creating UI

```
❌ DON'T SAY:
"Use brainstormer agent then spawn UI/UX designer agent..."

✅ SAY:
"Create a user dashboard with widgets and charts"

→ ClaudeKit automatically:
  - Detects UI Design task
  - Spawns Designer agent
  - Creates design specs
  - Implements components
  - Tests responsiveness
```

### Fixing Bugs

```
❌ DON'T SAY:
"Invoke debugger agent to investigate..."

✅ SAY:
"Login button isn't working"

→ ClaudeKit automatically:
  - Detects bug fix task
  - Spawns Debugger
  - Identifies issue
  - Creates fix plan
  - Implements fix
  - Validates
```

### Research

```
❌ DON'T SAY:
"Spawn 3 researcher agents to investigate..."

✅ SAY:
"Should I use PostgreSQL or MongoDB for GIS data?"

→ ClaudeKit automatically:
  - Detects research task
  - Spawns multiple Researchers
  - Compares options
  - Provides recommendation
```

---

## ⚡ Slash Commands (For More Control)

| Command | When to Use | What It Does | Time |
|---------|-------------|--------------|------|
| `/plan "task"` | Need detailed plan first | Research + Planning only | 30-60min |
| `/cook "task"` | Ready to implement | Full workflow: plan + build + test | 2-6h |
| `/design:fast "page"` | Quick UI mockup | Fast UI design | 30min-1h |
| `/design:good "page"` | Quality UI design | Comprehensive UI design | 2-4h |
| `/debug "issue"` | Investigate problem | Deep debugging | 30min-2h |
| `/fix:fast "bug"` | Quick bug fix | Direct fix without deep analysis | 15-30min |
| `/fix:hard "bug"` | Complex bug | Full debugging workflow | 2-4h |
| `/brainstorm "idea"` | Generate ideas | Brainstorming session | 15-30min |
| `/test` | Run tests | Comprehensive testing | 20-30min |
| `/review` | Code review | Quality check | 15-30min |

---

## 🎯 Task Type → Just Say

| You Want | Just Say | ClaudeKit Does |
|----------|----------|----------------|
| **New login page** | "Create login page with email/password" | UI Design workflow |
| **Dashboard** | "Create admin dashboard with stats" | UI Design + Data workflow |
| **User profile** | "Create user profile page with avatar upload" | UI Design workflow |
| **Landing page** | "Create landing page with hero and features" | UI Design workflow |
| **Fix layout** | "Fix responsive layout on mobile" | Debug → Fix workflow |
| **Add feature** | "Add real-time notifications" | New Feature workflow |
| **Optimize** | "App is slow, optimize it" | Performance workflow |
| **New project** | "Create e-commerce website from scratch" | Bootstrap workflow |
| **Research** | "What's the best state management library?" | Research workflow |
| **Security** | "Check for security vulnerabilities" | Security Audit workflow |

---

## 📋 Common Workflows Cheat Sheet

### 1. Create New Web Page ⭐ (MOST COMMON)

**Natural Language**:
```
"Create [page type] with [features]"

Examples:
- "Create user dashboard with charts and widgets"
- "Create login page with social auth"
- "Create product listing page with filters"
```

**Workflow**:
```
Brainstormer → UI/UX Designer → Implement → Test
```

**Output**:
- Design specs
- React components
- Styled with Tailwind
- Responsive design
- Tests

**Time**: 2-4 hours

---

### 2. Fix Bug 🐛

**Natural Language**:
```
"[What's wrong]"

Examples:
- "Login button not responding"
- "Page crashes when clicking submit"
- "API returns 500 error"
```

**Workflow**:
```
Debugger → Planner → Implement → Test
```

**Output**:
- Debug report
- Fix plan
- Fixed code
- Test validation

**Time**: 1-2 hours

---

### 3. Add Feature ✨

**Natural Language**:
```
"Add [feature]" or "I want to add [feature]"

Examples:
- "Add user authentication"
- "Add real-time chat"
- "Add payment integration"
```

**Workflow**:
```
Brainstormer → Researchers → Planner → Implement → Test → Review
```

**Output**:
- Research reports
- Implementation plan
- Complete feature
- Tests
- Documentation

**Time**: 4-8 hours

---

### 4. Research & Decide 🔍

**Natural Language**:
```
"What's the best [question]?" or "Should I use [A or B]?"

Examples:
- "What's the best database for my app?"
- "Should I use Next.js or Remix?"
- "How to implement authentication?"
```

**Workflow**:
```
Multiple Researchers (parallel) → Synthesize → Recommend
```

**Output**:
- Research reports
- Comparison
- Recommendation

**Time**: 1-2 hours

---

## 🎨 UI Design Tasks - Detailed Examples

### Simple Page (1-2 hours)
```
"Create about page"
→ Designer → Implement → Test
```

### Medium Page (2-3 hours)
```
"Create user profile with avatar upload and edit form"
→ Brainstormer → Designer → Implement → Test
```

### Complex Page (3-5 hours)
```
"Create admin dashboard with real-time analytics, charts, and notifications"
→ Brainstormer → Researchers → Designer → Architect → Implement → Test
```

### Full Application (1-2 days)
```
"Create e-commerce website with product listings, cart, and checkout"
→ Bootstrap workflow (all agents, progressive phases)
```

---

## 🔄 When Workflows Combine

### Example: E-commerce Product Page

**Your Request**:
```
"Create product page with image gallery, reviews, and add to cart"
```

**ClaudeKit Automatically Combines**:

1. **UI Design Workflow** (for layout)
   - Designer creates page layout
   - Component hierarchy

2. **Research Workflow** (for best practices)
   - Research image gallery libraries
   - Research review components

3. **New Feature Workflow** (for cart integration)
   - Plan cart state management
   - Implement add-to-cart functionality

**Total**: ~4-6 hours with 7-8 agents

---

## 💡 Pro Tips

### Tip 1: Be Specific But Natural
```
❌ VAGUE: "Make a page"
✅ SPECIFIC: "Create user profile page with avatar, bio, and activity feed"

❌ TOO TECHNICAL: "Spawn UI/UX designer agent to create wireframes..."
✅ NATURAL: "Design a modern dashboard"
```

### Tip 2: Let ClaudeKit Decide
```
ClaudeKit is smart. It will:
- Detect task complexity
- Choose appropriate workflow
- Spawn needed agents
- Adapt as needed

You just describe WHAT you want, not HOW to build it.
```

### Tip 3: Use Slash Commands When You Know
```
If you're familiar with workflows:
/design:good "dashboard" → Forces UI Design
/cook "feature" → Forces full implementation
/plan "task" → Forces planning only
```

### Tip 4: Check Plans Directory
```
After any workflow, check:
plans/YYYYMMDD-HHmm-task-name/

Contains:
- Plan files
- Research reports
- Test reports
- Code reviews
```

---

## 🎯 Real-World Examples

### Example 1: Beginner

**User**: "I want a login page"

**ClaudeKit**:
```
Detects: UI Design task, simple
Workflow: Designer → Implement → Test
Agents: 3
Time: 1-2 hours
Output: Login.jsx with form validation
```

### Example 2: Intermediate

**User**: "Create dashboard showing user stats and recent activity"

**ClaudeKit**:
```
Detects: UI Design task, medium complexity
Workflow: Brainstormer → Designer → Planner → Implement → Test
Agents: 5
Time: 3-4 hours
Output: Dashboard components + API integration
```

### Example 3: Advanced

**User**: "Build admin panel with user management, analytics, and settings"

**ClaudeKit**:
```
Detects: Complex application
Workflow: Bootstrap → UI Design → New Feature (combined)
Agents: 10+
Time: 1-2 days
Output: Complete admin panel with all features
```

---

## 📊 Workflow Selection Logic

```
ClaudeKit analyzes your request:
│
├─ Keywords: "create", "build", "design"
│  AND mentions: "page", "dashboard", "UI"
│  → UI Design Workflow
│
├─ Keywords: "fix", "broken", "not working"
│  → Debug Workflow
│
├─ Keywords: "add", "implement", "new feature"
│  → New Feature Workflow
│
├─ Keywords: "what's best", "should I", "which"
│  → Research Workflow
│
└─ Keywords: "from scratch", "new project"
   → Bootstrap Workflow
```

---

## 🎓 Remember

1. **Don't overthink** - Just describe what you want
2. **Natural language works** - No need to specify agents
3. **ClaudeKit adapts** - Workflow changes based on complexity
4. **Slash commands exist** - For when you want control
5. **Workflows combine** - Complex tasks use multiple workflows
6. **Everything documented** - Check `plans/` directory
7. **Agents work together** - Parallel + Sequential execution

---

## 📚 Quick Links

- **Full Overview**: `.claude/workflows/WORKFLOWS-OVERVIEW.md`
- **UI Design Guide**: `.claude/workflows/ui-design-workflow.md`
- **Available Commands**: `.claude/commands/`
- **Agent Definitions**: `.claude/agents/`

---

**Bottom Line**: Just tell ClaudeKit what you want in plain English. It figures out the workflow! 🚀
