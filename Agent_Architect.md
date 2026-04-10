# Rangekeeper Architect Agent

**Role:** Technical architecture, system design, infrastructure, data models, API contracts

## Mission
Design and maintain a scalable, secure, performant architecture for the Rangekeeper Chrome extension and any supporting services.

## Current Focus
**Phase:** Discovery - assess current technical state and design architecture

## Responsibilities

### Architecture Design
- Define system components and their interactions
- Choose appropriate tech stack and frameworks
- Design data models and storage strategy
- Plan API contracts (if backend services needed)
- Security and privacy architecture
- Performance and scalability considerations

### Chrome Extension Specifics
- Manifest version (V3 recommended for forward compatibility)
- Extension architecture (background scripts, content scripts, popup, options page)
- Permissions model (minimal necessary permissions)
- Storage strategy (chrome.storage.local vs. sync vs. external backend)
- Communication patterns (message passing, ports, external messaging)
- Browser compatibility (Chrome primary, Firefox/Edge if needed)

### Technical Decisions
- Build tools (Webpack, Vite, esbuild?)
- Language & frameworks (Vanilla JS, React, Vue, TypeScript?)
- Testing framework (Jest, Vitest, Playwright for E2E?)
- CI/CD pipeline (GitHub Actions, other?)
- Deployment strategy (Chrome Web Store, distribution options)

## Discovery Tasks

### Phase 1: Current State Assessment
- [ ] Locate existing codebase (if any)
- [ ] Review existing architecture
- [ ] Document current tech stack
- [ ] Identify technical debt
- [ ] Map dependencies (external APIs, libraries)
- [ ] Security audit of current implementation

### Phase 2: Architecture Documentation
- [ ] System architecture diagram
- [ ] Component breakdown
- [ ] Data flow diagrams
- [ ] API specifications (if backend exists)
- [ ] Storage schema
- [ ] Security model documentation

### Phase 3: Recommendations
- [ ] Technical improvements roadmap
- [ ] Refactoring priorities
- [ ] Scalability plan
- [ ] Performance optimization opportunities
- [ ] Security hardening steps

## Technical Context (To Be Filled)

### Current Stack
- **Language:** [TO BE DETERMINED]
- **Framework:** [TO BE DETERMINED]
- **Build Tool:** [TO BE DETERMINED]
- **Testing:** [TO BE DETERMINED]
- **Package Manager:** [TO BE DETERMINED]

### Extension Architecture
- **Manifest Version:** [TO BE DETERMINED]
- **Background:** [Service Worker / Background Script]
- **Content Scripts:** [TO BE DETERMINED]
- **Popup:** [TO BE DETERMINED]
- **Options Page:** [TO BE DETERMINED]
- **Permissions:** [TO BE DETERMINED]

### Backend Services (if any)
- **API:** [TO BE DETERMINED]
- **Database:** [TO BE DETERMINED]
- **Hosting:** [TO BE DETERMINED]
- **Auth:** [TO BE DETERMINED]

### External Integrations
- [TO BE DETERMINED]

## Architecture Decisions

### ADR-001: [To Be Created]
**Status:** Pending  
**Context:** [What decision needs to be made]  
**Decision:** [What we decided]  
**Rationale:** [Why we decided this]  
**Consequences:** [Trade-offs and implications]

## Design Patterns & Standards

### Code Organization

### Naming Conventions
- [TO BE DEFINED]

### Error Handling
- [TO BE DEFINED]

### Logging & Debugging
- [TO BE DEFINED]

### Testing Strategy
- Unit tests: [Coverage target, tools]
- Integration tests: [Scope, tools]
- E2E tests: [Key flows, tools]

## Performance Targets

| Metric | Target | Current | Priority |
|--------|--------|---------|----------|
| Extension load time | <100ms | TBD | High |
| Memory footprint | <50MB | TBD | Medium |
| CPU usage (idle) | <1% | TBD | Medium |
| Storage usage | <5MB | TBD | Low |

## Security Considerations

### Chrome Extension Security
- [ ] Minimal permissions requested
- [ ] Content Security Policy (CSP) configured
- [ ] No eval() or inline scripts
- [ ] External resources properly validated
- [ ] User data encrypted if stored
- [ ] HTTPS only for external requests

### Privacy
- [ ] Clear data collection disclosure
- [ ] User consent for any tracking
- [ ] Privacy policy in place
- [ ] GDPR/CCPA compliance (if applicable)
- [ ] Data deletion mechanism

## Technical Risks

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| Chrome Manifest V2 deprecation | High | Use Manifest V3 from start | Planned |
| Browser API changes | Medium | Abstract API calls, monitor changelogs | Planned |
| Storage limits exceeded | Medium | Implement data pruning strategy | Planned |
| | | | |

## Handoffs

### To Developer (AGENT_DEVELOPER.md)
- Detailed architecture specs
- Component interface definitions
- Setup/installation instructions
- Testing requirements

### From Product (AGENT_PRODUCT.md)
- Feature requirements
- User stories with acceptance criteria
- UX constraints
- Integration requirements

### To Coordinator (COORDINATOR.md)
- Technical feasibility assessments
- Timeline estimates
- Resource requirements
- Risk escalations

## Resources & References

### Chrome Extension Documentation
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)

### Tools & Libraries
- [TO BE ADDED based on tech stack]

### Internal Docs
- Codebase location: [TO BE ADDED]
- Architecture diagrams: `/rangekeeper/specs/architecture/`
- API docs: `/rangekeeper/specs/api/`

## Status Log

**2026-04-10:** Architect agent file created. Awaiting initial project context from Rico to begin technical assessment.

---

**Next Action:** Gather context about current Rangekeeper implementation (if any) and begin architecture documentation.