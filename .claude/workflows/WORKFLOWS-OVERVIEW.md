# ClaudeKit Workflows Overview

**Philosophy**: Different tasks need different workflows. ClaudeKit is FLEXIBLE.

---

## 🎯 Workflow Selection Matrix

| Task Type | Workflow | Primary Agents | Duration | Complexity |
|-----------|----------|----------------|----------|------------|
| **Bug Fix** | Debug → Fix | Debugger, Planner, Tester | 1-2h | Low-Med |
| **New Feature** | Research → Plan → Build | Brainstormer, Researchers, Planner, Tester | 4-8h | Med-High |
| **UI Design** | Design → Implement → Test | UI/UX Designer, Planner, Tester | 2-4h | Medium |
| **Research** | Parallel Research → Synthesize | Multiple Researchers, Planner | 1-2h | Low |
| **Refactoring** | Analyze → Plan → Refactor → Test | Debugger, Planner, Code Reviewer | 3-6h | Medium |
| **Security Audit** | Scan → Review → Fix | Debugger, Code Reviewer, Tester | 2-4h | Medium |
| **Performance Optimize** | Profile → Analyze → Optimize → Benchmark | Debugger, Planner, Tester | 3-5h | Med-High |
| **Bootstrap New Project** | Requirements → Research → Architect → Build | All Agents | 1-3 days | High |
| **Documentation** | Analyze → Write → Review | Scout, Docs Manager | 1-2h | Low |
| **Database Migration** | Plan → Test → Migrate → Verify | Database Admin, Tester | 2-3h | Medium |
| **API Development** | Design → Implement → Test → Document | Planner, Tester, Docs Manager | 3-5h | Medium |
| **Content Creation** | Research → Write → Review | Copywriter, Researcher | 1-2h | Low |

---

## 📋 Core Workflows

### 1. Bug Fix Workflow
```
User: "Fix login button not working"

Flow:
┌─────────────┐
│   Debugger  │ ← Investigate issue
└──────┬──────┘
       ▼
┌─────────────┐
│   Planner   │ ← Create fix strategy
└──────┬──────┘
       ▼
┌─────────────┐
│  Implement  │ ← Apply fix
└──────┬──────┘
       ▼
┌─────────────┐
│   Tester    │ ← Validate fix
└──────┬──────┘
       ▼
┌─────────────┐
│Code Reviewer│ ← Quality check
└─────────────┘

Duration: 1-2 hours
Agents: 4-5
```

---

### 2. New Feature Workflow
```
User: "Add user authentication system"

Flow:
┌──────────────┐
│ Brainstormer │ ← Generate ideas
└──────┬───────┘
       ▼
┌──────────────────────────────────┐
│ Parallel Researchers (3-5 agents)│ ← Research options
│ - Auth methods                   │
│ - Security best practices        │
│ - Library comparisons            │
│ - Implementation patterns        │
└──────────────┬───────────────────┘
               ▼
       ┌───────────────┐
       │    Planner    │ ← Synthesize & plan
       └───────┬───────┘
               ▼
       ┌───────────────┐
       │  Implement    │ ← Build feature
       └───────┬───────┘
               ▼
       ┌───────────────┐
       │    Tester     │ ← Comprehensive testing
       └───────┬───────┘
               ▼
       ┌───────────────┐
       │Code Reviewer  │ ← Quality + Security
       └───────┬───────┘
               ▼
       ┌───────────────┐
       │ Docs Manager  │ ← Update docs
       └───────────────┘

Duration: 4-8 hours
Agents: 7-10
```

---

### 3. UI Design Workflow ⭐ (NEW!)
```
User: "Create user dashboard page"

Flow:
┌──────────────┐
│ Brainstormer │ ← Define requirements
└──────┬───────┘
       ▼
┌────────────────────────────────┐
│ Parallel Researchers (2-3)    │ ← Research patterns
│ - Design patterns              │
│ - Component libraries          │
│ - Similar dashboards           │
└──────────────┬─────────────────┘
               ▼
       ┌───────────────┐
       │ UI/UX Designer│ ← Create design specs
       └───────┬───────┘
               ▼
       ┌───────────────┐
       │    Planner    │ ← Component breakdown
       └───────┬───────┘
               ▼
       ┌───────────────┐
       │  Implement    │ ← Build UI components
       │ + AI-Multimodal│   (generate assets)
       └───────┬───────┘
               ▼
       ┌───────────────┐
       │    Tester     │ ← Visual testing
       └───────┬───────┘
               ▼
       ┌───────────────┐
       │Code Reviewer  │ ← Design system check
       └───────────────┘

Duration: 2-4 hours
Agents: 5-7
```

---

