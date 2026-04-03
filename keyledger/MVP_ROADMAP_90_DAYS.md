# KeyLedger 90-Day MVP Roadmap
## From Zero to First Paying Agents

**Timeline:** April 1 - June 30, 2026  
**Goal:** Launch MVP, acquire 10-20 paying agents, validate product-market fit, generate $500-2,000 MRR

---

## MONTH 1: BUILD & VALIDATE (April 1-30)

### Week 1 (Apr 1-7): Foundation

**Backend Infrastructure**
- [ ] Set up AWS/GCP/Railway infrastructure
  - Postgres database (RDS or Supabase)
  - S3 for document storage
  - Redis for caching/sessions
  - Auth0 or custom JWT auth
- [ ] Core data models:
  - Users (agents, buyers, sellers)
  - Properties
  - Transactions
  - Documents
  - Timeline events
  - Notifications
- [ ] REST API skeleton (Express or FastAPI)
  - `/auth` endpoints (signup, login, password reset)
  - `/users` endpoints (profile, settings)
  - `/transactions` CRUD
  - `/documents` upload/download
  - `/timeline` event logging

**Frontend Setup**
- [ ] Next.js or React app
- [ ] Tailwind CSS + component library (shadcn/ui or Chakra)
- [ ] Mobile-responsive layouts
- [ ] Authentication flows (signup, login, forgot password)

**Deliverables:**
- ✅ Database schema finalized
- ✅ Backend deployed to staging
- ✅ Frontend skeleton live on staging URL
- ✅ Auth working end-to-end

---

### Week 2 (Apr 8-14): Agent Dashboard (Core Workflow)

**Build:**
- [ ] Agent signup flow (email verification, profile setup)
- [ ] Agent dashboard home (transaction overview)
- [ ] Create Transaction form (property details, participants, key dates)
- [ ] Transaction detail view (timeline, documents, participants)
- [ ] Basic timeline (manual event logging)
  - "Showing Scheduled"
  - "Offer Submitted"
  - "Inspection Completed"
  - "Deal Closed"

**Testing:**
- [ ] Create 3 test agent accounts
- [ ] Create 5 test transactions (various stages)
- [ ] Verify timeline event creation works
- [ ] Mobile responsiveness check

**Deliverables:**
- ✅ Agents can sign up and create transactions
- ✅ Timeline event logging works
- ✅ Transaction detail page displays properly

---

### Week 3 (Apr 15-21): Document Management & Client Portals

**Build:**
- [ ] Document upload (drag-drop, attach to timeline events)
- [ ] Document storage (S3 or Cloudflare R2)
- [ ] Document permissions (buyer, seller, agent visibility)
- [ ] Client portal (buyer/seller view of their transaction)
  - Public link: `keyledger.io/portal/{transaction_id}/{token}`
  - Timeline view (read-only for clients)
  - Document access (download contracts, inspection reports)
  - Message agent (simple contact form or chat)
- [ ] Email invites for clients ("Your agent invited you to view your transaction")

**Testing:**
- [ ] Upload 10 sample documents (contracts, PDFs, images)
- [ ] Invite test buyer/seller emails
- [ ] Verify client portal loads correctly
- [ ] Check document download permissions

**Deliverables:**
- ✅ Agents can upload documents and attach to timeline
- ✅ Clients can access portal and view transaction progress
- ✅ Email invites working

---

### Week 4 (Apr 22-30): Polish & Beta Prep

**Build:**
- [ ] Notification system (email for now, SMS later)
  - New timeline event → Notify client
  - Document uploaded → Notify client
  - Deal status changed → Notify all participants
