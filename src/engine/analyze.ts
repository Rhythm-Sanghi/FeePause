import { AnalysisResult, CollegeRecord, Observation } from '../types';

/**
 * Extracts the single sentence surrounding a given character span,
 * respecting punctuation inside decimals, abbreviations, and URLs.
 */
function getSentenceAt(text: string, startIndex: number, endIndex: number): string {
  let start = 0;
  for (let i = startIndex - 1; i >= 0; i--) {
    const char = text[i];
    if (char === '\n') {
      start = i + 1;
      break;
    }
    if ((char === '.' || char === '!' || char === '?') && i + 1 < text.length && /\s/.test(text[i + 1])) {
      // Check if it is a decimal point between digits
      if (char === '.' && i > 0 && /\d/.test(text[i - 1]) && i + 2 < text.length && /\d/.test(text[i + 2])) {
        continue;
      }
      // Check if it is a common abbreviation
      const prev4 = text.slice(Math.max(0, i - 3), i + 1).toLowerCase();
      if (prev4 === 'a.m.' || prev4 === 'p.m.' || prev4 === 'e.g.' || prev4 === 'i.e.') {
        continue;
      }
      start = i + 1;
      break;
    }
  }

  let end = text.length;
  for (let i = endIndex; i < text.length; i++) {
    const char = text[i];
    if (char === '\n') {
      end = i;
      break;
    }
    if (char === '.' || char === '!' || char === '?') {
      if (char === '.' && i > 0 && /\d/.test(text[i - 1]) && i + 1 < text.length && /\d/.test(text[i + 1])) {
        continue;
      }
      const prev4 = text.slice(Math.max(0, i - 3), i + 1).toLowerCase();
      if (prev4 === 'a.m.' || prev4 === 'p.m.' || prev4 === 'e.g.' || prev4 === 'i.e.') {
        continue;
      }
      if (i + 1 === text.length || /\s/.test(text[i + 1])) {
        end = i + 1;
        break;
      }
    }
  }

  return text.slice(start, end).trim();
}

/**
 * Validates a numeric string against standard currency grouping rules:
 * - Plain integers: 500, 125000
 * - Plain two-decimals: 42.50, 385.00
 * - Western grouping: 1,250 / 1,250,000 / 1,250.00
 * - Indian grouping: 1,25,000 / 25,000 / 1,25,000.00
 * Rejects irregular grouping like 1,2,500 or three-decimals like 12.345.
 */
