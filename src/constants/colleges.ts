import { CollegeRecord } from '../types';

export const COLLEGES: Record<string, CollegeRecord> = {
  northwood: {
    id: 'northwood',
    name: 'Northwood Institute of Technology (Fictional Demo — Sample Flow Only)',
    shortName: 'Northwood Tech (Demo)',
    isSynthetic: true,
    isSupported: true,
    routeTitle: 'Northwood Student Accounts Self-Service (Demo Ledger)',
    routeDescription:
      'Fictional Northwood Tech finance portal where student tuition, lab assessments, and term dues are officially simulated for demonstration.',
    sourceLabel: 'Fictional demo data',
    verificationSteps: [
      'Open Northwood’s fictional demo ledger using the in-app tool below.',
      'Check whether the specific fee line item and exact amount are listed on the demo statement.',
      'Confirm with the student accounts office before taking any payment action.'
    ]
  },
  iit_delhi: {
    id: 'iit_delhi',
    name: 'Indian Institute of Technology Delhi (IIT Delhi)',
    shortName: 'IIT Delhi',
    isSynthetic: false,
    isSupported: true,
    routeTitle: 'IIT Delhi eCampus Student Corner (scorner)',
    routeDescription:
      'IIT Delhi’s 2026–27 first-semester circular directs continuing students to eCampus Student Corner for the semester fees covered by that circular.',
    portalUrl: 'https://ecampus.iitd.ac.in/scorner/login',
    portalHostname: 'ecampus.iitd.ac.in',
    guidanceUrl:
      'https://academics.iitd.ac.in/wp-content/uploads/2026/07/FEE-CIRCULAR-FOR-CONTINUING-STUDENTS-FOR-THE-1ST-SEMESTER-OF-ACADEMIC-YEAR-2026-27-SHEKHARTHAK170620-updated_compressed.pdf',
    sourceLabel: 'IIT Delhi 2026–27 First-Semester Fee Circular for Continuing Students (academics.iitd.ac.in)',
    lastCheckedDate: '2026-11-22',
    verificationSteps: [
      'Open https://ecampus.iitd.ac.in/scorner/login directly in your browser or through your verified student bookmark.',
      'Log in with your official Kerberos / institutional credentials. Never enter credentials or OTPs into external links.',
      'Check your semester fee details and itemized breakdown on your eCampus dashboard before taking any payment step.',
      'If a charge is missing, differs, or you have questions, verify with the Academic Section using contacts published on academics.iitd.ac.in before transferring funds.'
    ]
  },
  uc_berkeley: {
    id: 'uc_berkeley',
    name: 'University of California, Berkeley',
    shortName: 'UC Berkeley',
    isSynthetic: false,
    isSupported: true,
    routeTitle: 'CalCentral — My Finances (Billing Summary & View Transactions)',
    routeDescription:
      'Official UC Berkeley student portal where tuition, campus fees, course materials, and adjustments are itemized on monthly billing statements.',
    portalUrl: 'https://calcentral.berkeley.edu',
    portalHostname: 'calcentral.berkeley.edu',
    guidanceUrl: 'https://studentcentral.berkeley.edu/billing-fees-payments/billing/',
    sourceLabel: 'UC Berkeley Student Central: Understanding Your Student Bill',
    lastCheckedDate: '2026-11-22',
    verificationSteps: [
      'Navigate directly to calcentral.berkeley.edu using your verified browser bookmark or address bar.',
      'Log in via CalNet authentication with 2-Step Verification.',
      'Under the My Finances tab, locate Billing Summary and select View Transactions to review your current balance and itemized activity.',
      'Check whether the claimed assessment appears on your official statement and check for any active campus tasks or holds.',
      'Make payments exclusively through official university payment options documented on Berkeley Student Central (studentcentral.berkeley.edu) — never through emailed links or peer-to-peer handles.'
    ]
  },
  unsupported: {
    id: 'unsupported',
    name: 'My college is not listed / Other institution',
    shortName: 'Unlisted College',
    isSynthetic: false,
    isSupported: false,
    routeTitle: 'Official Student Portal / Accounts Office Directory',
    routeDescription:
      'FeePause does not pre-register this institution. Verify unexpected fee notices directly through an authenticated student portal you already use or your campus accounts office.',
    verificationSteps: [
      'Open your college student portal using an existing trusted bookmark or your browser history.',
      'If you do not have a bookmark, search for your institution’s official registrar or student accounts office via its official domain.',
      'Log in securely through your institution’s authenticated portal and inspect your student billing statement or ledger balance.',
      'Never guess a domain or reuse contact details, phone numbers, or payment links provided inside the message.'
    ]
  }
};
