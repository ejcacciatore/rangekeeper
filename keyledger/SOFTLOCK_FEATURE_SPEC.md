# SoftLock Feature Specification
## Buyer Verification & Escrow Binder System

---

## OVERVIEW

**What is SoftLock?**  
A mobile-first buyer verification system that allows real estate purchasers to prove financial credibility instantly through:
1. Secure bank account verification (via Plaid)
2. Optional escrow binder deposit ($500-$2,000)
3. Verified Buyer badge that strengthens offers

**Why it exists:**  
Traditional proof-of-funds letters are static, stale, and easy to fake. Agents waste time chasing updated POF. Sellers don't trust "pre-approved" without real validation. SoftLock solves this with live verification + skin-in-the-game deposits.

**Core value propositions:**

**For Buyers:**
- Stand out in competitive markets with Verified Buyer badge
- Privacy-first (agent never sees account numbers or transaction history)
- Reusable across multiple properties
- Fast (2-3 minutes to complete)

**For Agents:**
- See live fund status, not stale letters
- Verified badge strengthens client offers
- No manual POF chasing
- Transaction fees ($50/verification) create revenue stream

**For Sellers/Listing Agents:**
- Trust signal: This buyer can close
- Escrow binder shows commitment
- Fewer wasted showings with unqualified buyers

---

## USER FLOWS

### Flow 1: Agent Invites Buyer to Verify

**Trigger:** Agent creates transaction in KeyLedger with buyer contact info

**Agent action:**
1. Opens transaction dashboard
2. Clicks **[SoftLock] Buyer Verification** panel
3. Clicks **[Send SoftLock Invite]**
4. System sends SMS + email to buyer with verification link

**Behind the scenes:**
- Unique verification token generated for this buyer + property combo
- Link format: `https://keyledger.io/verify/{token}`
- SMS: "Verify your funds for 123 Maple St. Tap here: [link]"
- Email: Full explanation + CTA button

**Agent dashboard shows:**
```
[SoftLock] Buyer Verification

Status: Invite Sent (Mar 24, 2026 at 10:45 AM)

John & Sarah Smith
📧 Invite sent to: john.smith@email.com, sarah.smith@email.com
📱 SMS sent to: (203) 555-1234

Waiting for buyer to complete verification...

[Resend Invite] [Cancel Verification]
```

---

### Flow 2: Buyer Receives Invite & Opens Link

**Buyer receives SMS:**
```
SoftLock Buyer Verification

Your agent invited you to verify funds for:
📍 123 Maple Street, Fairfield, CT 06824

This strengthens your offer and takes 2 minutes.

Tap to verify: https://keyledger.io/verify/abc123xyz

Reply STOP to opt out.
```

**Buyer receives email:**
```
Subject: Verify Your Funds for 123 Maple Street

Hi John,

Your agent [Agent Name] from [Brokerage] has invited you to verify your purchasing power for the property at:

📍 123 Maple Street, Fairfield, CT 06824
🏷️ Listed at $875,000

━━━━━━━━━━━━━━━━━━━━━━━━━━

Why Verify?

✅ Strengthen your offer with a Verified Buyer badge
✅ Sellers see you're credible and ready to close
✅ Your agent sees live fund status (no more chasing POF letters)
✅ 100% private — your agent never sees account numbers

This takes 2 minutes and uses bank-level security.

[Verify Now]

━━━━━━━━━━━━━━━━━━━━━━━━━━

How It Works:

1. Connect your bank account (via Plaid — trusted by Venmo, Robinhood, etc.)
2. We verify you have sufficient funds
3. Optionally deposit a small escrow binder ($500-$2,000) to activate your Verified Buyer badge
4. Done! Your badge is active on all your offers.

Questions? Call your agent or contact KeyLedger support:
📞 (203) 555-LEDG
📧 support@keyledger.io

- The KeyLedger Team

🔒 Your data is encrypted and never shared without your consent.
```

---

