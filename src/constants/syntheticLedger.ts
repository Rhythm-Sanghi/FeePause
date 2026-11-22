import { SyntheticLedgerItem } from '../types';

export interface SyntheticStudentProfile {
  studentName: string;
  studentId: string;
  program: string;
  term: string;
  academicStanding: string;
}

export const MOCK_STUDENT_PROFILE: SyntheticStudentProfile = {
  studentName: 'Alex Mercer',
  studentId: 'NW-2024-8841',
  program: 'B.S. Computer Science (Year 3)',
  term: 'Fall Term 2026',
  academicStanding: 'Good Standing (No Active Holds)'
};

// Base tuition & wellness charges (present in all student records)
const BASE_LEDGER_ITEMS: SyntheticLedgerItem[] = [
  {
    id: 'NW-LEDGER-01',
    code: 'TUIT-301',
    description: 'Undergraduate Tuition - Fall 2026 (15 Credits)',
    term: 'Fall 2026',
    assessedDate: '2026-08-15',
    dueDate: '2026-09-01',
    amount: '$4,250.00',
    status: 'paid',
    payableOnline: false
  },
  {
    id: 'NW-LEDGER-02',
    code: 'HLTH-102',
    description: 'Campus Health & Wellness Assessment',
    term: 'Fall 2026',
    assessedDate: '2026-08-15',
    dueDate: '2026-09-01',
    amount: '$180.00',
    status: 'paid',
    payableOnline: false
  }
];

// 1. Ledger for Urgent Sample: NO matching charge exists on the ledger
export const URGENT_SAMPLE_LEDGER_ITEMS: SyntheticLedgerItem[] = [
  ...BASE_LEDGER_ITEMS
];

// 2. Ledger for Routine Reminder Sample: A matching $42.50 charge EXISTS on the ledger
export const ROUTINE_SAMPLE_LEDGER_ITEMS: SyntheticLedgerItem[] = [
  ...BASE_LEDGER_ITEMS,
  {
    id: 'NW-LEDGER-04',
    code: 'LIB-REP-42',
    description: 'Campus Library Materials Assessment (Replacement Fee)',
    term: 'Fall 2026',
    assessedDate: '2026-11-02',
    dueDate: '2026-11-28',
    amount: '$42.50',
    status: 'pending',
    payableOnline: true
  }
];

// 3. Ledger for Custom/Edited Text: Base ledger with neutral state (no simulated matching charge)
export const CUSTOM_LEDGER_ITEMS: SyntheticLedgerItem[] = [
  ...BASE_LEDGER_ITEMS
];
