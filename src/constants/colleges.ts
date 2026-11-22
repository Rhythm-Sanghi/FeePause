import { CollegeRecord } from '../types';

export const COLLEGES: Record<string, CollegeRecord> = {
  northwood: {
    id: 'northwood',
    name: 'Northwood Institute of Technology (Demo College)',
    shortName: 'Northwood Tech',
    isSynthetic: true,
    isSupported: true,
    routeTitle: 'Northwood Student Accounts Self-Service (Demo Ledger)',
    routeDescription:
      'Fictional Northwood Tech finance portal where student tuition, lab assessments, and term dues are officially simulated.',
    guidanceUrl: 'https://mock-bursar.northwood.invalid/ledger-guide',
    sourceLabel: 'Northwood Academic Regulations & Cashier Policy (Demo Baseline)',
    lastCheckedDate: '2026-11-22',
    verificationSteps: [
      'Open Northwood’s synthetic student portal ledger using the in-app tool below.',
      'Check whether the specific fee line item and exact amount are listed on your current term statement.',
      'Confirm that the bursar office lists the fee before taking any payment action.'
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
      'Official IIT Delhi portal for continuing students to inspect registered courses, semester fee details, and institutional dues breakdown before taking any payment action.',
    portalUrl: 'https://ecampus.iitd.ac.in/scorner/login',
    portalHostname: 'ecampus.iitd.ac.in',
    guidanceUrl: 'https://academics.iitd.ac.in/circulars/',
    sourceLabel: 'IIT Delhi Academic Circulars (Continuing Students Fee Guidance, Academics Division)',
    lastCheckedDate: '2026-11-22',
    verificationSteps: [
      'Open https://ecampus.iitd.ac.in/scorner/login directly in your browser or access via your existing institutional bookmark.',
      'Log in through IIT Delhi institutional Single Sign-On credentials. Never enter passwords or OTPs into external forms or emailed links.',
      'Navigate to your student dashboard to review your current semester fee details, itemized breakdown, and registered balance before taking any payment action.',
      'Verify whether any pending fee appears on your official eCampus record before initiating any payment transaction.',
      'If you have doubts regarding a fee notice, verify with the Academic Section using contact details listed on academics.iitd.ac.in.'
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
    shortName: 'Unsupported College',
    isSynthetic: false,
    isSupported: false,
    routeTitle: 'Direct Institution Portal / Accounts Office Directory',
    routeDescription:
      'FeePause does not maintain a pre-verified directory route for unlisted institutions. Verify fee notices directly through your university’s official registrar or student accounts office without clicking links from unexpected messages.',
    verificationSteps: [
      'Open your college student portal using an existing trusted bookmark or your browser history.',
      'If you do not have a bookmark, search for your institution’s official registrar or student accounts office by institution name.',
      'Log in securely through your institution’s authenticated portal and check your student billing statement or ledger balance.',
      'Never use contact details, phone numbers, or payment links provided inside an unverified message to verify a fee.'
    ]
  }
};