### Flow 3: Buyer Completes Verification (Mobile Web)

**Screen 1: Welcome / Context**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 SoftLock Buyer Verification
━━━━━━━━━━━━━━━━━━━━━━━━━━

You're verifying funds for:

📍 123 Maple Street
    Fairfield, CT 06824
🏷️ $875,000

━━━━━━━━━━━━━━━━━━━━━━━━━━

This process:
✅ Takes 2-3 minutes
✅ Is 100% private (your agent never sees account details)
✅ Uses bank-level encryption (Plaid)
✅ Gives you a Verified Buyer badge

[Get Started]

━━━━━━━━━━━━━━━━━━━━━━━━━━
Powered by KeyLedger | Privacy Policy
```

**On tap "Get Started" → Screen 2**

---

**Screen 2: Property & Buyer Confirmation**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━
Confirm Your Details
━━━━━━━━━━━━━━━━━━━━━━━━━━

Property:
📍 123 Maple Street, Fairfield, CT 06824
🏷️ $875,000

Buyer(s):
👤 John Smith
👤 Sarah Smith

Agent:
👔 Rico Cacciatore, ABC Realty

━━━━━━━━━━━━━━━━━━━━━━━━━━

Is this correct?

[Yes, Continue] [No, Contact My Agent]

━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**On tap "Yes, Continue" → Screen 3**

---

**Screen 3: Connect Bank Account (Plaid Integration)**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━
Connect Your Bank
━━━━━━━━━━━━━━━━━━━━━━━━━━

We'll verify you have sufficient funds without sharing sensitive details.

Your agent will see:
✅ Verification status (Verified / Not Verified)
✅ Available amount range (e.g., "$200K-$500K")

Your agent will NOT see:
❌ Account numbers
❌ Routing numbers
❌ Transaction history
❌ Other account balances

━━━━━━━━━━━━━━━━━━━━━━━━━━

[Search for Your Bank]

🔒 Powered by Plaid
Trusted by Venmo, Coinbase, Robinhood, and 12,000+ apps.

[How does Plaid work?]

━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**On tap "Search for Your Bank":**
- Plaid Link modal opens
- Buyer searches/selects bank (e.g., "Chase", "Bank of America")
- Plaid OAuth login flow
- Buyer authenticates with bank credentials
- Plaid returns account balance data to KeyLedger API

**Behind the scenes:**
- Plaid API called: `/link/token/create` → returns `link_token`
- Frontend opens Plaid Link widget
- Buyer completes bank login
- Plaid webhook sends `access_token` + account data
- KeyLedger backend stores:
  - `buyer_id`
  - `plaid_access_token` (encrypted)
  - `account_id` (hashed)
  - `available_balance` (encrypted)
  - `verification_timestamp`

**On success → Screen 4**

---

**Screen 4: Verification Result**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Funds Verified!
━━━━━━━━━━━━━━━━━━━━━━━━━━

Available in Connected Account:
💰 $425,000

Required for This Property:
📍 123 Maple Street ($875,000)
  • 20% down payment: $175,000
  • Est. closing costs: $26,250
  • Total needed: ~$201,250

━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: ✅ SUFFICIENT FUNDS

Your agent will see:
"Verified: $400K-$500K available"

━━━━━━━━━━━━━━━━━━━━━━━━━━

Next Step: Activate Your Verified Buyer Badge

Deposit a small escrow binder to show commitment and strengthen your offer.

[Continue to Binder Deposit]

[Skip for Now — Verification Only]

━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Two paths:**
- **Path A:** Buyer clicks "Continue to Binder Deposit" → Screen 5
- **Path B:** Buyer clicks "Skip for Now" → Verification saved, no badge, flow ends

**If Path B (Skip):**
- Buyer marked as "Verified (No Binder)"
- Agent sees: "Funds verified: $400K-$500K | No escrow binder deposited"
- Badge NOT active (requires binder)

**If Path A (Continue) → Screen 5**

---

**Screen 5: Escrow Binder Deposit**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━
Deposit Escrow Binder
━━━━━━━━━━━━━━━━━━━━━━━━━━

Show your commitment with a small refundable deposit.

Choose Your Binder Amount:
( ) $500
( ) $1,000 ⭐ Recommended
( ) $2,000
( ) Custom: $_____

━━━━━━━━━━━━━━━━━━━━━━━━━━

What Happens to This Money?

✅ Held in escrow (not released to seller until contract)
✅ Fully refundable if deal doesn't close (minus $50 processing fee)
✅ Applied toward your closing costs if you close
✅ Activates your Verified Buyer badge

━━━━━━━━━━━━━━━━━━━━━━━━━━

Payment Method:
( ) Bank Transfer (ACH) — Free, 1-2 days
( ) Debit/Credit Card — Instant, 2.9% fee

[Review & Pay]

[Cancel — Verification Only]

━━━━━━━━━━━━━━━━━━━━━━━━━━
Terms: Escrow held by [KeyLedger Escrow Partner].
Refund policy applies. See full terms.
```