- [ ] Agent settings page (profile, notifications, billing setup stub)
- [ ] Basic analytics (# transactions, # closed, avg days to close)
- [ ] Landing page (keyledger.io) — Basic hero, features, signup CTA
- [ ] FAQ page
- [ ] Terms of Service + Privacy Policy

**Testing:**
- [ ] End-to-end test: Agent creates transaction, invites buyer, uploads docs, closes deal
- [ ] Email notification test (all triggers)
- [ ] Landing page conversion test (sign up from homepage)
- [ ] Mobile UI final review

**Beta Pilot Prep:**
- [ ] Recruit 3-5 agents for beta (existing network, LinkedIn, local realtors)
- [ ] Prepare onboarding doc (PDF guide: "How to Use KeyLedger")
- [ ] Set up support channel (email + optional Slack/Discord)

**Deliverables:**
- ✅ MVP feature-complete (agent accounts, transactions, timeline, documents, client portals, notifications)
- ✅ Landing page live
- ✅ 3-5 beta agents recruited and onboarded
- ✅ Beta starts May 1

---

## MONTH 2: BETA TEST & ITERATE (May 1-31)

### Week 5-6 (May 1-14): Beta Testing Phase 1

**Goals:**
- Get 3-5 beta agents using KeyLedger for real transactions
- Gather qualitative feedback (weekly calls with each agent)
- Track usage metrics (logins, transactions created, docs uploaded, client portal visits)

**Activities:**
- [ ] Send weekly check-in emails to beta agents
- [ ] Monitor support requests (bugs, UX issues, feature requests)
- [ ] Fix critical bugs immediately (< 24hr turnaround)
- [ ] Iterate on UX based on feedback (simplify flows, clarify UI labels)

**Metrics to Watch:**
- Agent activation rate: Did all 5 agents create at least 1 transaction?
- Transaction completion rate: How many deals progressed through timeline?
- Client portal adoption: Are buyers/sellers accessing portals?
- Support ticket volume: How many issues per agent?

**Deliverables:**
- ✅ 5 agents actively using KeyLedger
- ✅ At least 10 real transactions created
- ✅ Feedback doc compiled (bugs, feature requests, UX pain points)
- ✅ Critical bugs fixed

---

### Week 7 (May 15-21): Feature Iteration (Based on Beta Feedback)

**Likely feedback themes to address:**

**Theme 1: Faster transaction creation**
- Solution: Add templates (e.g., "Buyer Representation", "Listing", "Dual Agency")
- Solution: Pre-fill common fields (inspectors, lenders from agent's network)

**Theme 2: Better mobile experience**
- Solution: Optimize timeline view for mobile
- Solution: Add mobile document camera (snap photos of contracts on-site)

**Theme 3: Integration requests**
- Solution: Add DocuSign webhook (auto-import signed docs)
- Solution: Add MLS data import (paste MLS # → auto-fill property details)

**Theme 4: Notification overload**
- Solution: Add notification preferences (daily digest vs. real-time)
- Solution: Group notifications (don't send 10 emails for 10 doc uploads)

**Build:**
- [ ] Implement top 3 requested features
- [ ] UX polish (fix confusing labels, improve form validation)
- [ ] Performance optimization (faster page loads, optimize DB queries)

**Deliverables:**
- ✅ Top 3 beta feedback items shipped
- ✅ UX improved based on real user behavior
- ✅ Beta agents re-engaged with updates

---

### Week 8 (May 22-31): SoftLock MVP (Buyer Verification)

**This is the differentiator. Ship a basic version.**

**Build:**
- [ ] Plaid integration (basic fund verification)
- [ ] SoftLock invite flow (agent → buyer)
- [ ] Buyer mobile verification page (connect bank → verify balance)
- [ ] Agent dashboard view (verified status, balance range)
- [ ] Skip escrow binder for MVP (just verification, no payment yet)

**Testing:**
- [ ] Test Plaid sandbox (fake bank accounts)
- [ ] Have 2-3 beta agents invite real buyers to test flow
- [ ] Measure conversion: Invite → Verification completion rate

**Metrics:**
- SoftLock invite sent: How many agents try it?
- Verification completion rate: What % of buyers complete flow?
- Agent feedback: Does this add value?

**Deliverables:**
- ✅ SoftLock basic verification live (no escrow yet)
- ✅ 5-10 buyers complete verification
- ✅ Feedback collected on verification UX

---

## MONTH 3: LAUNCH & ACQUIRE (June 1-30)

### Week 9 (Jun 1-7): Pre-Launch Prep

**Pricing Finalized:**
- Solo Agent: $49/mo
- Team Agent: $99/mo
- Brokerage: $199/mo
- SoftLock fee: $50/verification (live in Week 10)

**Build:**
- [ ] Stripe integration (subscription billing)
- [ ] Billing dashboard (agent can see invoices, update card, cancel)
- [ ] Trial logic (30-day free trial, then auto-bill unless cancelled)
- [ ] Checkout flow (select plan → enter card → start trial)

**Marketing Prep:**
- [ ] Landing page optimization (add testimonials from beta agents)
- [ ] SEO basics (meta tags, sitemap, Google Analytics)
- [ ] LinkedIn post announcing launch (Rico's 3K network)
- [ ] Email list setup (Beehiiv or Mailchimp)
- [ ] Referral program design (agent refers agent → both get $20 credit)

**Deliverables:**
- ✅ Billing system live
- ✅ Landing page optimized for conversions
- ✅ Marketing materials ready (launch post, email templates)

---

### Week 10 (Jun 8-14): Public Launch

**Launch Day (Jun 10):**
- [ ] Publish launch post on LinkedIn (Rico's profile)
- [ ] Email beta agents: "We're live! Invite your colleagues."
- [ ] Post in real estate Facebook groups, Reddit (r/realtors)
- [ ] Email local brokerages: "New tool for your agents"

**Launch week activities:**
- [ ] Respond to all inbound inquiries within 2 hours
- [ ] Offer demo calls (30 min Zoom for interested agents)
- [ ] Monitor signups (goal: 20 signups in Week 1)
- [ ] Fix any bugs immediately

**Outreach targets:**
- LinkedIn: 50 connection requests to agents in CT/NY/NJ
- Email: 100 cold emails to agents (personalized, not spammy)
- Brokerages: 5 direct emails to brokerage owners/managers

**Deliverables:**
- ✅ Launch post published (target: 500+ views, 10+ comments)
- ✅ 20+ signups in Week 1
- ✅ 5+ demo calls booked

---

### Week 11 (Jun 15-21): First Paying Customers

**Goals:**
- Convert trial signups to paid (aim for 30% conversion)
- Get first $500+ MRR

**Activities:**
- [ ] Email trial users on Day 7: "How's KeyLedger working for you? Need help?"
- [ ] Email trial users on Day 14: "Your trial ends in 2 weeks. Upgrade now for early-bird pricing."
- [ ] Email trial users on Day 21: "Last week of trial. Lock in $39/mo forever (normally $49)."
- [ ] Personal outreach to high-activity trial users: "I see you created 5 transactions — let's get you on a paid plan."

**Retention tactics:**
- [ ] Weekly value emails: "Pro tip: Use templates to create transactions 3x faster"
- [ ] Feature announcements: "New: Mobile document camera"
- [ ] Success stories: "How Agent X closed 3 deals faster with KeyLedger"

**Deliverables:**
- ✅ First 5 paying customers
- ✅ $250-500 MRR locked in
- ✅ Churn rate < 10% (trial → paid)

---

### Week 12 (Jun 22-30): SoftLock Monetization + Scale Prep

**Build:**
- [ ] Escrow binder flow (complete SoftLock feature)
- [ ] SoftLock transaction fees enabled ($50/verification)
- [ ] Agent billing dashboard shows SoftLock fees

**Marketing push:**
- [ ] Case study: "How SoftLock helped Agent X win a bidding war"
- [ ] LinkedIn post: "Introducing SoftLock — instant buyer verification"
- [ ] Email existing users: "New feature: SoftLock is live"

**Scaling prep:**
- [ ] Document onboarding process (playbook for new agents)
- [ ] Create help center (10-15 articles on common questions)
- [ ] Set up customer support workflow (Intercom or Zendesk)
- [ ] Recruit virtual assistant for support (optional, if volume warrants)

**Metrics review:**
- Total signups: Target 50+
- Paid customers: Target 10-15
- MRR: Target $500-1,500
- SoftLock verifications: Target 10-20
- Churn: Target <15%

**Deliverables:**
- ✅ SoftLock full feature live (verification + escrow)
- ✅ 10-15 paying agents
- ✅ $500-1,500 MRR
- ✅ First SoftLock revenue ($500-1,000)

---

## 90-DAY SUCCESS CRITERIA

### By June 30, 2026:

**Product:**
✅ MVP feature-complete:
  - Agent accounts & dashboard
  - Transaction management & timeline
  - Document uploads & storage
  - Client portals
  - SoftLock buyer verification (full feature)
  - Email notifications
  - Billing & subscriptions

**Users:**
✅ 10-20 paying agents
✅ 50-100 total signups (including trials)
✅ 30-50 active transactions in system
✅ 10-20 SoftLock verifications completed

**Revenue:**
✅ $500-2,000 MRR from subscriptions
✅ $500-1,000 from SoftLock fees
✅ Total: $1,000-3,000 monthly recurring revenue

**Validation:**
✅ Product-market fit signals:
  - >30% trial-to-paid conversion
  - <15% churn in first 90 days
  - >50 NPS from paying users
  - Organic referrals (agents inviting other agents)

---

## POST-90-DAY ROADMAP (Q3 2026)

### Month 4 (July): Optimization & Content

**Focus:** Improve conversion, reduce churn, build content engine

- [ ] A/B test landing page (hero copy, CTA placement)
- [ ] Build email drip sequences (nurture trial users)
- [ ] Launch blog (SEO content: "How to close faster", "Buyer verification tips")
- [ ] Create video demos (product walkthrough, SoftLock explainer)
- [ ] Add testimonials to landing page (quotes + headshots from paying agents)
- [ ] First referral payouts (agents who referred others get $20 credits)

**Target:** 20-30 paying agents, $2,000-4,000 MRR

---

### Month 5 (August): Partnerships & Integrations

**Focus:** Expand reach via partnerships, build integrations

- [ ] Partner with 1-2 brokerages (offer brokerage plan at discount for pilot)
- [ ] Integrate with DocuSign (auto-import signed docs)
- [ ] Integrate with Zillow/Realtor.com (property data auto-fill)
- [ ] Integrate with MLS APIs (if accessible)
- [ ] Launch affiliate program (agents earn $50 per referral)

**Target:** 30-50 paying agents, $3,000-6,000 MRR

---

### Month 6 (September): AI Features & Marketplace (Phase 2 Kickoff)

**Focus:** Add intelligence layer, launch marketplace beta

- [ ] AI timeline predictions ("Deals like this typically close in 45 days")
- [ ] AI task recommendations ("Time to order inspection")
- [ ] Provider marketplace beta (inspectors, lenders, attorneys)
- [ ] Referral fee model (1-3% on marketplace transactions)
- [ ] Mobile app (React Native or Flutter)

**Target:** 50-75 paying agents, $5,000-10,000 MRR

---

## RESOURCE PLAN

### Team (Month 1-3)

**Month 1:**
- Rico: Product strategy, agent outreach, beta recruitment (10 hrs/week)
- Claw (AI): Full-stack development, DevOps, support (equivalent full-time)
- Total cost: $0 (sweat equity)

**Month 2-3:**
- Rico: Agent demos, sales calls, customer success (15 hrs/week)
- Claw: Development, support, iteration (equivalent full-time)
- Optional: Freelance designer for landing page polish ($500-1,000 one-time)
- Total cost: $500-1,000

### Infrastructure Costs (Month 1-3)

**Month 1 (Dev/Staging):**
- Railway/Render backend: $0 (free tier)
- Vercel frontend: $0 (free tier)
- Supabase Postgres: $0 (free tier, <500MB)
- Cloudflare R2 storage: $0 (free tier, <10GB)
- Plaid sandbox: $0 (free for testing)
- **Total: $0/month**

**Month 2-3 (Production):**
- Railway/Render backend: $20/month
- Vercel Pro (for custom domain): $20/month
- Supabase Pro: $25/month (better DB limits)
- Cloudflare R2: ~$5/month (50GB storage)
- Plaid production: ~$100/month (assuming 100 verifications × $1 each)
- Stripe fees: ~$50/month (on $1,500 revenue = 2.9% + $0.30 per transaction)
- Email (SendGrid): $15/month
- **Total: $235/month**

### Marketing Costs (Month 1-3)

**Month 1:**
- Domain: $12/year (keyledger.io)
- Google Workspace (email): $6/user/month ($12 for 2 users)
- LinkedIn ads: $0 (organic only for now)
- **Total: $12 + $12/month**

**Month 2-3:**
- LinkedIn ads (optional): $500/month (if needed to accelerate signups)
- Content freelancer (blog posts): $200/month (optional)
- **Total: $200-700/month**

### TOTAL BUDGET (90 Days)

**Minimum (bootstrap):**
- Infrastructure: $235/month × 2 = $470
- Domain + email: $50
- Designer (optional): $500
- **Total: ~$1,000**

**With marketing:**
- Infrastructure: $470
- Domain + email: $50
- Designer: $500
- LinkedIn ads: $500/month × 2 = $1,000
- Content: $200/month × 2 = $400
- **Total: ~$2,500**

**ROI by Day 90:**
- Revenue: $1,000-3,000/month recurring
- Payback: 1-2 months after launch
- **Profitable by Month 4-5**

---

## RISK MITIGATION

### Risk 1: Low Agent Adoption

**Mitigation:**
- Start with warm network (Rico's contacts, LinkedIn connections)
- Offer generous trial (30 days, no card required)
- Personal demo calls (not just self-serve)
- Early-bird pricing ($39/mo vs $49/mo)

### Risk 2: SoftLock Doesn't Resonate

**Mitigation:**
- Test with beta agents first (validate value prop)
- Make it optional (agents can use KeyLedger without SoftLock)
- Iterate based on feedback (maybe buyers don't want to verify? Pivot to agent-only verification)

### Risk 3: Churn (Agents Sign Up, Don't Use, Cancel)

**Mitigation:**
- Proactive onboarding (weekly check-ins first 30 days)
- Value emails ("Here's how Agent X closed 3 deals faster")
- Feature announcements (keep product fresh)
- Customer success calls (monthly touch-base with all paying agents)

### Risk 4: Technical Issues (Bugs, Downtime)

**Mitigation:**
- Comprehensive testing before beta
- Staging environment (test everything before production push)
- Monitoring (Sentry for errors, UptimeRobot for downtime alerts)
- Fast response (< 24hr bug fixes during beta)

### Risk 5: Competitive Response (Zillow, Dotloop, SkySlope Add Similar Features)

**Mitigation:**
- Move fast (ship MVP in 30 days, not 6 months)
- Build moat (SoftLock is unique, hard to replicate quickly)
- Own the relationship (direct agent billing, not via brokerage)
- Focus on underserved niche (independent agents, not big brokerages)

---

## NEXT STEPS (ACTION ITEMS FOR RICO)

### This Week (Starting Today):

**Day 1-2:**
- [ ] Review this roadmap and approve/adjust timeline
- [ ] Confirm tech stack (Next.js + Express + Postgres + Plaid + Stripe)
- [ ] Set up project repo (GitHub or GitLab)
- [ ] Claw starts backend infrastructure setup

**Day 3-4:**
- [ ] Recruit 3-5 beta agents (reach out to warm network)
- [ ] Schedule beta kickoff calls for May 1
- [ ] Write beta invitation email ("Help me build the future of real estate transactions")

**Day 5-7:**
- [ ] Set up Stripe account (business entity, bank account)
- [ ] Register keyledger.io domain (if not already done)
- [ ] Set up Google Workspace (email: rico@keyledger.io, support@keyledger.io)
- [ ] Claw continues development (database schema, API routes)

**End of Week 1:**
- ✅ Backend skeleton deployed
- ✅ Frontend skeleton deployed
- ✅ 3-5 beta agents recruited
- ✅ Infrastructure set up (domain, email, Stripe)

---

## SUMMARY

**90-Day Plan:**
- Month 1: Build MVP (agent dashboard, transactions, timeline, docs, client portals)
- Month 2: Beta test, iterate, ship SoftLock basic
- Month 3: Launch publicly, acquire 10-20 paying agents, hit $1K-3K MRR

**Success = Product-Market Fit Validated:**
- Agents paying and staying (>30% conversion, <15% churn)
- SoftLock used and valued (>40% of agents try it)
- Organic growth (agents referring other agents)
- Revenue trajectory toward $5K+ MRR by Month 6

**Then:** Raise pre-seed ($500K-1M) or continue bootstrapping to profitability.

**This is doable. Let's build.**

---

**End of 90-Day Roadmap**
