# KeyLedger Agent Onboarding Flow
## From Signup to First Transaction Closed

---

## PHASE 1: SIGNUP & ACCOUNT CREATION (5 minutes)

### Step 1: Landing Page → Signup

**Entry points:**
- keyledger.io homepage CTA: "Start Free Trial"
- Pricing page: "Start Free Trial" on any plan
- Referral link from another agent
- Email campaign link

**Signup form:**
```
[ ] First Name
[ ] Last Name
[ ] Email (becomes username)
[ ] Phone (optional, for SMS notifications)
[ ] Password (min 8 chars, 1 number, 1 special)
[ ] Brokerage Name
[ ] License Number (validates agent status)
[ ] State(s) Licensed In (multi-select)
[ ] Referral Source (dropdown: Google, LinkedIn, Agent referral, Conference, Other)

[x] I agree to Terms of Service and Privacy Policy

[Create Account]
```

**Behind the scenes:**
- Email verification sent immediately
- Account created in "trial" status (30 days)
- Agent profile stub created
- Welcome email sent with next steps

---

### Step 2: Email Verification

**Email subject:** Welcome to KeyLedger — Verify Your Email

**Email body:**
```
Hi [First Name],

Welcome to KeyLedger! You're 1 click away from transforming how you manage real estate transactions.

Click here to verify your email and activate your account:
[Verify Email Button]

Once verified, you'll be able to:
✅ Create your first transaction
✅ Invite buyers and sellers
✅ Start building your deal intelligence

Questions? Reply to this email or call us at (203) 555-LEDG.

- The KeyLedger Team

P.S. Your 30-day free trial starts today. No credit card required.
```

**On click:**
- Email marked verified
- Redirect to onboarding dashboard

---

### Step 3: Profile Setup (Optional but Recommended)

**Dashboard prompt:**
```
Let's set up your profile so clients recognize you.

[ ] Profile Photo (upload or use default)
[ ] Bio (50-200 chars) — Example: "Helping first-time buyers in Fairfield County find their dream home."
[ ] Website URL
[ ] LinkedIn Profile
[ ] Brokerage Logo (upload)

[Skip for Now]  [Save & Continue]
```

**Behind the scenes:**
- Profile data stored
- Used in client portal branding
- Appears on transaction invites

---

## PHASE 2: FIRST TRANSACTION SETUP (10 minutes)

### Step 4: Dashboard Tour (Interactive)

**Welcome modal:**
```
🎉 Your account is ready!

Let's walk through KeyLedger in 60 seconds.

[Start Tour]  [Skip Tour]
```

**Tour stops (if they click "Start Tour"):**
1. **Dashboard overview** — "This is your command center. All active transactions in one place."
2. **Create Transaction button** — "Click here to start your first deal."
3. **Buyers tab** — "Manage verified buyers and track their activity."
4. **Analytics panel** — "After a few deals, you'll see performance insights here."
5. **Settings** — "Customize notifications, integrations, and team access."

**Tour completion:**
```
You're all set! Ready to create your first transaction?

[Create My First Deal]
```

---

### Step 5: Create First Transaction

**Modal: New Transaction**

**Step 5a: Property Details**
```
What property are you working on?

[ ] Property Address (autocomplete via Google Places API)
[ ] MLS # (optional)
[ ] List Price
[ ] Property Type (dropdown: Single Family, Condo, Multi-Family, Land, Commercial)
[ ] Transaction Type: 
    ( ) I'm representing the BUYER
    ( ) I'm representing the SELLER
    ( ) I'm representing BOTH (dual agency)

[Next]
```

**Step 5b: Key Dates**
```
When are the critical milestones?

[ ] Listing Date (if seller side)
[ ] Expected Offer Date (estimated)
[ ] Inspection Deadline (estimated)
[ ] Financing Contingency Deadline (estimated)
[ ] Expected Closing Date

💡 Tip: These are estimates. You can adjust them as the deal progresses.

[Back]  [Next]
```

**Step 5c: Add Participants**
```
Who's involved in this transaction?

BUYER SIDE:
[ ] Buyer Name
[ ] Buyer Email (will receive client portal invite)
[ ] Buyer Phone (optional)
[ ] Buyer's Lender (optional — can add later)
[ ] Buyer's Attorney (optional)

SELLER SIDE:
[ ] Seller Name
[ ] Seller Email (client portal invite)
[ ] Listing Agent (if you're buyer's agent — auto-fills if you're listing agent)

OTHER:
[ ] Inspector (optional)
[ ] Appraiser (optional)
[ ] Title Company (optional)

💡 Tip: You can add/remove participants anytime.

[Back]  [Create Transaction]
```