**On tap "Review & Pay" → Screen 6**

---

**Screen 6: Payment Confirmation**

**If ACH selected:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━
Confirm Binder Deposit
━━━━━━━━━━━━━━━━━━━━━━━━━━

You're depositing:
💰 $1,000 (ACH Bank Transfer)

From Account:
🏦 Chase Checking (...4521)

To:
🔒 KeyLedger Escrow Account
    For: 123 Maple Street, Fairfield, CT

━━━━━━━━━━━━━━━━━━━━━━━━━━

Processing Time: 1-2 business days
Your Verified Buyer badge activates once funds clear.

[x] I authorize this ACH debit and agree to the Escrow Terms.

[Confirm & Deposit]

[Cancel]

━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**If Card selected:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━
Confirm Binder Deposit
━━━━━━━━━━━━━━━━━━━━━━━━━━

You're depositing:
💰 $1,000
Fee (2.9%): $29
Total: $1,029

Payment Method:
💳 Visa ending in 1234

To:
🔒 KeyLedger Escrow Account
    For: 123 Maple Street, Fairfield, CT

━━━━━━━━━━━━━━━━━━━━━━━━━━

Processing Time: Instant
Your Verified Buyer badge activates immediately.

[x] I authorize this charge and agree to the Escrow Terms.

[Confirm & Pay Now]

[Cancel]

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 Secure payment via Stripe
```

**On "Confirm":**
- Payment processed via Stripe
- Funds held in escrow account
- Buyer record updated: `binder_amount`, `binder_status: "deposited"`, `badge_active: true`

**→ Screen 7**

---

**Screen 7: Success Confirmation**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 You're a Verified Buyer!
━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Funds Verified: $400K-$500K
✅ Escrow Binder: $1,000 deposited
✅ Verified Buyer Badge: Active

━━━━━━━━━━━━━━━━━━━━━━━━━━

What This Means:

🏆 Your offers now include a Verified Buyer badge
🏆 Sellers and listing agents see you're credible
🏆 Your agent can submit stronger offers on your behalf

This verification is reusable — use it on multiple properties.

━━━━━━━━━━━━━━━━━━━━━━━━━━

[View My Dashboard]

[Share Verification with Another Agent]

━━━━━━━━━━━━━━━━━━━━━━━━━━

Receipt and escrow agreement sent to:
📧 john.smith@email.com

Questions? Contact support:
📞 (203) 555-LEDG
```

**Flow complete. Buyer can close browser or continue to client portal.**

---

### Flow 4: Agent Sees Updated Verification Status

**Agent's transaction dashboard updates in real-time:**

