import { SampleRequest } from '../types';

export const SAMPLE_REQUESTS: SampleRequest[] = [
  {
    id: 'sample-urgent-suspicious',
    name: 'Sample 1: Urgent Overdue Notice',
    tagline: 'Urgent freeze threat, OTP demand, and external payment link',
    collegeId: 'northwood',
    teachingPoint:
      'High pressure and threats of cancellation often cause panic. FeePause highlights the claimed deadline and payment destination, while directing you to your official portal to check if this fee even exists.',
    body: `URGENT NOTICE: NORTHWOOD STUDENT ACCOUNTS OFFICE
Subject: Overdue Technology & Lab Assessment Fee ($385.00)

Dear Student,
Our records indicate an outstanding balance of $385.00 for your Fall Term Lab Access and Technology Resource fee. 

Because this balance is past due, an immediate Administrative Hold will freeze your course enrollment and access to online exams within 3 hours unless payment is settled.

To resolve immediately and release your hold:
1. Visit the clearance gateway: https://northwood-clearance.invalid/pay
2. Enter your Student ID and complete payment via instant transfer or debit card.
3. Submit the 6-digit payment confirmation OTP and transaction reference to bursar-desk@fast-verify.invalid immediately.

Do not delay. Holds applied at 5:00 PM cannot be reversed until the following term.

Office of Student Financial Services
Northwood Institute of Technology`
  },
  {
    id: 'sample-ordinary-reminder',
    name: 'Sample 2: Routine Fee Reminder',
    tagline: 'Polite, credible wording with an unverified payment gateway',
    collegeId: 'northwood',
    teachingPoint:
      'A message does not need to sound angry or suspicious to be risky. Benign tone and standard formatting alone cannot verify a fee. Official dues must always be verified in the student ledger.',
    body: `Northwood Campus Library Services
Notice of Replacement Fee Assessment

Hello Student,

This is a friendly reminder from Northwood University Libraries regarding items borrowed earlier this term. A standard replacement assessment of $42.50 has been recorded for the overdue materials.

Details:
- Item: Engineering Mathematics Handbook (9th Edition)
- Assessed fee: $42.50
- Due date: November 28, 2026

If you have already returned these materials, please disregard this note. Otherwise, please settle the outstanding balance through the campus payment assistant at https://northwood-dues-collection.invalid/pay-fee to keep your library account in good standing.

Thank you for your cooperation,
Circulation Desk | Northwood Institute of Technology`
  },
  {
    id: 'sample-unsupported-college',
    name: 'Sample 3: Unlisted College Request',
    tagline: 'Tests the manual verification protocol for any unlisted institution',
    collegeId: 'unsupported',
    teachingPoint:
      'When your college is not pre-registered in FeePause, FeePause never invents or guesses contacts. Instead, it provides a safe, step-by-step procedure to inspect your existing authenticated student portal.',
    body: `Pacific Horizon University
Office of the Registrar & Student Billing

MEMORANDUM: Mandatory Graduation Audit & Commencement Fee
To: Graduating Candidates
Amount Due: $75.00
Deadline: December 1, 2026

All candidates for degree conferral must submit the mandatory graduation audit fee of $75.00 prior to final transcript certification. Payments may be submitted through the quick-link portal at https://pacific-horizon-clearance.invalid/dues or via peer transfer to phu-bursar@acct-services.invalid.

Failure to remit before the deadline will delay diploma delivery.

Registrar Staff
Pacific Horizon University`
  }
];
