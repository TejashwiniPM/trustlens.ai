export type RiskLevel = 'low' | 'moderate' | 'high';
export type Severity = 'low' | 'medium' | 'high';

export type CommunicationCategory =
  | 'auto'
  | 'job_offer'
  | 'financial_payment'
  | 'account_security'
  | 'promotional'
  | 'delivery_shopping'
  | 'social_personal'
  | 'other';

export interface RiskIndicator {
  category: string;
  severity: Severity;
  evidence: string;
  explanation: string;
  riskFactor?: string;
}

export interface DetectedSignals {
  urls: string[];
  phones: string[];
  emails: string[];
  amounts: string[];
  hasUrgency: boolean;
  urgencyPhrases: string[];
  hasCredentialRequest: boolean;
  credentialKeywords: string[];
  hasPaymentRequest: boolean;
  paymentKeywords: string[];
  unrealisticPhrases: string[];
}

export interface KeyQuote {
  quote: string;
  tag: string;
  severity: Severity;
}

export interface AnalysisReport {
  id: string;
  timestamp: string;
  rawText: string;
  selectedCategory: string;
  inferredCategory: string;
  risk_level: RiskLevel;
  risk_score: number; // 0 to 100
  summary: string;
  risk_indicators: RiskIndicator[];
  detected_signals: DetectedSignals;
  key_quotes: KeyQuote[];
  verification_steps: string[];
  recommended_action: string;
  limitations: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SampleScenario {
  id: string;
  title: string;
  category: CommunicationCategory;
  categoryLabel: string;
  expectedRisk: RiskLevel;
  description: string;
  text: string;
}