```
[SoftLock] Buyer Verification

Status: ✅ VERIFIED

━━━━━━━━━━━━━━━━━━━━━━━━━━

John & Sarah Smith

✅ Funds Verified
   Available: $400K-$500K
   Verified: Mar 24, 2026 at 11:15 AM

✅ Escrow Binder Deposited
   Amount: $1,000
   Status: Held in Escrow
   Deposited: Mar 24, 2026 at 11:18 AM

✅ Verified Buyer Badge: ACTIVE

━━━━━━━━━━━━━━━━━━━━━━━━━━

[View Full Verification Details]

[Download Verification Certificate (PDF)]

[Revoke Verification] (only if fraud suspected)

━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Pro Tip: Include the Verified Buyer badge in your offer submission to strengthen credibility.
```

---

## TECHNICAL ARCHITECTURE

### Components

**Frontend (Mobile Web):**
- React or Next.js (mobile-responsive)
- Plaid Link React SDK
- Stripe Payment Element for card payments
- Tailwind CSS for UI

**Backend (Node.js / Express):**
- `/api/softlock/initiate` — Creates verification session
- `/api/softlock/plaid-token` — Generates Plaid Link token
- `/api/softlock/verify` — Processes Plaid account data
- `/api/softlock/escrow-deposit` — Handles ACH or card payment
- `/api/softlock/status` — Returns verification status for agent dashboard

**Database Schema:**

```sql
CREATE TABLE softlock_verifications (
  id UUID PRIMARY KEY,
  buyer_id UUID REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  agent_id UUID REFERENCES users(id),
  
  -- Plaid data (encrypted)
  plaid_access_token TEXT ENCRYPTED,
  plaid_account_id TEXT ENCRYPTED,
  available_balance DECIMAL ENCRYPTED,
  verification_timestamp TIMESTAMP,
  
  -- Escrow binder
  binder_amount DECIMAL,
  binder_status ENUM('pending', 'deposited', 'applied', 'refunded'),
  binder_payment_method ENUM('ach', 'card'),
  binder_transaction_id TEXT,
  
  -- Badge status
  badge_active BOOLEAN DEFAULT FALSE,
  badge_expires_at TIMESTAMP, -- Optional: 90-day expiry
  
  -- Audit trail
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Third-Party Integrations:**

1. **Plaid** (Bank Verification)
   - API: `/link/token/create`, `/item/get`, `/accounts/balance/get`
   - Webhook: Balance updates, account disconnects
   - Cost: $0.03-0.10 per verification (depending on volume)

2. **Stripe** (Payments & Escrow)
   - Payment Intents API for card payments
   - ACH via Stripe Treasury or partner bank
   - Escrow holding via Stripe Connect + separate escrow account
   - Cost: 2.9% + $0.30 per card transaction, $0.80 per ACH

3. **Escrow Partner** (Optional)
   - For compliance, may need licensed escrow agent in some states
   - Alternative: Stripe Treasury + compliance review
   - Cost: $25-50 per transaction if using third-party escrow

---

## SECURITY & PRIVACY

### Data Protection

**What KeyLedger stores:**
- ✅ Verification status (Verified / Not Verified)
- ✅ Available balance range (encrypted, rounded to $100K increments for agent view)
- ✅ Plaid access token (encrypted at rest, used for balance refresh)
- ✅ Escrow binder amount and status

**What KeyLedger NEVER stores:**
- ❌ Bank account numbers (Plaid handles this)
- ❌ Bank routing numbers
- ❌ Transaction history
- ❌ Other account balances beyond the verified account

**Encryption:**
- All PII encrypted at rest (AES-256)
- All API calls over TLS 1.3
- Plaid tokens stored in encrypted vault (AWS KMS or similar)

**Access Control:**
- Agent sees: "Verified: $400K-$500K available" (range, not exact amount)
- Buyer sees: Full account details in their own dashboard
- KeyLedger admin support: Read-only access to verification status, not account data

### Compliance

**Plaid OAuth:**
- Buyer explicitly consents to Plaid access during bank login
- Consent is granular: "Allow KeyLedger to view your account balance"
- Buyer can revoke access anytime via KeyLedger settings

**RESPA Compliance:**
- SoftLock is a verification service, NOT a settlement service
- Transaction fees ($50) charged to agent, not buyer (avoids RESPA kickback issues)
- Escrow binder handled by licensed escrow agent or compliant Stripe setup

**State Licensing:**
- Some states require escrow services to be licensed
- KeyLedger partners with licensed escrow provider OR uses Stripe Treasury (check state reqs)

**GLBA (Gramm-Leach-Bliley Act):**
- Financial data subject to GLBA privacy rules
- KeyLedger's privacy policy must disclose data use, sharing, retention
- Annual privacy notice sent to users

---

## REVENUE MODEL

### Transaction Fees

**Agent pays $50 per completed verification:**
- Buyer completes fund verification (with or without binder) → Agent charged $50
- Billed monthly (all verifications aggregated)
- Included in agent's invoice

**Example:**
- Agent has 10 active buyers in March
- 7 complete SoftLock verification
- Agent billed: 7 × $50 = $350 in March

**Buyer pays escrow binder + optional card fee:**
- ACH: $0 fee (buyer pays only binder amount)
- Card: 2.9% + $0.30 (e.g., $1,000 binder = $29 + $0.30 = $29.30 fee)

**KeyLedger revenue per verification:**
- Agent fee: $50
- Card processing (if used): ~$20-25 net after Stripe fees
- **Total per verification: $50-75**

**Projected volume:**
- 100 agents × 5 verifications/month = 500 verifications/month
- 500 × $50 = **$25,000/month** in SoftLock revenue
- Plus SaaS subscriptions ($49-199/mo per agent)

---

## EDGE CASES & ERROR HANDLING

### Scenario 1: Buyer Has Insufficient Funds

**Plaid returns balance: $50,000**
**Property requires: $200,000**

**Screen 4 (modified):**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ Insufficient Funds Detected
━━━━━━━━━━━━━━━━━━━━━━━━━━

Available in Connected Account:
💰 $50,000

Required for This Property:
📍 123 Maple Street ($875,000)
  • 20% down payment: $175,000
  • Est. closing costs: $26,250
  • Total needed: ~$201,250

━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: ❌ INSUFFICIENT FUNDS

Your agent will see:
"Verified: $0-$100K available (below property requirements)"

━━━━━━━━━━━━━━━━━━━━━━━━━━

Options:

1. Connect a Different Account (e.g., savings, investment account)
2. Talk to Your Agent (adjust property search budget)
3. Skip Verification (continue without badge)

[Connect Different Account]

[Contact My Agent]

[Cancel]

━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Agent sees:**
```
[SoftLock] Buyer Verification

