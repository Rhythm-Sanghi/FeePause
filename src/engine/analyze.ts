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

  // 1. Detect Claimed Amounts (Supports Indian grouping like ₹1,25,000, Western grouping $1,250,000, and plain numbers)
  const numPattern = '(?:\\d{1,2}(?:,\\d{2})+(?:,\\d{3})|\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.\\d{1,2})?';
  const amountRegex = new RegExp(
    `(?:[$€£₹]|\\b(?:USD|INR|EUR)\\s*)\\s*${numPattern}|\\b${numPattern}\\s*(?:dollars|rupees|bucks|euros)\\b`,
    'gi'
  );

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

    // Determine if link is payment-related or neutral
    const contextStart = Math.max(0, match.index - 40);
    const contextEnd = Math.min(text.length, match.index + rawUrl.length + 40);
    const surrounding = text.slice(contextStart, contextEnd).toLowerCase();
    const isPaymentRelated = /(?:pay|payment|bursar|clearance|checkout|dues|billing|settle|fees|invoice)/i.test(
      rawUrl + ' ' + surrounding
    );

    if (isPaymentRelated) {
      observations.push({
        id: `obs-url-${observations.length + 1}`,
        category: 'unverified_link',
        label: `Unverified payment or clearance link: ${rawUrl}`,
        excerpt: rawUrl,
        startIndex: match.index,
        endIndex: match.index + rawUrl.length,
        plainExplanation:
          'The message directs payment or fee settlement through this external link. FeePause strictly isolates pasted links and will never use them as verification routes.',
        whatIsUnverified:
          'The domain is supplied by the sender, not your institution’s authenticated registrar or bursar infrastructure. Official portals never rely on external throwaway domains.'
      });
    } else {
      observations.push({
        id: `obs-url-${observations.length + 1}`,
        category: 'unverified_link',
        label: `Link found in message: ${rawUrl}`,
        excerpt: rawUrl,
        startIndex: match.index,
        endIndex: match.index + rawUrl.length,
        plainExplanation:
          'The message contains an external web link. FeePause strictly isolates pasted links and will never use sender-supplied destinations as an independent verification route.',
        whatIsUnverified:
          'The destination was provided in the message, not from your institution’s verified directory or authenticated student portal.'
      });
    }
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

  // 4. Detect Deadlines & Time Pressure (Distinguish panic urgency vs stated deadline)
  const urgencyRegex = /\b(?:within\s+\d+\s+(?:hours?|hrs?|minutes?|days?)|immediate(?:ly)?|past due|urgent(?:\s+notice)?|due\s+by\s+[^\n.,;]+|by\s+(?:today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.))|at\s+5:00\s*pm|deadline:\s*[^.\n]+)\b/gi;
  while ((match = urgencyRegex.exec(text)) !== null) {
    const urgencyPhrase = match[0];
    if (!extractedDeadlines.includes(urgencyPhrase)) {
      extractedDeadlines.push(urgencyPhrase);
    }

    const isArtificialPanic = /\b(?:within\s+\d+\s+(?:hours?|hrs?|minutes?)|immediate(?:ly)?|past\s+due|urgent(?:\s+notice)?|final\s+notice|final\s+warning|act\s+now)\b/i.test(
      urgencyPhrase
    );

    if (isArtificialPanic) {
      observations.push({
        id: `obs-urgency-${observations.length + 1}`,
        category: 'urgency',
        label: `Artificial urgency or short deadline: "${urgencyPhrase}"`,
        excerpt: urgencyPhrase,
        startIndex: match.index,
        endIndex: match.index + urgencyPhrase.length,
        plainExplanation:
          'Imposing strict deadlines (e.g. a few hours) is designed to trigger panic and bypass calm verification with campus staff.',
        whatIsUnverified:
          'True institutional administrative holds follow documented university calendar timelines, not arbitrary short countdowns delivered via unverified messages.'
      });
    } else {
      observations.push({
        id: `obs-urgency-${observations.length + 1}`,
        category: 'urgency',
        label: `Stated deadline: "${urgencyPhrase}"`,
        excerpt: urgencyPhrase,
        startIndex: match.index,
        endIndex: match.index + urgencyPhrase.length,
        plainExplanation:
          'The message states a specific payment or compliance deadline. Routine administrative notices often specify a due date, which should be verified against your official student portal or academic calendar.',
        whatIsUnverified:
          'The stated deadline comes from the message sender. Confirm the actual due date in your authenticated student account before taking action.'
      });
    }
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

  // 6. Detect Credentials, OTP, PIN, Passwords (Distinguish requested vs mentioned)
  const credentialRegex = /\b(?:otp|one-time\s+password|6-digit\s+payment\s+confirmation|pin\b|password|transaction\s+reference|confirmation\s+otp|screenshot\s+of\s+payment)\b/gi;
  while ((match = credentialRegex.exec(text)) !== null) {
    const credPhrase = match[0];
    const lowerPhrase = credPhrase.toLowerCase();

    // Check surrounding 60 characters for caution/negation or explicit request
    const contextStart = Math.max(0, match.index - 50);
    const contextEnd = Math.min(text.length, match.index + credPhrase.length + 50);
    const surrounding = text.slice(contextStart, contextEnd);

    const hasNegation = /(?:never|do\s+not|don't|should\s+not|will\s+never|beware|refrain|keep\s+(?:your\s+)?(?:secret|private|safe)|strictly\s+prohibited)/i.test(
      surrounding
    );
    const hasRequestVerb = /(?:enter|submit|provide|share|send|forward|reply\s+with|fill\s+in|input|verify\s+(?:your\s+account\s+)?with)\b/i.test(
      surrounding
    );

    const isRequested = hasRequestVerb && !hasNegation;

    let credType = 'Credential';
    if (/\b(?:otp|one-time\s+password|confirmation\s+otp)\b/i.test(lowerPhrase)) {
      credType = 'OTP';
    } else if (/\bpin\b/i.test(lowerPhrase)) {
      credType = 'PIN';
    } else if (/password/i.test(lowerPhrase)) {
      credType = 'Password';
    } else if (/reference|screenshot|confirmation/i.test(lowerPhrase)) {
      credType = 'Reference number';
    }

    if (isRequested) {
      observations.push({
        id: `obs-cred-${observations.length + 1}`,
        category: 'credential_otp',
        label: `Request for ${credType} or verification code: "${credPhrase}"`,
        excerpt: credPhrase,
        startIndex: match.index,
        endIndex: match.index + credPhrase.length,
        plainExplanation:
          'The message asks you to provide, enter, or forward an OTP, PIN, password, or transaction authorization code. Legitimate college billing departments will never ask you to send or enter an OTP through email, SMS, or external forms.',
        whatIsUnverified:
          'Never transmit OTPs, two-factor codes, or banking authorization tokens. University financial offices will NEVER request your OTP.'
      });
    } else {
      observations.push({
        id: `obs-cred-${observations.length + 1}`,
        category: 'credential_otp',
        label: `${credType} mentioned`,
        excerpt: credPhrase,
        startIndex: match.index,
        endIndex: match.index + credPhrase.length,
        plainExplanation:
          'The message mentions an authentication credential or security code. If the message is advising caution, that is standard security advice. Official college portals will never ask you to disclose or forward an OTP.',
        whatIsUnverified:
          'The presence of security advisory text or credential mentions does not prove the message itself originated from an official source.'
      });
    }
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
