import { AnalysisResult, CollegeRecord, Observation } from '../types';

export function analyzeRequestText(
  text: string,
  college: CollegeRecord
): AnalysisResult {
  const trimmed = text.trim();
  const observations: Observation[] = [];
  const extractedAmounts: string[] = [];
  const extractedDestinations: string[] = [];
  const extractedDeadlines: string[] = [];

  if (!trimmed) {
    return {
      collegeId: college.id,
      college,
      checkedText: text,
      observations: [],
      hasObservations: false,
      isLowInformation: true,
      extractedAmounts: [],
      extractedDestinations: [],
      extractedDeadlines: []
    };
  }

  // 1. Detect Claimed Amounts / Money requests
  const amountRegex = /(?:[$€£₹]|USD\s?|INR\s?|EUR\s?)\s?\d+(?:,\d{3})*(?:\.\d{1,2})?|\b\d+(?:,\d{3})*(?:\.\d{1,2})?\s?(?:dollars|rupees|bucks|euros)\b/gi;
  let match: RegExpExecArray | null;

  while ((match = amountRegex.exec(text)) !== null) {
    const rawVal = match[0].trim();
    if (!extractedAmounts.includes(rawVal)) {
      extractedAmounts.push(rawVal);
    }
    observations.push({
      id: `obs-amount-${observations.length + 1}`,
      category: 'payment',
      label: `Specific fee amount claimed: ${rawVal}`,
      excerpt: rawVal,
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      plainExplanation:
        'The message requests a specific monetary amount. Official educational dues should be corroborated by an itemized ledger charge in your verified student portal.',
      whatIsUnverified:
        'The message text claims you owe this sum, but text in an email or SMS cannot prove an invoice actually exists on your institutional student balance.'
    });
  }

  // 2. Detect External Links, URLs, and Domains
  const urlRegex = /(?:https?:\/\/|www\.)[^\s/$.?#].[^\s]*|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:net|org|com|info|top|xyz|cc|biz|ru|site|link|me|clearance|services|invalid)[^\s]*/gi;
  while ((match = urlRegex.exec(text)) !== null) {
    const rawUrl = match[0].replace(/[.,;:)]+$/, '');
    if (!extractedDestinations.includes(rawUrl)) {
      extractedDestinations.push(rawUrl);
    }
    observations.push({
      id: `obs-url-${observations.length + 1}`,
      category: 'unverified_link',
      label: `Pasted external payment or clearance link: ${rawUrl}`,
      excerpt: rawUrl,
      startIndex: match.index,
      endIndex: match.index + rawUrl.length,
      plainExplanation:
        'The message directs payment through this external link. FeePause strictly isolates pasted links and will never use them as verification routes.',
      whatIsUnverified:
        'The domain is supplied by the sender, not your institution’s authenticated registrar or bursar infrastructure. Official portals never rely on external throwaway domains.'
    });
  }

  // 3. Detect Contact Handles (Email addresses or UPI / peer handles)
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  while ((match = emailRegex.exec(text)) !== null) {
    const handle = match[0];
    if (!extractedDestinations.includes(handle)) {
      extractedDestinations.push(handle);
    }
    observations.push({
      id: `obs-handle-${observations.length + 1}`,
      category: 'contact_handle',
      label: `Sender-provided contact or transfer address: ${handle}`,
      excerpt: handle,
      startIndex: match.index,
      endIndex: match.index + handle.length,
      plainExplanation:
        'The sender provides an email address or direct contact route for verification or confirmation. Anyone can create an email address with "bursar" or "desk" in the username.',
      whatIsUnverified:
        'The address is not authenticated by your university. Official communications should be cross-referenced against your department directory.'
    });
  }

  // 4. Detect Urgent Deadlines & Time Pressure
  const urgencyRegex = /\b(?:within\s+\d+\s+(?:hours?|hrs?|minutes?|days?)|immediate(?:ly)?|past due|urgent(?:\s+notice)?|due\s+by\s+[^\n.,;]+|by\s+(?:today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.))|at\s+5:00\s*pm|deadline:\s*[^.\n]+)\b/gi;
  while ((match = urgencyRegex.exec(text)) !== null) {
    const urgencyPhrase = match[0];
    if (!extractedDeadlines.includes(urgencyPhrase)) {
      extractedDeadlines.push(urgencyPhrase);
    }
    observations.push({
      id: `obs-urgency-${observations.length + 1}`,
      category: 'urgency',
      label: `Short deadline or artificial urgency: "${urgencyPhrase}"`,
      excerpt: urgencyPhrase,
      startIndex: match.index,
      endIndex: match.index + urgencyPhrase.length,
      plainExplanation:
        'Imposing strict deadlines (e.g. a few hours) is designed to trigger panic and bypass calm verification with campus staff.',
      whatIsUnverified:
        'True institutional administrative holds follow documented university calendar timelines, not arbitrary short countdowns delivered via unverified messages.'
    });
  }

  // 5. Detect Threats of Sanction or Account Freezing
  const sanctionRegex = /\b(?:freeze\s+your\s+course\s+enrollment|administrative\s+hold|cannot\s+be\s+reversed|delay\s+diploma|cancel(?:led)?\s+enrollment|prevent\s+registration|access\s+to\s+online\s+exams|transcript\s+certification)\b/gi;
  while ((match = sanctionRegex.exec(text)) !== null) {
    const sanctionPhrase = match[0];
    observations.push({
      id: `obs-sanction-${observations.length + 1}`,
      category: 'sanction_threat',
      label: `Threatened academic or administrative sanction: "${sanctionPhrase}"`,
      excerpt: sanctionPhrase,
      startIndex: match.index,
      endIndex: match.index + sanctionPhrase.length,
      plainExplanation:
        'Threatening account suspension or exam blocking puts students on the defensive. Legitimate universities issue official notice well before taking irreversible academic action.',
      whatIsUnverified:
        'The message claims your enrollment will be frozen, but holds can only be placed within the official student information system, which you can inspect directly.'
    });
  }

  // 6. Detect Demands for OTP, PIN, Passwords, or Transaction Screenshots
  const credentialRegex = /\b(?:otp|one-time\s+password|6-digit\s+payment\s+confirmation|pin\b|password|transaction\s+reference|confirmation\s+otp|screenshot\s+of\s+payment)\b/gi;
  while ((match = credentialRegex.exec(text)) !== null) {
    const credPhrase = match[0];
    observations.push({
      id: `obs-cred-${observations.length + 1}`,
      category: 'credential_otp',
      label: `Request for OTP, reference, or sensitive verification code: "${credPhrase}"`,
      excerpt: credPhrase,
      startIndex: match.index,
      endIndex: match.index + credPhrase.length,
      plainExplanation:
        'The message demands an OTP or payment authorization code. Legitimate college billing portals process payments directly through secured banking gateways and never ask you to forward an OTP by email or form.',
      whatIsUnverified:
        'Never transmit OTPs, two-factor codes, or banking authorization tokens. University financial offices will NEVER request your OTP.'
    });
  }

  const hasObservations = observations.length > 0;
  const isLowInformation = !hasObservations;

  return {
    collegeId: college.id,
    college,
    checkedText: text,
    observations,
    hasObservations,
    isLowInformation,
    extractedAmounts,
    extractedDestinations,
    extractedDeadlines
  };
}