**On "Create Transaction":**
- Transaction created with status "Active"
- Timeline initialized with "Listing Created" or "Buyer Consultation" event (depending on role)
- Client portal invites sent to buyer/seller emails
- Agent redirected to transaction dashboard

---

### Step 6: Transaction Dashboard (First Look)

**Transaction view:**
```
📍 123 Maple Street, Fairfield, CT 06824
🏷️ $875,000 | Single Family | Representing: Buyer

[Timeline] [Documents] [Participants] [Messages] [Settings]

═══════════════════════════════════════════════════
TIMELINE (so far)

🟢 Mar 24, 2026 — Buyer Consultation
    You met with John & Sarah Smith to discuss their home search.
    
    [Add Note] [Upload Document] [Log Event]

═══════════════════════════════════════════════════
NEXT STEPS

⏰ Upcoming: Property Showing (Mar 26, 2026 at 2:00 PM)
📄 Pending: Proof of funds needed from buyer
✅ Completed: Pre-approval letter received

[+ Add Task] [+ Schedule Showing] [+ Upload Document]

═══════════════════════════════════════════════════
PARTICIPANTS

👤 John Smith (Buyer) — Client Portal: Active
👤 Sarah Smith (Buyer) — Client Portal: Active
👤 [+ Add Lender] [+ Add Attorney] [+ Add Inspector]

═══════════════════════════════════════════════════
```

---

## PHASE 3: FIRST BUYER VERIFICATION (Optional, 15 minutes)

### Step 7: Invite Buyer to Verify Funds via SoftLock

**From transaction dashboard:**
```
[SoftLock] Buyer Verification

Status: Not Verified

Want to strengthen your buyer's offer?

Invite John & Sarah Smith to verify their funds via SoftLock.
✅ Private verification (you never see account numbers)
✅ Verified badge on offers
✅ Small escrow binder ($500-2,000) shows commitment

[Send SoftLock Invite]
```

**On click:**
- SMS + email sent to buyer(s) with SoftLock link

**Buyer receives:**
```
Subject: Verify Your Funds for 123 Maple Street

Hi John,

Your agent [Agent Name] has invited you to verify your funds for the property at 123 Maple Street.

This takes 2 minutes and strengthens your offer:
✅ Sellers see you're credible
✅ Your agent sees live fund status (not stale POF letters)
✅ Private & secure (bank-level encryption)

[Verify Now]

Questions? Call your agent or contact KeyLedger support.
```

---

### Step 8: Buyer Completes SoftLock Flow (Buyer's Mobile Experience)

**Buyer clicks "Verify Now" → Mobile web flow:**

**Screen 1: Welcome**
```
🔐 SoftLock Buyer Verification

You're verifying funds for:
📍 123 Maple Street, Fairfield, CT 06824

This process:
✅ Takes 2 minutes
✅ Is 100% private (your agent never sees account numbers)
✅ Uses bank-level security (Plaid)

[Get Started]
```

**Screen 2: Connect Bank (Plaid)**
```
Connect Your Bank Account

We'll verify you have sufficient funds without sharing sensitive details.

[Search for your bank]

🔒 Powered by Plaid — trusted by Venmo, Robinhood, and 12,000+ apps
```

**Buyer selects bank → Plaid OAuth login → Returns to KeyLedger**

**Screen 3: Verification Result**
```
✅ Funds Verified!

Available: $XXX,XXX
Required for this property: $XXX,XXX (20% down + closing costs estimate)

Status: ✅ Sufficient Funds

Next: Deposit a small escrow binder to activate your Verified Buyer badge.

[Continue]
```

**Screen 4: Escrow Binder Deposit**
```
Deposit Escrow Binder

To activate your Verified Buyer status, deposit a small binder:

Amount: $_____ (you choose: $500, $1,000, or $2,000)

This shows commitment and strengthens your offer.
✅ Fully refundable if deal doesn't close (minus $50 processing fee)
✅ Applied toward closing costs if you close
✅ Held in escrow (not released to seller until contract)

[Pay with Bank Transfer] [Pay with Card]
```

**Payment processed → Screen 5: Confirmed**
```
🎉 You're a Verified Buyer!

✅ Funds verified
✅ $1,000 binder deposited
✅ Badge active on all your offers

Your agent can now submit offers with your Verified Buyer status.

[View Your Dashboard]
```

---

### Step 9: Agent Sees Updated Status

