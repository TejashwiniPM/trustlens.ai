import { SampleScenario } from '../types';

export const SAMPLE_SCENARIOS: SampleScenario[] = [
  {
    id: 'job-scam',
    title: 'Work-from-Home Job Offer (Upfront Fee)',
    category: 'job_offer',
    categoryLabel: 'Job Offer',
    expectedRisk: 'high',
    description: 'Promised high daily income with an immediate ₹2,999 registration fee deadline.',
    text: `Congratulations! You have been selected for an exciting work-from-home opportunity with Apex Global Logistics. Daily payout: ₹3,500 - ₹5,000 for 2 hours of online data tasks. 

To complete your registration and courier your verification kit, please pay the ₹2,999 registration fee today via UPI to apex-hr-verify@okaxis. 

URGENT: If payment is not completed within 30 minutes, your allocated position will be forfeited and given to the next candidate on the waitlist.`
  },
  {
    id: 'bank-security-phishing',
    title: 'Urgent Bank Account Deactivation Notice',
    category: 'account_security',
    categoryLabel: 'Account/Security',
    expectedRisk: 'high',
    description: 'Threatens immediate account closure and requests PAN and OTP entry on a lookalike link.',
    text: `URGENT ALERT: Dear Customer, your HDFC NetBanking access has been temporarily suspended due to pending KYC verification. 

Your account will be permanently blocked by 11:59 PM tonight unless updated immediately. 

Click here to update your PAN and complete OTP verification: http://hdfc-kyc-update-portal-net.in/secure. Do not share your login with anyone.`
  },
  {
    id: 'package-delivery-fee',
    title: 'Package Delivery Reschedule Link',
    category: 'delivery_shopping',
    categoryLabel: 'Delivery/Shopping',
    expectedRisk: 'high',
    description: 'SMS claiming undelivered parcel requiring a small $1.95 redelivery fee via unfamiliar link.',
    text: `USPS Notice: Your parcel #US-849202 could not be delivered on 09/21 due to incomplete street address info. 

A redelivery fee of $1.95 is required to release your package within 24 hours. Reschedule your delivery now at: https://usps-parcel-redelivery-portal.vip/confirm`
  },
  {
    id: 'crypto-investment',
    title: 'Guaranteed High-Yield Crypto Group',
    category: 'financial_payment',
    categoryLabel: 'Financial/Payment',
    expectedRisk: 'high',
    description: 'Unsolicited WhatsApp message promising 400% weekly return with private Telegram mentor.',
    text: `Hi there! I am Sarah Jenkins, senior analyst at Binance Wealth Club. Our automated AI trading signals generated +420% profit for our VIP members this week. 

Deposit minimum 250 USDT today and receive guaranteed daily payouts of $350 directly to your wallet. Zero risk, 100% money-back guarantee insured by FCA. 

Join our private VIP channel now: t.me/vip_guaranteed_crypto_signals`
  },
  {
    id: 'family-emergency-impersonation',
    title: 'WhatsApp "Lost Phone" Family Impersonation',
    category: 'social_personal',
    categoryLabel: 'Social/Personal',
    expectedRisk: 'high',
    description: 'Claiming to be a child with a new number who urgently needs rent money transferred.',
    text: `Hi mum, dropped my phone in the toilet earlier and the screen is broken. This is my temporary new number until I get it fixed. 

I'm in a huge panic because my rent is due in 2 hours and my banking app won't let me log in on this spare phone without my old SIM. 

Can you please wire £480 to my landlord's account directly? Sort code: 20-45-11, Acct: 83920194. I'll pay you back first thing tomorrow morning!`
  },
  {
    id: 'legitimate-meeting-invite',
    title: 'Legitimate Calendar & Project Sync (Low Risk)',
    category: 'job_offer',
    categoryLabel: 'Job / Professional',
    expectedRisk: 'low',
    description: 'Standard team calendar invite with internal agenda, no financial or credential demands.',
    text: `Hi Alex, 

Following up on yesterday's sprint retrospective. Let's do a 20-minute sync on Thursday at 2:00 PM EST to review the Q4 roadmap slides. 

I've shared the Google Slides deck via your corporate email for review beforehand. Let me know if that time works or feel free to suggest an alternative slot on my calendar.

Best,
Marcus Vance
Product Lead, Design Systems`
  },
  {
    id: 'promotional-retail-sale',
    title: 'Retail Store Promotional Offer (Moderate / Low)',
    category: 'promotional',
    categoryLabel: 'Promotional',
    expectedRisk: 'moderate',
    description: 'Marketing email with discount code, urgency discount banner, but standard retail checkout.',
    text: `Fall Flash Sale! Get 35% off all jackets and footwear at UrbanThreads this weekend only. 

Use coupon code FLASH35 at checkout. Offer expires Sunday at midnight. Free standard shipping on orders over $50. Visit our verified store at urbanthreads.com to shop.`
  }
];
