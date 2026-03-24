# RangeKeeper — Claude Code Research Mission

## Context
You are researching the technical integration landscape for **RangeKeeper**, an AI-powered executive function assistant for ASD/ADHD college students. The first target user is a freshman at the **University of Alabama, Tuscaloosa**. The goal is to understand exactly what data we can access, how to access it, what limitations exist, and what the fastest path to a working personal tool looks like.

The student's tech environment:
- **LMS:** Blackboard Ultra (ualearn.blackboard.com) — UA migrated all courses to Ultra as of Spring 2026
- **Email/Calendar:** Microsoft 365 (Outlook) — @crimson.ua.edu accounts via Microsoft Exchange
- **Portal:** myBama (mybama.ua.edu) — centralized student portal built on Ellucian Banner
- **Degree Tracking:** DegreeWorks (accessed through myBama)
- **Cloud Storage:** Box (unlimited) + OneDrive (via M365)
- **Office Suite:** Microsoft Office 365 (free for UA students)

---

## Research Task 1: Blackboard Ultra REST API

Investigate the Blackboard Learn/Ultra REST API thoroughly. We need to understand what's possible for a STUDENT-facing integration (not an institutional admin integration).

**Research and document:**

1. **API Documentation** — Find and review the official Blackboard REST API docs at developer.anthology.com (formerly developer.blackboard.com). Document the current base URL structure, API versioning, and authentication requirements.

2. **Authentication Methods:**
   - What OAuth 2.0 flows are supported? (Authorization Code, Client Credentials, etc.)
   - Can a third-party app register as an OAuth client and request student consent to access THEIR OWN data? Or does this require institutional admin approval / LTI registration?
   - Is there a "three-legged OAuth" flow where the student authorizes access to their own courses, assignments, and grades?
   - What scopes/permissions are available for student-level access?
   - Are there any public/open API endpoints that don't require institutional registration?

3. **Available Endpoints (Student Perspective):**
   - GET courses — Can we list all courses a student is enrolled in?
   - GET assignments/contents — Can we pull assignment titles, descriptions, due dates, point values, rubrics?
   - GET grades — Can we access the student's grade book entries?
   - GET announcements — Can we pull course announcements?
   - GET calendar — Is there a calendar endpoint showing due dates and events across courses?
   - GET submissions — Can we see submission status (submitted / not submitted / graded)?
   - Any notification or webhook endpoints for real-time updates when new assignments are posted?

4. **Institutional Gatekeeping:**
   - Does Blackboard require the university (UA) to register/approve third-party API applications?
   - Is there a Blackboard developer program or app marketplace that allows external apps?
   - What is the typical process for getting API access — developer account registration → app creation → institutional approval?
   - Are there rate limits? What are they?

5. **LTI (Learning Tools Interoperability) as Alternative:**
   - What LTI version does Blackboard Ultra support? (LTI 1.1, 1.3, Advantage?)
   - Could RangeKeeper register as an LTI tool to get assignment/grade data?
   - What's the difference in data access between REST API and LTI approaches?
   - LTI typically requires institutional approval — document this process.

6. **Blackboard Ultra Mobile App API:**
   - Does the Blackboard mobile app use a different API than the web version?
   - Has anyone reverse-engineered or documented the mobile API endpoints?
   - Could we potentially use the same endpoints the mobile app uses?

7. **Alternative Access Methods (if official API is gated):**
   - Browser automation / scraping approach using Playwright or Puppeteer with student credentials
   - Blackboard's iCal/ICS feed — many Blackboard instances export a calendar feed of due dates. Does UA's instance support this? URL pattern?
   - Email forwarding — Blackboard sends notification emails for new assignments, grade postings. Can we parse these from the student's Outlook inbox?
   - RSS feeds — some Blackboard instances support RSS for announcements/updates
   - Manual export — Blackboard allows students to download certain data. What formats?

**Deliverable:** A document covering all findings with specific endpoint examples, authentication flow diagrams (text-based), and a clear recommendation on the most viable integration path — ranked from "ideal but may need institutional approval" to "works today without anyone's permission."

---

## Research Task 2: Microsoft Graph API (M365 Integration)

UA students use Microsoft 365. The Microsoft Graph API is our primary integration point for email, calendar, and files.

**Research and document:**

1. **Authentication for Student M365 Accounts:**
   - Microsoft Graph uses Azure AD (Entra ID) for OAuth. UA students authenticate via their @crimson.ua.edu accounts, which are managed by UA's Azure AD tenant.
   - Can a third-party app (registered in a DIFFERENT Azure AD tenant) request consent from a UA student to access their data? This is called "multi-tenant app registration."
   - What permissions would we need, and which require ADMIN consent from UA's IT vs. USER consent from the student?
   - Document the difference between "delegated permissions" (user consents) and "application permissions" (admin consents) for each API we need.