**Back on agent's transaction dashboard:**
```
[SoftLock] Buyer Verification

Status: ✅ VERIFIED

John & Sarah Smith
✅ Funds verified: $XXX,XXX available
✅ Escrow binder: $1,000 deposited
✅ Badge active

This buyer is ready to submit competitive offers.

[View Verification Details]
```

---

## PHASE 4: FIRST DOCUMENT UPLOAD (5 minutes)

### Step 10: Upload Key Documents

**From transaction dashboard → Documents tab:**
```
📄 DOCUMENTS

No documents yet. Upload your first contract, disclosure, or report.

[+ Upload Document]

💡 Recommended uploads:
- Pre-approval letter
- Proof of funds (if not using SoftLock)
- Purchase agreement
- Inspection report
- Appraisal
- Final HUD/closing statement
```

**Upload modal:**
```
Upload Document

[ ] Select File (drag & drop or click)

Document Type: (dropdown)
- Contract/Purchase Agreement
- Addendum
- Disclosure
- Inspection Report
- Appraisal
- Loan Documents
- Closing Statement
- Other

Attach to Event: (dropdown — shows timeline events)
- Buyer Consultation (Mar 24)
- Property Showing (Mar 26)
- Offer Submitted (not yet created)
- [+ Create New Event]

Visible to: 
[x] Buyer
[x] Seller
[ ] Lender
[ ] Attorney

[Cancel] [Upload]
```

**On upload:**
- Document stored in S3 or similar
- Linked to timeline event
- Visible in client portals per permissions

---

## PHASE 5: LOG FIRST MAJOR EVENT (5 minutes)

### Step 11: Log "Offer Submitted"

**From timeline tab:**
```
[+ Log Event]
```

**Event modal:**
```
Log New Event

Event Type: (dropdown)
- Showing Scheduled
- Offer Submitted ⭐
- Offer Accepted
- Inspection Scheduled
- Inspection Completed
- Appraisal Ordered
- Financing Approved
- Final Walkthrough
- Closing Scheduled
- Deal Closed ⭐
- Deal Cancelled

Event Date: [Mar 27, 2026]
Event Time: [10:30 AM]

Details:
[ ] Offer amount: $850,000
[ ] Earnest money: $10,000
[ ] Financing contingency: 21 days
[ ] Inspection contingency: 14 days
[ ] Proposed closing date: Apr 30, 2026

Notes:
[Text area — optional]

Notify:
[x] Buyer
[x] Seller
[ ] Lender
[ ] Attorney

[Cancel] [Log Event]
```

**On "Log Event":**
- Timeline updated
- Notifications sent to selected participants
- Email + SMS (if enabled): "Offer submitted for 123 Maple Street — view details in your KeyLedger portal"

---

## PHASE 6: FIRST WEEK ENGAGEMENT (Automated Email Drip)

### Email Sequence (Background, Automated)

**Day 1 (Signup Day):**
✅ Welcome email + verification link (already sent)

**Day 2:**
```
Subject: Your First Transaction is Live 🎉

Hi [First Name],

Great start! You created your first transaction in KeyLedger.

Here's what to do next:
1️⃣ Invite your buyer/seller to their client portal (they'll love the transparency)
2️⃣ Upload key documents (pre-approval, contracts, inspection reports)
3️⃣ Log major events (showings, offers, inspections) to build your timeline

Pro tip: The more you log now, the smarter KeyLedger gets at predicting deal timelines.

[Go to Dashboard]

Questions? Book a 15-min onboarding call: [Calendly link]
```

**Day 4:**
```
Subject: Are You Using SoftLock Yet?

Hi [First Name],

Quick question: Have you tried SoftLock for buyer verification?

Here's why top agents love it:
✅ Buyers verify funds in 2 minutes (no more chasing POF letters)
✅ Verified badge strengthens offers in competitive markets
✅ You see live fund status without exposing buyer's bank details

It's included in your plan — no extra cost.

[Try SoftLock Now]

- KeyLedger Team
```

**Day 7:**
```
Subject: You're Almost Done With Your Free Trial Week 1

Hi [First Name],

One week into KeyLedger — how's it going?

We'd love your feedback:
📊 What's working well?
🛠️ What could be better?
💡 What features would help you close deals faster?

[Share Feedback — 2 min survey]

Also: Your trial has 23 days left. Want to lock in early-bird pricing? 

First 100 agents get 20% off for life:
Solo Plan: $49/mo → $39/mo
Team Plan: $99/mo → $79/mo

[Claim Early-Bird Pricing]

- KeyLedger Team
```