function isValidCurrencyNumber(numStr: string): boolean {
  // Plain integer
  if (/^\d{1,12}$/.test(numStr)) return true;
  // Plain two-decimal amount
  if (/^\d{1,12}\.\d{2}$/.test(numStr)) return true;
  // Western grouped integer (groups of exactly 3 digits after the first 1-3 digits)
  if (/^\d{1,3}(?:,\d{3})+$/.test(numStr)) return true;
  // Western grouped two-decimal amount
  if (/^\d{1,3}(?:,\d{3})+\.\d{2}$/.test(numStr)) return true;
  // Indian grouped integer (last group of 3 digits, preceding groups of 2 digits)
  if (/^\d{1,2}(?:,\d{2})*,\d{3}$/.test(numStr)) return true;
  // Indian grouped two-decimal amount
  if (/^\d{1,2}(?:,\d{2})*,\d{3}\.\d{2}$/.test(numStr)) return true;

  return false;
}

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

  // 1. Detect Currency Amounts with Complete Token Validation
  // Matches prefix currencies [$€£₹] or (?:USD|INR|EUR) and suffix currency words (dollars|rupees|euros|bucks)
  const currencyPrefixRegex = /(?:[$€£₹]|\b(?:USD|INR|EUR)\s*)\s*([^\s;!?()]+)/gi;
  let match: RegExpExecArray | null;

  while ((match = currencyPrefixRegex.exec(text)) !== null) {
    let candidate = match[1];
    let trailingTrimCount = 0;

    // Strip terminal sentence punctuation if not a valid decimal ending
    while (/[.,;!?)]$/.test(candidate)) {
      // Don't strip if it forms a valid .dd decimal
      if (/\.\d{2}$/.test(candidate)) break;
      candidate = candidate.slice(0, -1);
      trailingTrimCount++;
    }

    if (!isValidCurrencyNumber(candidate)) {
      // Skip ambiguous or malformed numbers (e.g. $12.345 or ₹1,2,500)
      continue;
    }

    const fullMatchLength = match[0].length - trailingTrimCount;
    const rawVal = text.slice(match.index, match.index + fullMatchLength).trim();
    const startIndex = match.index;
    const endIndex = match.index + rawVal.length;

    if (!extractedAmounts.includes(rawVal)) {
      extractedAmounts.push(rawVal);
    }

    const sentence = getSentenceAt(text, startIndex, endIndex);
    const isCreditOrScholarship = /\b(?:scholarship|credit|grant|waiver|refund|aid)\b/i.test(sentence);
    const isExplicitPaymentRequest =
      /\b(?:pay|remit|transfer|clear(?:ed)?(?:\s+(?:the\s+)?dues)?|send\s+payment)\b/i.test(sentence) && !isCreditOrScholarship;

    let label = `Amount mentioned: ${rawVal}`;
    let plainExplanation =
      'The message mentions a monetary figure. In an official educational billing context, amounts may represent charges, credits, balances, or estimates. Always verify against your official student portal.';
    let whatIsUnverified =
      'The message text states this figure, but message content alone cannot prove an official charge or credit exists on your student balance.';

    if (isCreditOrScholarship) {
      label = `Amount mentioned: ${rawVal}`;
      plainExplanation =
        'The message mentions an amount associated with a scholarship, credit, or waiver. Credits reduce balances rather than creating new payment obligations. Confirm your ledger breakdown in your official student portal.';
      whatIsUnverified =
        'Message text alone cannot confirm whether a scholarship, fee credit, or adjustment has actually posted to your institutional student balance.';
    } else if (isExplicitPaymentRequest) {
      label = `Fee payment requested: ${rawVal}`;
      plainExplanation =
        'The message instructs payment of a specific amount. Official educational dues should be corroborated by an itemized ledger charge in your verified student portal.';
      whatIsUnverified =
        'The message claims this fee is owed, but message text cannot prove an active institutional invoice exists on your student balance.';
    }

    observations.push({
      id: `obs-amount-${observations.length + 1}`,
      category: 'payment',
      label,
      excerpt: rawVal,
      startIndex,
      endIndex,
      plainExplanation,
      whatIsUnverified
    });
  }

  // Suffix currencies: e.g. "500 dollars", "1,25,000 rupees"
  const currencySuffixRegex = /\b([^\s;!?()]+)\s*(dollars|rupees|euros|bucks)\b/gi;
  while ((match = currencySuffixRegex.exec(text)) !== null) {
    const candidate = match[1];
    if (!isValidCurrencyNumber(candidate)) continue;

    const rawVal = match[0].trim();
    const startIndex = match.index;
    const endIndex = match.index + rawVal.length;

    if (!extractedAmounts.includes(rawVal)) {
      extractedAmounts.push(rawVal);
    }

    const sentence = getSentenceAt(text, startIndex, endIndex);
    const isCreditOrScholarship = /\b(?:scholarship|credit|grant|waiver|refund|aid)\b/i.test(sentence);
    const isExplicitPaymentRequest =
      /\b(?:pay|remit|transfer|clear(?:ed)?(?:\s+(?:the\s+)?dues)?|send\s+payment)\b/i.test(sentence) && !isCreditOrScholarship;

    let label = `Amount mentioned: ${rawVal}`;
    let plainExplanation =
      'The message mentions a monetary figure. In an official educational billing context, amounts may represent charges, credits, balances, or estimates. Always verify against your official student portal.';
    let whatIsUnverified =
      'The message text states this figure, but message content alone cannot prove an official charge or credit exists on your student balance.';

    if (isCreditOrScholarship) {
      label = `Amount mentioned: ${rawVal}`;
      plainExplanation =
        'The message mentions an amount associated with a scholarship, credit, or waiver. Credits reduce what you owe rather than creating a new payment obligation. Confirm your ledger breakdown in your official student portal.';
      whatIsUnverified =
        'Message text alone cannot confirm whether a scholarship, fee credit, or adjustment has actually posted to your institutional student balance.';
    } else if (isExplicitPaymentRequest) {
      label = `Fee payment requested: ${rawVal}`;
      plainExplanation =
        'The message requests payment of a specific amount. Official educational dues should be corroborated by an itemized ledger charge in your verified student portal.';
      whatIsUnverified =
        'The message claims this fee is owed, but text in an email or SMS cannot prove an active institutional invoice exists on your student balance.';
    }

    observations.push({
      id: `obs-amount-${observations.length + 1}`,
      category: 'payment',
      label,
      excerpt: rawVal,
      startIndex,
      endIndex,
      plainExplanation,
      whatIsUnverified
    });
  }

  // 2. Detect External Links & URLs (Scoped to Sentence Context)
  const urlRegex = /(?:https?:\/\/|www\.)[^\s/$.?#].[^\s]*|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:net|org|com|info|top|xyz|cc|biz|ru|site|link|me|clearance|services|invalid)[^\s]*/gi;
  while ((match = urlRegex.exec(text)) !== null) {
    const rawUrl = match[0].replace(/[.,;:)]+$/, '');
    const startIndex = match.index;
    const endIndex = startIndex + rawUrl.length;

    if (!extractedDestinations.includes(rawUrl)) {
      extractedDestinations.push(rawUrl);
    }

    const sentence = getSentenceAt(text, startIndex, endIndex);
    const urlHasPaymentKeyword = /(?:pay|payment|bursar|clearance|checkout|settle|cashier|billing)/i.test(rawUrl);
    const sentenceDirectsPayment =
      /\b(?:pay|payment|remit|settle|clear\s+dues|checkout|billing)\b/i.test(sentence) &&
      /\b(?:at|via|through|using|to|link|url|here)\b/i.test(sentence);

    const isPaymentDestination = urlHasPaymentKeyword || sentenceDirectsPayment;

    if (isPaymentDestination) {
      observations.push({
        id: `obs-url-${observations.length + 1}`,
        category: 'unverified_link',
        label: `Message links to a payment destination: ${rawUrl}`,
        excerpt: rawUrl,
        startIndex,
        endIndex,
        plainExplanation:
          'The message directs payment or fee settlement through this external link. FeePause strictly isolates pasted links and will never use sender-supplied destinations as verification routes.',
        whatIsUnverified:
          'The link destination is provided by the sender, not your institution’s authenticated portal. Unverified messages frequently direct students to imitation payment gateways.'
      });
    } else {
      observations.push({
        id: `obs-url-${observations.length + 1}`,
        category: 'unverified_link',
        label: `Link found: ${rawUrl}`,
        excerpt: rawUrl,
        startIndex,
        endIndex,
        plainExplanation:
          'The message contains an external web link. FeePause strictly isolates pasted links and will never use sender-supplied destinations as an independent verification route.',
        whatIsUnverified:
          'The destination was provided in the message, not from your institution’s verified directory or authenticated student portal.'
      });
    }
  }

  // 3. Detect Sender Contact Handles (Emails)
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  while ((match = emailRegex.exec(text)) !== null) {
    const handle = match[0];
    const startIndex = match.index;
    const endIndex = startIndex + handle.length;

    if (!extractedDestinations.includes(handle)) {
      extractedDestinations.push(handle);
    }
    observations.push({
      id: `obs-handle-${observations.length + 1}`,
      category: 'contact_handle',
      label: `Sender-provided contact address: ${handle}`,
      excerpt: handle,
      startIndex,
      endIndex,
      plainExplanation:
        'The sender provides an email address or direct contact route for verification or inquiry. Anyone can register an address containing terms like "bursar" or "helpdesk".',
      whatIsUnverified:
        'The address is not authenticated by your institution. Cross-reference contact details with your official campus department directory.'
    });
  }

  // 4. Detect Deadlines & Time Pressure (Distinguish Overdue vs Stated Deadline vs Short Deadline)
  // Overdue status: "past due" or "overdue"
  const overdueRegex = /\b(?:past\s+due|overdue)\b/gi;
  while ((match = overdueRegex.exec(text)) !== null) {
    const phrase = match[0];
    if (!extractedDeadlines.includes(phrase)) {
      extractedDeadlines.push(phrase);
    }
    observations.push({
      id: `obs-urgency-${observations.length + 1}`,
      category: 'urgency',
      label: `Overdue status stated: "${phrase}"`,
      excerpt: phrase,
      startIndex: match.index,
      endIndex: match.index + phrase.length,
      plainExplanation:
        'The message states that a fee or assessment is past due. Official overdue balances should be corroborated by checking your account balance in your institution’s authenticated student portal.',
      whatIsUnverified:
        'The message claims the fee is overdue, but text in an email or SMS cannot prove whether an overdue balance actually exists on your institutional student account.'
    });
  }

  // Stated deadlines: "due by Friday", "by Friday", "deadline: ..."
  const statedDeadlineRegex = /\b(?:due\s+by\s+[^\n.,;]+|by\s+(?:today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.))|deadline:\s*[^.\n,;]+|due\s+date:\s*[^.\n,;]+)\b/gi;
  while ((match = statedDeadlineRegex.exec(text)) !== null) {
    const phrase = match[0];
    if (!extractedDeadlines.includes(phrase)) {
      extractedDeadlines.push(phrase);
    }
    observations.push({
      id: `obs-urgency-${observations.length + 1}`,
      category: 'urgency',
      label: `Stated deadline: "${phrase}"`,
      excerpt: phrase,
      startIndex: match.index,
      endIndex: match.index + phrase.length,
      plainExplanation:
        'The message states a payment or compliance deadline. Routine administrative notices often specify due dates, which should be verified against your official student portal or academic calendar.',
      whatIsUnverified:
        'The stated deadline is provided by the sender. Confirm the actual due date in your authenticated student account before taking action.'
    });
  }

  // Short deadlines / time pressure: "within 2 hours", "immediately", "urgent notice"
  const shortDeadlineRegex = /\b(?:within\s+\d+\s+(?:hours?|hrs?|minutes?|days?)|immediate(?:ly)?|urgent(?:\s+notice)?|final\s+(?:notice|warning)|act\s+now)\b/gi;
  while ((match = shortDeadlineRegex.exec(text)) !== null) {
    const phrase = match[0];
    if (!extractedDeadlines.includes(phrase)) {
      extractedDeadlines.push(phrase);
    }
    observations.push({
      id: `obs-urgency-${observations.length + 1}`,
      category: 'urgency',
      label: `Short deadline stated: "${phrase}"`,
      excerpt: phrase,
      startIndex: match.index,
      endIndex: match.index + phrase.length,
      plainExplanation:
        'The message specifies an urgent or immediate timeframe. Official university administrative actions follow documented academic schedules rather than arbitrary short countdowns.',
      whatIsUnverified:
        'Urgent countdowns delivered via message cannot be verified from message text alone. Check your official student portal for any real institutional deadlines.'
    });
  }

  // 5. Detect Holds and Sanction Claims
  // Hold mentioned: "administrative hold", "registration hold", "account hold"
  const holdRegex = /\b(?:administrative\s+hold|registration\s+hold|account\s+hold)\b/gi;
  while ((match = holdRegex.exec(text)) !== null) {
    const phrase = match[0];
    const startIndex = match.index;
    const endIndex = startIndex + phrase.length;
    const sentence = getSentenceAt(text, startIndex, endIndex);

    const isNegated = /\b(?:no\s+(?:administrative\s+|registration\s+|account\s+)?hold|not\s+on\s+hold|without\s+a\s+hold|lifted|cleared|removed)\b/i.test(
      sentence
    );

    observations.push({
      id: `obs-sanction-${observations.length + 1}`,
      category: 'sanction_threat',
      label: `Administrative hold mentioned: "${phrase}"`,
      excerpt: phrase,
      startIndex,
      endIndex,
      plainExplanation: isNegated
        ? 'The message mentions an administrative hold in a neutral or clearing context. Official student standing is maintained within your institution’s student records system.'
        : 'The message mentions an administrative hold. Holds can only be placed, viewed, or cleared through your institution’s authenticated student records system.',
      whatIsUnverified:
        'A message mentioning hold status cannot alter or verify your actual enrollment standing. Confirm your official status directly in your student portal.'
    });
  }

  // Explicit cancellation or sanction claims: "enrollment will be cancelled", "freeze your enrollment", etc.
  const cancellationRegex = /\b(?:(?:your\s+)?enrollment\s+will\s+be\s+cancel(?:led|ed)|cancel(?:led|ed|ing)?\s+(?:your\s+)?enrollment|freeze\s+(?:your\s+)?(?:course\s+)?enrollment|prevent\s+registration|access\s+to\s+online\s+exams|delay\s+diploma|cannot\s+be\s+reversed)\b/gi;
  while ((match = cancellationRegex.exec(text)) !== null) {
    const phrase = match[0];
    const startIndex = match.index;
    const endIndex = startIndex + phrase.length;
    const sentence = getSentenceAt(text, startIndex, endIndex);

    const isConditional = /\b(?:or|unless|if\s+not|otherwise|fail(?:ure)?\s+to\s+pay)\b/i.test(sentence);

    observations.push({
      id: `obs-sanction-${observations.length + 1}`,
      category: 'sanction_threat',
      label: isConditional
        ? `Conditional cancellation claim: "${phrase}"`
        : `Claimed academic consequence: "${phrase}"`,
      excerpt: phrase,
      startIndex,
      endIndex,
      plainExplanation:
        'The message claims an academic consequence such as enrollment cancellation or course freeze. Official academic actions follow formal university procedures and can only be enacted within your institution’s official records system.',
      whatIsUnverified:
        'Text in an incoming message cannot cancel your enrollment. Verify your actual standing and any pending tasks directly in your student portal.'
    });
  }

  // 6. Detect Credentials, OTP, and PINs (Sentence-Scoped Negation & Requests)
  const credentialRegex = /\b(?:otp|one-time\s+password|confirmation\s+otp|6-digit\s+(?:payment\s+)?confirmation|pin\b|password|transaction\s+reference|screenshot\s+of\s+payment)\b/gi;
  while ((match = credentialRegex.exec(text)) !== null) {
    const credPhrase = match[0];
    const startIndex = match.index;
    const endIndex = startIndex + credPhrase.length;
    const lowerPhrase = credPhrase.toLowerCase();

    const sentence = getSentenceAt(text, startIndex, endIndex);

    const hasNegation = /\b(?:never|do\s+not|don't|should\s+not|will\s+never|beware|refrain|keep\s+(?:your\s+)?(?:secret|private|safe)|strictly\s+prohibited|no)\b/i.test(
      sentence
    );
    const hasRequestVerb = /\b(?:enter|submit|provide|share|send|forward|reply\s+with|fill\s+in|input|give|verify\s+(?:your\s+account\s+)?with)\b/i.test(
      sentence
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
        label: `Request for ${credType}: "${credPhrase}"`,
        excerpt: credPhrase,
        startIndex,
        endIndex,
        plainExplanation:
          'The message asks you to provide, share, or verify an authentication code or credential. Legitimate college billing departments and official portals will never ask you to disclose or forward an OTP via email, SMS, or external forms.',
        whatIsUnverified:
          'University financial offices will never request your OTP or security PIN through message text. Never transmit one-time codes.'
      });
    } else {
      observations.push({
        id: `obs-cred-${observations.length + 1}`,
        category: 'credential_otp',
        label: `${credType} mentioned`,
        excerpt: credPhrase,
        startIndex,
        endIndex,
        plainExplanation:
          'The message mentions an authentication credential or security code. If the message advises caution, that is standard security advice. Official college portals will never ask you to disclose or forward an OTP.',
        whatIsUnverified:
          'The presence of security advisory text or credential mentions does not prove the message itself originated from an official university office.'
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
