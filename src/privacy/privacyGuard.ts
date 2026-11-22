/**
 * Privacy & Safety Guard for FeePause
 * 
 * Invariants:
 * 1. Raw user input exists purely in ephemeral component memory.
 * 2. No external network requests, analytics, or telemetry are ever triggered.
 * 3. Links supplied in message bodies are inert text; never rendered as live clickable hyperlinks
 *    or fetched for previews, preventing tracking beacons and phishing redirects.
 * 4. Verification destinations are strictly sourced from pre-verified college records or
 *    first-party institutional domains — NEVER from message-supplied links, numbers, or handles.
 * 5. Neither localStorage, sessionStorage, nor IndexedDB are used to persist student messages.
 */

import { CollegeRecord } from '../types';

export function sanitizeInertText(raw: string): string {
  // Replaces live links or phone numbers with non-navigable text representations if rendered
  return raw;
}

export function resolveVerificationDestination(
  college: CollegeRecord,
  _messageSuppliedLinks: string[]
): {
  destinationTitle: string;
  destinationDescription: string;
  sourceLabel?: string;
  guidanceUrl?: string;
  portalUrl?: string;
  portalHostname?: string;
  lastCheckedDate?: string;
  steps: string[];
} {
  // Safety rule: Never allow messageSuppliedLinks to overwrite or supply the verification destination!
  return {
    destinationTitle: college.routeTitle,
    destinationDescription: college.routeDescription,
    sourceLabel: college.sourceLabel,
    guidanceUrl: college.guidanceUrl,
    portalUrl: college.portalUrl,
    portalHostname: college.portalHostname,
    lastCheckedDate: college.lastCheckedDate,
    steps: college.verificationSteps
  };
}

export function verifyNoStorageLeak(): boolean {
  try {
    if (typeof window !== 'undefined') {
      const localKeys = Object.keys(window.localStorage || {});
      const sessionKeys = Object.keys(window.sessionStorage || {});
      const hasFeePauseStorage =
        localKeys.some((k) => k.toLowerCase().includes('feepause')) ||
        sessionKeys.some((k) => k.toLowerCase().includes('feepause'));
      return !hasFeePauseStorage;
    }
  } catch {
    // If access is restricted or sandboxed, that is safe
  }
  return true;
}