2. **Specific APIs We Need:**

   a. **Outlook Mail (Messages API):**
      - `GET /me/messages` — read student's emails
      - Can we filter for Blackboard notification emails? What does the sender address look like?
      - Permission needed: `Mail.Read` (delegated) — does this require admin consent at UA?
      - Can we create mail rules/filters programmatically?

   b. **Outlook Calendar:**
      - `GET /me/calendar/events` — read student's calendar events
      - `POST /me/calendar/events` — CREATE events (study blocks, assignment reminders)
      - `GET /me/calendarView` — get events in a time range
      - Permissions: `Calendars.Read`, `Calendars.ReadWrite` (delegated)
      - Can we access the student's class schedule if it syncs from Banner to their calendar?

   c. **Microsoft To Do (Tasks API):**
      - `GET /me/todo/lists` — access task lists
      - `POST /me/todo/lists/{id}/tasks` — create tasks
      - Permissions: `Tasks.Read`, `Tasks.ReadWrite` (delegated)
      - This could be a lightweight way to push daily game plans without building our own UI

   d. **OneDrive (Files API):**
      - `GET /me/drive/root/children` — browse student's files
      - Lower priority but useful for detecting if papers/assignments are in progress
      - Permission: `Files.Read` (delegated)

   e. **Notifications / Webhooks (Subscriptions API):**
      - Can we subscribe to changes in the student's mailbox or calendar?
      - `POST /subscriptions` — webhook for new emails, calendar changes
      - This enables real-time reaction to new assignment notifications

3. **Tenant-Specific Restrictions:**
   - Many universities restrict third-party app access to their Azure AD tenant.
   - Research: Is there a way to check if UA's tenant allows "user consent for apps"?
   - What happens if the student tries to authorize our app and UA has blocked external apps?
   - Workaround: Could the student create an "app password" or use IMAP/SMTP instead?

4. **Fallback: IMAP/SMTP Access to Outlook:**
   - If Graph API is tenant-locked, can we access student email via IMAP?
   - Does UA enable IMAP access for student M365 accounts?
   - Document: server addresses, ports, authentication method (basic auth vs. OAuth2 for IMAP)
   - Microsoft has been deprecating basic auth — is OAuth2 IMAP available?

5. **Fallback: Calendar Sync via ICS/CalDAV:**
   - Can the student export/subscribe to their Outlook calendar as an ICS feed?
   - Is CalDAV enabled for UA student accounts?
   - This would let us read their schedule without Graph API access.

**Deliverable:** Permission matrix showing each API endpoint, the permission required, whether it needs user consent or admin consent, and our assessment of whether it will work at UA. Include fallback strategies for each blocked path.

---

## Research Task 3: SMS / Push Notification Delivery

We need to send the student daily game plans and nudges. Research the delivery options.

**Research and document:**

1. **Twilio SMS:**
   - Current pricing for sending SMS in the US
   - A2P 10DLC registration requirements (mandatory for business SMS in 2025+)
   - Can we start with a trial/development account?
   - Estimated cost for 5-10 SMS/day to one user

2. **WhatsApp via Twilio:**
   - Alternative to SMS — many college students prefer WhatsApp
   - Twilio WhatsApp Business API requirements and pricing
   - Template message vs. session message rules

3. **Microsoft Teams / Outlook Notifications:**
   - Since the student is on M365, can we push notifications through Teams or Outlook?
   - Graph API: can we send emails to the student programmatically (from our service)?
   - Can we create Outlook reminders/alerts programmatically?

4. **Push Notifications (PWA or Mobile App):**
   - Web push notification capabilities for a PWA
   - Firebase Cloud Messaging (FCM) for Android, APNs for iOS
   - What's the minimum viable push notification setup?

5. **Discord / Telegram Bot:**
   - Many college students use Discord daily — this could be a low-friction delivery channel
   - Telegram bot as alternative
   - Compare engagement rates: SMS vs. push vs. chat app

**Deliverable:** Ranked recommendation for notification delivery — what's fastest to implement, what has highest engagement, what scales best for the product.

---

## Research Task 4: Competitive Landscape

Research existing tools that attempt to solve executive function / academic organization for neurodivergent students.

**Research and document:**

1. **Direct Competitors:**
   - Tiimo — daily planner for ADHD/autism
   - Goblin Tools — AI task breakdown tool
   - Routinery — routine/habit app
   - Structured — visual day planner
   - Shovel — study planner with time estimation
   - MyStudyLife — academic planner
   - Any others you find

2. **For each competitor, document:**
   - What it does (core features)
   - Pricing
   - LMS integration (does it connect to Blackboard/Canvas, or manual entry only?)
   - AI capabilities (any?)
   - ASD/ADHD specific features (or just generic planning?)
   - App store ratings and reviews — what do users love and hate?
   - Number of users/downloads if available