Status: ⚠️ INSUFFICIENT FUNDS

John & Sarah Smith
❌ Available: $0-$100K
❌ Required: ~$201K
❌ Shortfall: ~$150K+

Recommendation: Adjust search budget or advise buyer to connect additional accounts.

[Resend Invite] [Adjust Property Budget]
```

---

### Scenario 2: Plaid Connection Fails

**Error during bank login (wrong password, MFA timeout, etc.)**

**Screen 3 (error state):**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ Connection Failed
━━━━━━━━━━━━━━━━━━━━━━━━━━

We couldn't connect to your bank.

Common reasons:
• Incorrect login credentials
• MFA code expired
• Bank server temporarily unavailable

[Try Again]

[Contact Support]

━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Backend logs error, notifies support if repeated failures**

---

### Scenario 3: Buyer Abandons After Verification (No Binder)

**Buyer completes fund verification but skips binder deposit**

**Agent dashboard:**
```
[SoftLock] Buyer Verification

Status: ⚠️ VERIFIED (No Binder)

John & Sarah Smith
✅ Funds Verified: $400K-$500K
❌ Escrow Binder: Not Deposited
❌ Verified Buyer Badge: INACTIVE

💡 Tip: Encourage your buyer to deposit a binder to activate the badge and strengthen offers.

