export type ObservationCategory =
  | 'urgency'
  | 'payment'
  | 'unverified_link'
  | 'credential_otp'
  | 'sanction_threat'
  | 'contact_handle';

export interface Observation {
  id: string;
  category: ObservationCategory;
  label: string;
  excerpt: string;
  startIndex: number;
  endIndex: number;
  plainExplanation: string;
  whatIsUnverified: string;
}

export interface CollegeRecord {
  id: string;
  name: string;
  shortName: string;
  isSynthetic: boolean;
  isSupported: boolean;
  routeTitle: string;
  routeDescription: string;
  sourceLabel: string;
  sourceUrl: string;
  lastCheckedDate: string;
  verificationSteps: string[];
}

export interface AnalysisResult {
  collegeId: string;
  college: CollegeRecord;
  checkedText: string;
  observations: Observation[];
  hasObservations: boolean;
  isLowInformation: boolean;
  extractedAmounts: string[];
  extractedDestinations: string[];
  extractedDeadlines: string[];
}

export interface SyntheticLedgerItem {
  id: string;
  code: string;
  description: string;
  term: string;
  assessedDate: string;
  dueDate: string;
  amount: string;
  status: 'paid' | 'pending';
  payableOnline: boolean;
}

export interface SampleRequest {
  id: string;
  name: string;
  tagline: string;
  collegeId: string;
  body: string;
  teachingPoint: string;
}