3. **University Disability Services Tools:**
   - What tools do university disability offices recommend or provide?
   - Are there institutional licenses for assistive technology?
   - What does UA's Office of Disability Services specifically offer?

4. **ADHD Coaching Platforms:**
   - Digital coaching platforms like Shimmer, ADDA, Focusmate
   - Pricing, approach, AI integration
   - How they differ from what we're building

5. **Gap Analysis:**
   - What does NO competitor do that RangeKeeper will?
   - Specifically: who integrates with LMS + calendar + email AND provides AI-powered executive function support?
   - Where is the clear whitespace?

**Deliverable:** Competitive matrix and clear articulation of RangeKeeper's differentiation.

---

## Research Task 5: Blackboard Ultra Scraping / Automation Fallback

If official API access requires institutional approval (likely), we need a "works today" approach for one student.

**Research and document:**

1. **Blackboard Ultra Page Structure:**
   - Navigate to ualearn.blackboard.com (or any public Blackboard Ultra demo/documentation)
   - Document the URL patterns for: course list, assignment list, individual assignment, grade book, calendar view
   - What does the page structure look like? Is it a SPA (React/Angular)? Server-rendered?
   - Are there XHR/fetch API calls in the browser that we could intercept?

2. **Browser Automation Approach:**
   - Playwright or Puppeteer script that: logs in with student credentials → navigates to each course → extracts assignments with due dates → exports as structured JSON
   - What auth flow does Blackboard Ultra use? (SAML/CAS SSO through UA's identity provider?)
   - MFA considerations — does UA require MFA for Blackboard login?
   - Session persistence — can we store a session cookie and avoid re-login each time?

3. **Blackboard Mobile App Traffic:**
   - The Blackboard Student mobile app communicates with APIs
   - Research: has anyone documented these endpoints? (check GitHub, security research papers, Blackboard community forums)
   - mitmproxy or Charles Proxy approach to capture the mobile API traffic

4. **ICS Calendar Feed:**
   - Blackboard Ultra may publish an ICS calendar feed of all due dates
   - Research how to find/enable this in Blackboard Ultra
   - URL pattern if available
   - This alone could give us 80% of what we need for assignment tracking

5. **Email Parsing:**
   - Blackboard sends email notifications for: new assignments posted, grades posted, announcements, discussion posts
   - Document the sender email address format
   - Document the email body structure — can we reliably parse assignment names, due dates, course names from these emails?
   - This combined with Outlook access could be a powerful low-friction data source

**Deliverable:** A "Day 1 Integration Plan" that works with just the student's login credentials, no institutional approval needed. Ranked by reliability and maintenance burden.

---

## Research Task 6: Data Privacy and FERPA Considerations

This tool accesses student educational records. We need to understand the legal landscape.

**Research and document:**

1. **FERPA Basics:**
   - What is FERPA and how does it apply to third-party tools accessing student data?
   - Key distinction: student SELF-authorizing access to their OWN data vs. institutional data sharing
   - If the student voluntarily gives us access to their own Blackboard/email, is that a FERPA concern?

2. **Student Consent Model:**
   - Can an adult student (18+) consent to share their own educational data with a third-party app?
   - What documentation/consent flow should we implement?
   - Does this differ from the university sharing data with us?

3. **University Policies:**
   - Research UA's acceptable use policy for student accounts
   - Are there restrictions on third-party apps accessing student M365 accounts?
   - Terms of service for Blackboard — does it prohibit scraping or automated access?

4. **Best Practices for EdTech Startups:**
   - What do successful edtech companies do for data privacy compliance?
   - COPPA considerations (not applicable for college but worth noting for future expansion to high school)
   - State privacy laws that might apply (Alabama, or user's home state)

**Deliverable:** Summary of legal/compliance landscape with clear recommendations for our consent flow and data handling practices.

---

## Output Format

Create a single comprehensive research report as a markdown file at:
`/home/ubuntu/.openclaw/workspace/rangekeeper/docs/RESEARCH_FINDINGS.md`

Structure it with the 6 task sections above. For each section:
- **Findings** — what you discovered
- **Evidence** — links, documentation references, specific API endpoints
- **Recommendation** — your assessment of the best path forward
- **Risk Level** — Low / Medium / High for each integration approach
- **Timeline Estimate** — how long to implement each approach

End with an **EXECUTIVE SUMMARY** section that answers:
1. What is the fastest path to a working tool for ONE student at UA?
2. What requires institutional cooperation and what doesn't?
3. What's the recommended Phase 1 integration stack?
4. What are the top 3 risks and mitigations?

Be thorough. Be specific. Cite actual API endpoints, documentation URLs, and code examples where relevant. Do not guess — if you can't find definitive information on something, say so and suggest how to verify it.