**Day 14:**
```
Subject: KeyLedger Pro Tip: Invite Your Team

Hi [First Name],

Working with an assistant or transaction coordinator?

Add them to your KeyLedger account:
👉 Settings → Team Members → [+ Invite Team Member]

They'll get access to:
✅ All your active transactions
✅ Document uploads
✅ Timeline updates
✅ Client messages

No extra cost on your current plan (up to 5 seats on Team plan).

[Invite Your Team]

- KeyLedger Team
```

**Day 21:**
```
Subject: Your Trial Ends in 9 Days — What's Next?

Hi [First Name],

Your KeyLedger trial ends on [Date]. Here's what you've accomplished:

✅ [X] transactions created
✅ [X] documents uploaded
✅ [X] timeline events logged
✅ [X] clients invited

Ready to keep going?

Choose your plan:
- Solo Agent: $49/mo (or $39/mo with early-bird discount)
- Team Agent: $99/mo (or $79/mo with early-bird discount)

[Upgrade Now] [Schedule a Call]

Not ready yet? No problem — your data will be saved for 90 days.

- KeyLedger Team
```

**Day 30 (Trial End):**
```
Subject: Your KeyLedger Trial Has Ended

Hi [First Name],

Your 30-day trial ended today.

To continue using KeyLedger, choose a plan:
[View Pricing]

Your data (transactions, documents, timelines) will be saved for 90 days.

Questions? We're here to help:
📞 (203) 555-LEDG
📧 support@keyledger.io

Thanks for trying KeyLedger!

- KeyLedger Team
```

---

## PHASE 7: CONVERSION TO PAID (If They Upgrade)

### Step 12: Choose Plan & Enter Payment

**Pricing page → Select plan → Checkout:**

```
You selected: Solo Agent Plan
$49/month (or $470/year — save 20%)

Payment Information:
[ ] Card Number
[ ] Expiration
[ ] CVV
[ ] ZIP Code

Billing Cycle:
( ) Monthly ($49/mo)
( ) Annual ($470/year — 2 months free)

[x] I agree to Terms of Service

[Start Subscription]

🔒 Secure payment via Stripe
```

**On "Start Subscription":**
- Payment processed
- Account upgraded from "trial" to "paid"
- Access to all features (no restrictions)
- Receipt emailed

---

## PHASE 8: ONGOING ENGAGEMENT (Post-Conversion)

### Monthly Check-Ins (Automated)

**Monthly email (every 30 days):**
```
Subject: Your KeyLedger Monthly Summary

Hi [First Name],

Here's your activity for [Month]:

📊 Deals This Month:
- [X] new transactions started
- [X] transactions closed
- [X] total active deals

📄 Documents:
- [X] documents uploaded
- [X] GB storage used

⏱️ Average Time to Close:
- Your average: [X] days
- Market average: [Y] days
- 🎉 You're [faster/slower] than average!

💡 Tip: Invite more buyers to use SoftLock verification to speed up closings.

[View Full Analytics]

- KeyLedger Team
```

---

## SUPPORT TOUCHPOINTS

### When to Reach Out Proactively

**Trigger 1: Agent creates account but doesn't create first transaction (Day 3)**
- Email: "Need help getting started? Book a quick call."

**Trigger 2: Agent creates transaction but doesn't invite client (Day 5)**
- Email: "Your buyer will love the client portal — here's how to send an invite."

**Trigger 3: Agent uploads 0 documents after 7 days**
- Email: "Pro tip: Upload documents as you go to keep everything organized."

**Trigger 4: Agent has 5+ active transactions (power user signal)**
- Personal outreach: "Looks like you're crushing it! Want to upgrade to Team plan and add your TC?"

**Trigger 5: Trial ends, no upgrade**
- Email: "We'd love to keep working with you. What's holding you back?" (feedback survey)

---

## SUCCESS METRICS (KPIs to Track)

**Activation Rate:**
- % of signups who create first transaction within 7 days
- Target: >60%

**Time to First Value:**
- Days from signup to first transaction created
- Target: <3 days

**Trial Conversion Rate:**
- % of trials that convert to paid within 30 days
- Target: >20%

**Feature Adoption:**
- % of agents using SoftLock: Target >40%
- % uploading documents: Target >70%
- % inviting clients to portal: Target >80%

**Retention Rate:**
- % of paid agents still active after 6 months
- Target: >85%

---

## ONBOARDING COMPLETION CHECKLIST

**Agent has successfully onboarded when:**
✅ Account created & email verified  
✅ First transaction created  
✅ At least 1 client invited to portal  
✅ At least 1 document uploaded  
✅ At least 1 timeline event logged  
✅ Trial converted to paid (or scheduled conversion call)  

**Agents who complete all 6 steps have 3x higher retention.**

---

**End of Agent Onboarding Flow**