[Send Binder Reminder] [Skip — Mark as Verified Only]
```

**Agent still charged $50 verification fee (service was completed)**

---

### Scenario 4: Escrow Binder Refund Request

**Buyer's offer rejected, they want binder back**

**Buyer dashboard:**
```
Your Escrow Binder

Amount: $1,000
Status: Held in Escrow
Property: 123 Maple Street

Your offer was not accepted.

[Request Refund]

Refund Policy:
- Full refund minus $50 processing fee ($950 returned)
- Processing time: 3-5 business days
- Refunded to original payment method
```

**On "Request Refund":**
- Buyer fills brief form: "Reason for refund: Offer rejected / Changed mind / Other"
- KeyLedger admin reviews (auto-approve if offer not accepted)
- Stripe refund issued
- Buyer receives $950 (if $1,000 binder)

**Agent notified:**
```
[SoftLock] Buyer Verification

Status: ⚠️ BINDER REFUNDED

John & Sarah Smith
✅ Funds Verified: $400K-$500K
❌ Escrow Binder: Refunded (Mar 28, 2026)
❌ Verified Buyer Badge: INACTIVE

Buyer requested refund after offer rejection.

[Reactivate Verification] (if buyer wants to try again)
```

---

## UI/UX WIREFRAMES (Mobile)

### Mobile Screen Flow Summary

```
┌────────────────────┐
│  Welcome Screen    │
│  (Hero + CTA)      │
└────────┬───────────┘
         ↓
┌────────────────────┐
│  Confirm Details   │
│  (Property + Buyer)│
└────────┬───────────┘
         ↓
┌────────────────────┐
│  Connect Bank      │
│  (Plaid Link)      │
└────────┬───────────┘
         ↓
┌────────────────────┐
│  Verification      │
│  Result (✅ or ❌) │
└────────┬───────────┘
         ↓
┌────────────────────┐
│  Escrow Binder     │
│  (Optional)        │
└────────┬───────────┘
         ↓
┌────────────────────┐
│  Payment (ACH/Card)│
└────────┬───────────┘
         ↓
┌────────────────────┐
│  Success! Badge    │
│  Activated         │
└────────────────────┘
```

**Design principles:**
- Clean, minimal UI (mobile-first)
- Large touch targets (buttons min 48px height)
- Progress indicator at top ("Step 2 of 5")
- Trust signals (Plaid logo, Stripe badge, security icons)
- ASD-friendly: No flashing animations, clear language, predictable flow

---

## SUCCESS METRICS (KPIs)

**Verification Funnel:**
- Invites sent → Opens → Started → Verified → Binder deposited

**Target conversion rates:**
- Invite → Open: >60%
- Open → Start: >70%
- Start → Verified: >80% (if Plaid works)
- Verified → Binder: >50%

**Revenue per verification:**
- Agent fee: $50 (100% attach rate)
- Card processing net: $20 (if 40% use cards)
- **Average: $58/verification**

**Agent adoption:**
- % of agents using SoftLock: Target >40% by Month 6
- Verifications per agent per month: Target 5+

**Buyer satisfaction:**
- NPS score post-verification: Target >50
- Support tickets per 100 verifications: Target <5

---

## FUTURE ENHANCEMENTS (Phase 2+)

### V2 Features

1. **Multi-Property Verification**
   - Buyer verifies once, badge active across all properties for 90 days
   - No re-verification needed unless balance drops

2. **Pre-Approval Integration**
   - Partner with lenders (Rocket, Better.com, etc.)
   - SoftLock + Pre-Approval = Super Verified Buyer

3. **Instant Offer Submission**
   - Buyer scans QR on property sign → Verifies → Submits offer on the spot
   - Mobile-native offer flow

4. **Seller-Side SoftLock**
   - Verify seller has clear title, no liens
   - "Verified Seller" badge for transparency

5. **Blockchain Escrow (Long-Term)**
   - Smart contract escrow for binder deposits
   - Immutable proof of funds

---

**End of SoftLock Feature Spec**
