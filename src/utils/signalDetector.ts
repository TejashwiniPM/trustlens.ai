import { DetectedSignals, RiskIndicator, KeyQuote, RiskLevel } from '../types';

export function detectSignals(rawText: string): DetectedSignals {
  const text = rawText || '';

  // URLs
  const urlRegex = /(?:https?:\/\/|www\.)[^\s/$.?#].[^\s]*/gi;
  const urls = Array.from(new Set(text.match(urlRegex) || []));

  // Phone numbers (e.g. +91 98765 43210, (555) 123-4567, 07911 123456)
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
  const rawPhones = text.match(phoneRegex) || [];
  // Filter out short numbers like years (2024) or small digits
  const phones = Array.from(new Set(rawPhones.filter(p => p.replace(/\D/g, '').length >= 7)));

  // Emails
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const emails = Array.from(new Set(text.match(emailRegex) || []));

  // Currency & Amounts
  const amountRegex = /(?:[$€£₹]|USDT|BTC|INR|USD|GBP|EUR)\s?[\d,]+(?:\.\d{1,2})?|\b[\d,]+(?:\.\d{1,2})?\s?(?:USDT|BTC|dollars|rupees|pounds|euros)\b/gi;
  const amounts = Array.from(new Set(text.match(amountRegex) || []));

  // Urgency phrases
  const urgencyPatterns = [
    /immediately/i,
    /within \d+\s?(?:minutes|mins|hours|days)/i,
    /today/i,
    /urgent/i,
    /act now/i,
    /limited time/i,
    /last warning/i,
    /account (?:will be )?(?:closed|blocked|suspended|terminated)/i,
    /respond within/i,
    /expires in/i,
    /forfeited/i,
    /deadline/i,
    /at midnight/i,
    /in \d+ hours/i,
  ];

  const urgencyPhrases: string[] = [];
  urgencyPatterns.forEach(pattern => {
    const match = text.match(pattern);
    if (match) urgencyPhrases.push(match[0]);
  });

  // Credential requests
  const credentialPatterns = [
    /\bOTP\b/i,
    /\bpassword\b/i,
    /\bPIN\b/i,
    /\bCVV\b/i,
    /\bPAN\b/i,
    /\bSSN\b/i,
    /\bAadhaar\b/i,
    /\blogin details\b/i,
    /\bcredentials\b/i,
    /\bverification code\b/i,
    /\bbank details\b/i,
    /\baccount details\b/i,
    /\bpasscode\b/i,
  ];

  const credentialKeywords: string[] = [];
  credentialPatterns.forEach(pattern => {
    const match = text.match(pattern);
    if (match) credentialKeywords.push(match[0]);
  });

  // Payment requests
  const paymentPatterns = [
    /registration fee/i,
    /processing fee/i,
    /deposit/i,
    /upfront fee/i,
    /advance payment/i,
    /wire transfer/i,
    /UPI to/i,
    /pay (?:via|through|to)/i,
    /gift card/i,
    /cryptocurrency/i,
    /USDT/i,
    /sort code/i,
    /redelivery fee/i,
    /purchase/i,
  ];

  const paymentKeywords: string[] = [];
  paymentPatterns.forEach(pattern => {
    const match = text.match(pattern);
    if (match) paymentKeywords.push(match[0]);
  });

  // Unrealistic promises
  const unrealisticPatterns = [
    /guaranteed (?:income|payouts|returns|employment|profit|daily)/i,
    /100% money-back/i,
    /zero risk/i,
    /earn \$\d+/i,
    /unexpected prize/i,
    /lottery winner/i,
    /\+?\d+%\s?(?:profit|return)/i,
    /selected for (?:an exciting|a high paying)/i,
    /work-from-home.*₹\d+/i,
  ];

  const unrealisticPhrases: string[] = [];
  unrealisticPatterns.forEach(pattern => {
    const match = text.match(pattern);
    if (match) unrealisticPhrases.push(match[0]);
  });

  return {
    urls,
    phones,
    emails,
    amounts,
    hasUrgency: urgencyPhrases.length > 0,
    urgencyPhrases: Array.from(new Set(urgencyPhrases)),
    hasCredentialRequest: credentialKeywords.length > 0,
    credentialKeywords: Array.from(new Set(credentialKeywords)),
    hasPaymentRequest: paymentKeywords.length > 0 || amounts.length > 0,
    paymentKeywords: Array.from(new Set(paymentKeywords)),
    unrealisticPhrases: Array.from(new Set(unrealisticPhrases)),
  };
}

/**
 * Fallback heuristic generator in case Gemini API is offline or not configured.
 * This guarantees the user still receives an evidence-based, structured report.
 */
export function generateHeuristicReport(
  rawText: string,
  category: string
): {
  risk_level: RiskLevel;
  risk_score: number;
  summary: string;
  inferredCategory: string;
  risk_indicators: RiskIndicator[];
  key_quotes: KeyQuote[];
  verification_steps: string[];
  recommended_action: string;
  limitations: string;
} {
  const signals = detectSignals(rawText);
  const indicators: RiskIndicator[] = [];
  const keyQuotes: KeyQuote[] = [];

  let riskScore = 15; // baseline

  // 1. Payment check
  if (signals.paymentKeywords.length > 0 || (signals.amounts.length > 0 && /fee|pay|deposit|transfer/i.test(rawText))) {
    riskScore += 35;
    const paymentText = signals.paymentKeywords.join(', ') || signals.amounts.join(', ');
    indicators.push({
      category: 'Financial Request',
      severity: 'high',
      evidence: `The message references payment or fees: "${paymentText}".`,
      explanation: 'Unsolicited requests for upfront fees, deposits, or non-standard transfers are a primary risk factor. Legitimate employers, banks, and couriers rarely demand direct peer transfers or registration payments.'
    });
    keyQuotes.push({
      quote: paymentText,
      tag: 'Payment Request',
      severity: 'high'
    });
  }

  // 2. Urgency check
  if (signals.hasUrgency) {
    riskScore += 25;
    const urgencyText = signals.urgencyPhrases.join(', ');
    indicators.push({
      category: 'Urgency and Pressure',
      severity: signals.urgencyPhrases.length > 1 ? 'high' : 'medium',
      evidence: `Uses high-pressure timing: "${urgencyText}".`,
      explanation: 'Artificial urgency forces victims to react emotionally without taking time to independently verify details or check credentials with official channels.'
    });
    keyQuotes.push({
      quote: urgencyText,
      tag: 'Urgency & Pressure',
      severity: 'medium'
    });
  }

  // 3. Credential check
  if (signals.hasCredentialRequest) {
    riskScore += 40;
    const credText = signals.credentialKeywords.join(', ');
    indicators.push({
      category: 'Sensitive Information',
      severity: 'high',
      evidence: `Requests authentication or personal details: "${credText}".`,
      explanation: 'Legitimate organizations will never ask for one-time passwords (OTPs), PINs, or sensitive login credentials via unsolicited SMS, email, or chat messages.'
    });
    keyQuotes.push({
      quote: credText,
      tag: 'Sensitive Credentials',
      severity: 'high'
    });
  }

  // 4. Unrealistic promises
  if (signals.unrealisticPhrases.length > 0) {
    riskScore += 25;
    const promiseText = signals.unrealisticPhrases.join(', ');
    indicators.push({
      category: 'Unrealistic Promises',
      severity: 'high',
      evidence: `Prompts exaggerated or guaranteed returns: "${promiseText}".`,
      explanation: 'Claims of guaranteed profit, effortless daily income, or unverified lottery winnings are typical hooks used in advance-fee and investment fraud.'
    });
    keyQuotes.push({
      quote: promiseText,
      tag: 'Unrealistic Promise',
      severity: 'high'
    });
  }

  // 5. Links & Contacts
  if (signals.urls.length > 0) {
    const hasSuspiciousTLD = signals.urls.some(u => /\.vip|\.tk|\.xyz|\.top|\.ru|\.net\.in|-portal|-update/i.test(u));
    if (hasSuspiciousTLD) {
      riskScore += 30;
      indicators.push({
        category: 'Suspicious Links & Destination',
        severity: 'high',
        evidence: `Contains lookalike or non-standard web link: ${signals.urls[0]}`,
        explanation: 'The link domain does not match official institution domains and uses hyphens or suspicious top-level domains often registered for phishing campaigns.'
      });
      keyQuotes.push({
        quote: signals.urls[0],
        tag: 'Suspicious URL',
        severity: 'high'
      });
    } else {
      indicators.push({
        category: 'Links and Contact Information',
        severity: 'low',
        evidence: `Message contains web address: ${signals.urls.join(', ')}`,
        explanation: 'Verify the true destination independently before clicking or submitting credentials.'
      });
    }
  }

  // Determine risk level
  const clampedScore = Math.min(Math.max(riskScore, 10), 95);
  let riskLevel: RiskLevel = 'low';
  if (clampedScore >= 65) {
    riskLevel = 'high';
  } else if (clampedScore >= 35) {
    riskLevel = 'moderate';
  }

  let summary = '';
  let recommendedAction = '';
  if (riskLevel === 'high') {
    summary = 'The communication contains multiple high-attention indicators, including financial demands, artificial urgency, and requests for action that warrant strict independent verification.';
    recommendedAction = 'Avoid taking the requested action, making any payment, or clicking links until the sender and organization have been independently verified through an official source.';
  } else if (riskLevel === 'moderate') {
    summary = 'Some risk indicators were identified. While this does not mean the communication is fraudulent, proceed cautiously and verify the sender before taking action.';
    recommendedAction = 'Proceed cautiously. Do not provide sensitive details or financial commitments until you confirm the request via a known, trusted channel.';
  } else {
    summary = 'No major high-risk indicators were detected in the submitted content. Continue to practice standard digital awareness before sharing sensitive information.';
    recommendedAction = 'Standard caution recommended. Confirm important requests through established official channels if you were not expecting this message.';
  }

  const verificationSteps: string[] = [
    'Verify the organization independently: Navigate to the organization’s known official website or search their verified telephone number directly, rather than using links or contacts from the message.',
    'Verify the sender identity: Confirm whether the sender’s phone number, email domain, or profile strictly matches the legitimate enterprise.',
    'Verify payment requirements: Real employers and service institutions never charge registration fees or require UPI/crypto transfers to release positions or deliveries.',
    'Never share one-time credentials: Banks and government agencies will never ask you to provide an OTP, password, or security PIN over chat or email.',
    'Check destination links: If a link is provided, inspect the domain carefully without clicking or inputting credentials on unfamiliar portals.'
  ];

  return {
    risk_level: riskLevel,
    risk_score: clampedScore,
    summary,
    inferredCategory: category !== 'auto' ? category : 'General Communication',
    risk_indicators: indicators.length > 0 ? indicators : [
      {
        category: 'Baseline Review',
        severity: 'low',
        evidence: 'No overt urgency, payment demands, or credential requests detected in the text.',
        explanation: 'The communication appears routine, though digital safety best practices still apply.'
      }
    ],
    key_quotes: keyQuotes,
    verification_steps: verificationSteps,
    recommended_action: recommendedAction,
    limitations: 'This assessment is an AI and heuristic-driven risk analysis of observable textual signals, not a definitive confirmation of legitimacy or fraud. Always verify independently.'
  };
}