### 4. Research Workflow
```
User: "Research best database for GIS applications"

Flow:
┌────────────────────────────────────────┐
│ Parallel Researchers (3-5 agents)     │ ← Deep research
│ - Researcher #1: PostgreSQL + PostGIS │
│ - Researcher #2: MongoDB with GeoJSON │
│ - Researcher #3: Neo4j spatial        │
│ - Researcher #4: Performance benchmarks│
│ - Researcher #5: Cost analysis        │
└────────────────┬───────────────────────┘
                 ▼
         ┌───────────────┐
         │    Planner    │ ← Synthesize findings
         └───────┬───────┘
                 ▼
         ┌───────────────┐
         │    Report     │ ← Recommendation
         └───────────────┘

Duration: 1-2 hours
Agents: 4-6
```

---

### 5. Bootstrap New Project Workflow
```
User: "Create new e-commerce website from scratch"

Flow:
┌──────────────┐
│Requirements  │ ← Gather requirements
│  Gathering   │   (interactive Q&A)
└──────┬───────┘
       ▼
┌────────────────────────────────┐
│ Parallel Researchers (5-7)    │ ← Research tech stack
│ - Frontend frameworks          │
│ - Backend frameworks           │
│ - Database options             │
│ - Payment gateways             │
│ - Deployment platforms         │
│ - Security requirements        │
└──────────────┬─────────────────┘
               ▼
       ┌───────────────────┐
       │System Architecture│ ← Design architecture
       └───────┬───────────┘
               ▼
       ┌───────────────┐
       │    Planner    │ ← Create implementation plan
       └───────┬───────┘
               ▼
       ┌───────────────┐
       │  Implement    │ ← Build project
       │  (Phases)     │   Phase by phase
       └───────┬───────┘
               ▼
       ┌───────────────┐
       │    Tester     │ ← Test each phase
       └───────┬───────┘
               ▼
       ┌───────────────┐
       │ Docs Manager  │ ← Create documentation
       └───────────────┘

Duration: 1-3 days
Agents: 10-15 (spawned progressively)
```

---

## 🎨 How ClaudeKit Chooses Workflow

### Automatic Detection (Natural Language)

**Example 1**: Bug Fix Detected
```
User: "Login button not responding"

ClaudeKit detects:
- Keywords: "not responding", "not working"
- Context: Existing code
- Type: Bug

→ Spawns: Debugger Workflow
```

**Example 2**: New Feature Detected
```
User: "I want to add real-time notifications"

ClaudeKit detects:
- Keywords: "add", "new feature"
- Complexity: High (real-time)
- Type: New functionality

→ Spawns: New Feature Workflow
  (Brainstormer → Researchers → Planner → ...)
```

**Example 3**: UI Design Detected
```
User: "Create a modern dashboard with widgets and charts"

ClaudeKit detects:
- Keywords: "create", "dashboard", "design"
- Type: UI/UX work
- Complexity: Medium-High

→ Spawns: UI Design Workflow
  (Brainstormer → UI/UX Designer → Implement → ...)
```

**Example 4**: Research Detected
```
User: "What's the best authentication method for my app?"

ClaudeKit detects:
- Keywords: "what's the best", "should I use"
- Type: Research/Decision
- No implementation needed yet

→ Spawns: Research Workflow
  (Parallel Researchers → Synthesize)
```

---

## 🚀 Workflow Customization

### You Can Customize by:

**1. Explicit Agent Specification**
```
User: "Use debugger agent to investigate slow queries"
→ Forces Debugger Workflow
```

**2. Slash Commands**
```
/brainstorm → Forces brainstorming phase
/plan → Forces planning workflow
/cook → Forces full implementation workflow
/design:good → Forces UI design workflow
/debug → Forces debug workflow
```

**3. Workflow Files**
Create custom workflows in `.claude/workflows/`:
- `ui-design-workflow.md` ← We just created this!
- `api-development-workflow.md`
- `security-audit-workflow.md`
- `database-migration-workflow.md`
- etc.

---

## 📝 Workflow Composition Patterns

### Sequential Pattern
```
Agent A → Agent B → Agent C
Example: Debugger → Planner → Implement
```

### Parallel Pattern
```
         ┌→ Agent A ┐
Agent 0 ─┼→ Agent B ┼→ Agent D
         └→ Agent C ┘
Example: Planner spawns 3 Researchers simultaneously
```

### Conditional Pattern
```
Agent A → Decision
          ├→ If complex: Agent B → Agent C
          └→ If simple: Agent D
```

### Iterative Pattern
```
Agent A → Agent B → Test
          ↑          │
          └─ Retry ──┘
Example: Implement → Test → Fix → Test (repeat until pass)
```

---

## 🎯 Task Type → Workflow Mapping

### Frontend Development
| Task | Workflow | Duration |
|------|----------|----------|
| New page | UI Design | 2-4h |
| Component | UI Design (fast) | 30min-1h |
| Redesign | UI Design + Refactor | 3-5h |
| Responsive fix | Debug → Fix | 30min-1h |

### Backend Development
| Task | Workflow | Duration |
|------|----------|----------|
| New API | API Development | 3-5h |
| Database change | Database Migration | 2-3h |
| Performance issue | Performance Optimize | 3-5h |
| Security issue | Security Audit | 2-4h |

