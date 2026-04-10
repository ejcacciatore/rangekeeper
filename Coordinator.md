# Rangekeeper Coordinator

**Role:** Orchestrate work across specialist agents, manage handoffs, maintain project coherence

## Coordination Principles

1. **Single Source of Truth:** PROJECT_MANAGER.md is the master status document
2. **Clear Handoffs:** Each agent documents outputs and next-agent inputs
3. **Context Preservation:** All decisions logged with reasoning
4. **Parallel Work:** Identify independent workstreams to maximize velocity
5. **Weekly Sync:** Update all docs every Friday, or after major milestones

## Agent Responsibilities

### AGENT_ARCHITECT.md
- **Owns:** Technical architecture, system design, infrastructure decisions
- **Inputs:** Product requirements, performance constraints, integration needs
- **Outputs:** Architecture diagrams, tech stack recommendations, API specs, data models
- **Handoff to:** Developer (implementation specs), Product (feasibility assessment)

### AGENT_DEVELOPER.md
- **Owns:** Code implementation, testing, debugging, DevOps
- **Inputs:** Architecture specs, user stories, acceptance criteria
- **Outputs:** Working code, test coverage, deployment guides, bug reports
- **Handoff to:** Product (demo builds), Architect (refactor needs), GTM (release candidates)

### AGENT_PRODUCT.md
- **Owns:** User experience, feature prioritization, requirements, design
- **Inputs:** Market research, user feedback, technical constraints
- **Outputs:** User stories, wireframes, acceptance criteria, roadmap
- **Handoff to:** Architect (requirements), GTM (feature messaging), Developer (specs)

### AGENT_GTM.md
- **Owns:** Positioning, launch strategy, marketing, user acquisition
- **Inputs:** Product features, competitive landscape, target users
- **Outputs:** Messaging framework, launch plan, content calendar, metrics dashboard
- **Handoff to:** Product (market feedback), Rico (strategic recommendations)

## Current Sprint: Discovery Phase

### Sprint Goal
Build complete understanding of Rangekeeper - what it is, where it is, what it needs

### Parallel Workstreams

**Stream 1: Technical Assessment** (Architect + Developer)
- Locate and audit existing codebase
- Document current architecture and dependencies
- Identify technical debt and risks
- Estimate completion state (% done)

**Stream 2: Product Definition** (Product)
- Define user personas and use cases
- Document current features vs. planned features
- Competitive analysis (similar Chrome extensions)
- UX audit if demo is available

**Stream 3: Market Position** (GTM)
- Market sizing and validation
- Revenue model options
- Launch readiness assessment
- User acquisition strategy

### Dependencies
- **All streams blocked on:** Initial context from Rico (what is Rangekeeper?)
- **Developer blocked on:** Repository access
- **Product blocked on:** User stories or current demo
- **GTM blocked on:** Product positioning clarity

### Handoff Checkpoints

**Checkpoint 1: Context Gathered** (Target: Day 1)
- [ ] Rico provides overview, goals, current state
- [ ] Repository located or confirmed not started
- [ ] Existing docs/designs collected

**Checkpoint 2: Assessment Complete** (Target: Day 3)
- [ ] Architect: Technical state documented
- [ ] Product: Feature scope defined
- [ ] GTM: Market position mapped
- [ ] Coordinator: Synthesize into roadmap

**Checkpoint 3: Roadmap Approved** (Target: Day 5)
- [ ] Rico reviews and approves plan
- [ ] Milestone dates set
- [ ] Resource needs identified
- [ ] Sprint 2 planned

## Communication Protocol

### When to Escalate to Rico
- Strategic decisions (pivot, scope changes)
- Budget/resource needs
- Blockers that can't be resolved internally
- Revenue impact decisions
- Timeline slips >1 week

### When to Coordinate Internally
- Technical feasibility questions (Product → Architect)
- Implementation timelines (Architect → Developer)
- Feature cuts or additions (Product → GTM)
- Launch readiness (Developer → GTM)

### Documentation Standards
- All decisions logged in relevant AGENT_*.md file
- Cross-references use relative links
- Status updates include: Done / In Progress / Blocked
- Blockers include: What's needed, who can unblock, by when

## Tools & Processes

### Development
- Version control: [TO BE CONFIRMED - Git/GitHub?]
- CI/CD: [TO BE DEFINED]
- Testing: [TO BE DEFINED]
- Staging environment: [TO BE DEFINED]

### Project Management
- Task tracking: This folder structure + markdown files
- Milestones: PROJECT_MANAGER.md
- Sprint planning: Weekly coordination updates
- Retrospectives: After each major milestone

### Communication
- Primary: Updates in agent .md files
- Sync: Rico check-ins as needed
- Artifacts: Store in /research, /specs, /assets subfolders

## Decision Log

| Date | Decision | Rationale | Owner | Status |
|------|----------|-----------|-------|--------|
| 2026-04-10 | Created project structure | Need organized approach to understand Rangekeeper | Coordinator | Active |
| | | | | |

## Risk Register

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| No existing codebase | High | Medium | Start from scratch with clear spec | Architect |
| Unclear product vision | High | Low | Discovery sprint with Rico | Product |
| Chrome extension policy changes | Medium | Low | Monitor Chrome Web Store policies | Developer |
| | | | | |

---

**Next Coordinator Action:** Gather initial context from Rico about Rangekeeper scope and current state.