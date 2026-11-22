# FeePause

> Help college students verify unexpected fee requests through their institution’s official student portal or accounts office before paying.

**Live Application Demo:** [https://rhythm-sanghi.github.io/FeePause/](https://rhythm-sanghi.github.io/FeePause/)  
**GitHub Repository:** [https://github.com/Rhythm-Sanghi/FeePause](https://github.com/Rhythm-Sanghi/FeePause)  
Built for **SafeSpace Hacks** (evaluated on Safety Benefit, Practical Functionality, Trust & Responsible Design, and Clarity & User Experience).

![FeePause Workspace Inspection](docs/screenshots/02-desktop-sample-inspected.png)

---

## The Problem & Real-World Background

College students are frequent targets of fraudulent or deceptive fee communications: unexpected lab fees, sudden graduation clearance demands, overdue library assessments, and fake enrollment holds. These messages weaponize artificial urgency—threatening course cancellation or academic suspension within hours—to rush students into sending payments via external payment gateways, wire transfers, UPI, peer-to-peer handles, or gift cards.

This threat is documented across premier institutions worldwide:
- **UC Berkeley Information Security Office & Student Central Advisories:** Official warnings alert students to fee fraud campaigns where impersonated bursar notices threaten enrollment cancellation unless funds are wired immediately, emphasizing that all legitimate campus assessments are posted exclusively within **CalCentral (`calcentral.berkeley.edu`)** under *My Finances → Billing Summary → View Transactions* ([UC Berkeley Student Central Billing Guidance](https://studentcentral.berkeley.edu/billing-fees-payments/billing/)).
- **IIT Delhi Academic Circulars (Academics Division):** Official institutional circulars advise continuing students that all authentic semester registration fees, hostel dues, and balance breakdowns are documented strictly within the authenticated **eCampus Student Corner (`ecampus.iitd.ac.in/scorner/login`)**, cautioning students never to trust unverified emails or transfer fees to external payment links ([IIT Delhi Academic Circulars](https://academics.iitd.ac.in/circulars/)).

Existing security tools often try to predict "scam probabilities" or award false-sense-of-security "safe to pay" badges using probabilistic AI text models. But phishing messages can look pristine, and genuine university emails can look rushed or unpolished. **Text in an incoming message can never prove whether an invoice actually exists on an institutional ledger.**

FeePause operates on a foundational safety premise: **Never guess authenticity. Instead, guide the student directly to their institution's official student portal or accounts office to inspect their authenticated ledger before any payment is made.**

---

## 30-Second Judge Walkthrough

1. **Load a Sample:** Click **"Sample 2: Routine Fee Reminder"** or **"Sample 1: Urgent Overdue Notice"**.
2. **Review Extracted Observations:** FeePause deterministically detects observable facts—such as claimed amounts (supporting Indian-grouped `₹1,25,000`, Western-grouped `$1,250,000`, and plain sums), stated deadlines, external links, and credential mentions.
3. **Inspect Evidence:** Selecting an observation in the workspace updates the **Evidence Inspector** with the exact excerpt, plain-language risk assessment, and why message content alone cannot prove an institutional balance.
4. **Primary Safety Action:** Look at the top banner. FeePause gives highest visual hierarchy to the verified independent verification route. Sender-supplied links and handles are strictly isolated and prevented from supplying destinations.
5. **Open Synthetic Portal:** Click **"Open Synthetic Portal →"**:
   - For **Sample 2 (Routine Reminder)**: Demonstrates **"Matching charge in this demo ledger"**—the $42.50 library fee appears on the ledger, but **the incoming reminder itself remains unverified**; payment must occur through official cashier instructions inside the portal, not the email's link.
   - For **Sample 1 (Urgent Notice)**: Demonstrates **"No matching charge in this demo ledger"**—the official student ledger shows zero pending fees and zero active holds. While a missing ledger entry does not prove a message is fake, students should never pay an unverified fee.
   - For **Custom / Edited Text**: Shows **"No demo result for this message"** while keeping the college verification route available.
6. **Try Custom Text:** Paste any message text. Notice that editing text immediately clears previous findings and displays **"Message changed. Check again."** while keeping the institutional verification banner active.

---

## Privacy and Verification Design

- **No Scam Scores or Probability Verdicts:** FeePause strictly avoids generating authenticity percentages or "safe to pay" badges. Observable facts are presented plainly, directing verification to authoritative ledgers.
- **Destination Isolation:** Links, phone numbers, and peer payment handles found inside message text are never used as verification routes. Official routes are drawn exclusively from verified institutional records.
- **Private by Design:** All text analysis runs entirely in ephemeral client memory. User input is never written to `localStorage`, `sessionStorage`, cookies, URLs, server logs, or outgoing network requests.
- **Accessible Keyboard Interaction:** Observation items are native `<button>` elements with visible focus styling. The synthetic portal modal is an accessible dialog featuring automatic focus entry, a focus trap, Escape key dismissal, and guaranteed focus restoration to the opener control.
- **Synthetic Demonstration Ledger:** An in-app mock environment for *Northwood Institute of Technology* demonstrates how students cross-reference incoming demands against actual institutional ledger records.
- **Manual Protocol for Unlisted Colleges:** For institutions not pre-registered in FeePause, the app provides a step-by-step verified search protocol using existing authenticated bookmarks or institutional top-level domains—never guessing URLs or contacts.
- **Threadmark-Inspired Design:** Built with the restrained density of the Threadmark interface (`#F5F4EE` warm canvas, `#1C211C` deep ink, `#455D45` olive accent, monospace domain formatting, and an evidence inspector column).

---

## Screenshots

### Synthetic Portal (Matching Fee on Ledger with Unverified Reminder Status)
![Synthetic Portal Match](docs/screenshots/03-desktop-synthetic-portal-match.png)

### Desktop Core Judge Flow & Evidence Inspector
![Desktop Core Flow](docs/screenshots/02-desktop-sample-inspected.png)

### Mobile View (390px Stacked Responsive Layout)
![Mobile Stacked Layout](docs/screenshots/05-mobile-sample-stacked.png)

---

## Quickstart & Verification Commands

### Prerequisites
- Node.js (>= 18.0.0)
- npm (>= 9.0.0)

### 1. Install Clean Dependencies
```bash
npm ci
```

### 2. Run Lint Check
```bash
npm run lint
```

### 3. Run Typecheck & Production Build
```bash
npm run build
```

### 4. Run Unit Tests (Vitest)
```bash
npm run test
```
*Runs 16 unit tests across 3 suites validating deterministic extraction (Indian digit grouping, Western grouping, credentials vs. neutral mentions, neutral links vs. payment routes, stated deadlines), destination isolation invariants, and privacy boundaries.*

### 5. Run End-to-End & Functional Tests (Playwright)
```bash
npm run test:e2e
```
*Runs 14 Playwright tests covering judge sample flows, keyboard accessibility & focus restoration, stale state warnings ("Message changed. Check again."), real-college portal links (IIT Delhi & UC Berkeley), unlisted college fallback, zero storage/network marker leak audits, and screenshot capture.*

### 6. Start Local Development Server
```bash
npm run dev
```
Preview at `http://localhost:5173`.

---

## Limitations

FeePause cannot authenticate the sender or inspect a student’s private fee balance. Incoming emails, SMS headers, and letterheads can be mimicked. Even when a message contains no suspicious markers, students must confirm whether a fee is actually listed on their authenticated student portal or consult the campus accounts office directly before transferring funds.

---

## Credits & Acknowledgments

- **Lead Engineer & Product Designer:** Rhythm Sanghi
- **Competition:** Built for SafeSpace Hacks
- **Design Influence:** Interface structure and design language adapted from [Threadmark](https://github.com/Rhythm-Sanghi/Threadmark)
- **Assistance:** Engineered with Google Antigravity