### Full-Stack
| Task | Workflow | Duration |
|------|----------|----------|
| New feature | New Feature | 4-8h |
| Bug fix | Debug → Fix | 1-2h |
| Refactor | Refactor | 3-6h |
| New project | Bootstrap | 1-3 days |

---

## 💡 Best Practices

### 1. Let ClaudeKit Choose (Recommended)
```
✅ GOOD:
"I want to create a user profile page with avatar upload"
→ ClaudeKit detects UI Design workflow

❌ OVER-SPECIFIED:
"Use brainstormer then spawn 3 researchers then use ui/ux designer then..."
→ Too rigid, loses flexibility
```

### 2. Use Slash Commands for Control
```
✅ GOOD:
/design:good "user profile page"
→ Explicit UI Design workflow

✅ ALSO GOOD:
/cook "implement user profile"
→ Full implementation workflow
```

### 3. Combine Workflows
```
Example: Complex feature with UI

User: "Create admin dashboard with analytics"

Phase 1: Research Workflow
→ Research dashboard patterns, chart libraries

Phase 2: UI Design Workflow
→ Design dashboard layout, components

Phase 3: New Feature Workflow
→ Implement with backend integration

Phase 4: Testing Workflow
→ Comprehensive testing
```

---

## 📊 Workflow Complexity Levels

### Level 1: Simple (1 agent, <1h)
```
Tasks: Quick fixes, simple pages, basic research
Example: "Fix button alignment"
Workflow: Debug → Fix
```

### Level 2: Medium (2-4 agents, 1-3h)
```
Tasks: Standard features, moderate pages, focused research
Example: "Add pagination to table"
Workflow: Plan → Implement → Test
```

### Level 3: Complex (5-7 agents, 3-6h)
```
Tasks: New features, complex pages, comprehensive research
Example: "Create user authentication system"
Workflow: Brainstorm → Research → Plan → Implement → Test → Review
```

### Level 4: Very Complex (8+ agents, 6h-3 days)
```
Tasks: New projects, major refactors, architecture design
Example: "Build e-commerce platform from scratch"
Workflow: Bootstrap (all agents, progressive phases)
```

---

## 🎓 Examples by Use Case

### Use Case 1: "Create Login Page"

**ClaudeKit Auto-Detects**: UI Design Workflow (Medium complexity)

```
Agents Used:
1. Brainstormer → Define login page requirements
2. Researcher #1 → Research form design patterns
3. Researcher #2 → Research authentication UX
4. UI/UX Designer → Create login form design
5. Planner → Break into components
6. Implement → Build LoginForm.jsx
7. Tester → Test form validation
8. Code Reviewer → Check security

Duration: ~2-3 hours
Output: Working login page with validation
```

### Use Case 2: "Fix Slow API"

**ClaudeKit Auto-Detects**: Performance Optimize Workflow

```
Agents Used:
1. Debugger → Profile API, identify bottleneck
2. Planner → Create optimization strategy
3. Implement → Apply optimizations
4. Tester → Benchmark improvements

Duration: ~2-3 hours
Output: Optimized API with metrics
```

### Use Case 3: "Build Chat Feature"

**ClaudeKit Auto-Detects**: New Feature Workflow (Complex)

```
Agents Used:
1. Brainstormer → Define chat requirements
2. Researcher #1 → WebSocket vs polling
3. Researcher #2 → Real-time libraries
4. Researcher #3 → Message storage strategies
5. System Architect → Design chat architecture
6. Planner → Create implementation plan
7. UI/UX Designer → Design chat UI
8. Implement (Phases) → Build incrementally
9. Tester → Test real-time functionality
10. Code Reviewer → Review code quality
11. Docs Manager → Document chat feature

Duration: ~1-2 days
Output: Complete chat system
```

---

## 🔄 Workflow Evolution

Workflows can ADAPT mid-execution:

```
User: "Create landing page"

Start: UI Design Workflow (simple)
→ Brainstormer → Designer → Implement

Mid-way: User adds "with real-time analytics"
→ Workflow expands:
  + Researcher (analytics libraries)
  + System Architect (real-time data flow)
  + Tester (performance testing)

End: Complex New Feature Workflow
```

---

## 📖 Summary

| Question | Answer |
|----------|--------|
| **Same workflow for all?** | ❌ NO - Different tasks use different workflows |
| **How many workflows?** | 10+ core workflows, infinitely customizable |
| **Who chooses workflow?** | ClaudeKit auto-detects OR you specify |
| **Can combine workflows?** | ✅ YES - Complex tasks use multiple workflows |
| **Can customize?** | ✅ YES - Create `.claude/workflows/*.md` files |
| **Best approach?** | Let ClaudeKit detect (natural language) |

---

**Key Takeaway**: ClaudeKit is FLEXIBLE, not rigid. It adapts the workflow to match your task complexity and type.
