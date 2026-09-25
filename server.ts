import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { detectSignals, generateHeuristicReport } from './src/utils/signalDetector';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json({ limit: '5mb' }));

// Lazy GoogleGenAI client helper
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Timeout helper to avoid hanging on slow network or upstream throttling
function callWithTimeout<T>(promise: Promise<T>, timeoutMs = 12000): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('AI request timed out')), timeoutMs)
  );
  return Promise.race([promise, timeoutPromise]);
}

// Direct ZIP download endpoint
app.get('/api/download-zip', (req, res) => {
  const zipPath = path.resolve(process.cwd(), 'public/trustlens-ai.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="trustlens-ai.zip"');
    res.sendFile(zipPath);
  } else {
    res.status(404).send('ZIP file not found');
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY',
  });
});

// Analyze endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { text, category } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide communication text to analyze.' });
    }

    const cleanedText = text.trim();
    const detectedSignals = detectSignals(cleanedText);
    const selectedCategory = category || 'auto';

    const ai = getAiClient();

    if (ai) {
      try {
        const prompt = `You are TrustLens AI, an objective digital trust and safety assistant.
Analyze the following user-submitted message for risk indicators and provide structured verification guidance.

COMMUNICATION TYPE SPECIFIED BY USER: ${selectedCategory}
DETECTED STRUCTURAL SIGNALS:
- URLs: ${JSON.stringify(detectedSignals.urls)}
- Phone Numbers: ${JSON.stringify(detectedSignals.phones)}
- Email Addresses: ${JSON.stringify(detectedSignals.emails)}
- Currency/Amounts: ${JSON.stringify(detectedSignals.amounts)}
- Urgency Cues: ${JSON.stringify(detectedSignals.urgencyPhrases)}
- Credential Requests: ${JSON.stringify(detectedSignals.credentialKeywords)}
- Payment Phrases: ${JSON.stringify(detectedSignals.paymentKeywords)}
- Unrealistic Claims: ${JSON.stringify(detectedSignals.unrealisticPhrases)}

SUBMITTED COMMUNICATION TEXT:
"""
${cleanedText}
"""

CORE GUIDELINES:
1. Don't simply declare if something is definitely a scam or safe. Present an objective risk assessment.
2. Examine 6 key dimensions:
   - Urgency and pressure (artificial deadlines, threat of closure/loss)
   - Financial requests (registration fees, deposits, crypto, wire transfers, advance fees)
   - Sensitive information (OTPs, passwords, PINs, banking info, government IDs)
   - Identity & impersonation (claims to represent companies, banks, couriers, recruiters, family)
   - Unrealistic promises (guaranteed returns, instant jobs, lottery prizes)
   - Links & contact info (unfamiliar domains, mismatched addresses)
3. Connect every indicator to real evidence from the text. DO NOT invent facts not in the message.
4. If the message is a standard, normal communication (e.g., standard calendar invite, friend message, regular order confirmation with no red flags), calibrate risk_level as "low" and risk_score < 30.
5. Provide 4 to 6 clear, practical verification steps tailored specifically to the risks identified.
6. Provide a concise recommended action.

Return valid JSON adhering strictly to this format:
{
  "risk_level": "low" | "moderate" | "high",
  "risk_score": number (0 to 100),
  "summary": "Short 2-3 sentence overview explaining why it is low, moderate, or high risk.",
  "inferredCategory": "Job Offer" | "Financial/Payment" | "Account/Security" | "Promotional" | "Delivery/Shopping" | "Social/Personal" | "Other",
  "risk_indicators": [
    {
      "category": "Category name",
      "severity": "high" | "medium" | "low",
      "evidence": "Concrete snippet or observation from the submitted text",
      "explanation": "Why this signal matters and why it warrants attention"
    }
  ],
  "key_quotes": [
    {
      "quote": "Exact phrase from message",
      "tag": "Short label",
      "severity": "high" | "medium" | "low"
    }
  ],
  "verification_steps": [
    "1. Step description...",
    "2. Step description..."
  ],
  "recommended_action": "Clear recommendation on what to do (e.g. avoid taking the requested action until verified).",
  "limitations": "This assessment is an AI-assisted analysis of observable risk signals, not a definitive legal determination. Always verify independently."
}`;

        const response = await callWithTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          })
        );

        const rawJson = response.text ? response.text.trim() : '';
        if (rawJson) {
          const parsed = JSON.parse(rawJson);

          const result = {
            id: 'tl-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
            timestamp: new Date().toISOString(),
            rawText: cleanedText,
            selectedCategory,
            inferredCategory: parsed.inferredCategory || 'General Communication',
            risk_level: parsed.risk_level || 'moderate',
            risk_score: typeof parsed.risk_score === 'number' ? parsed.risk_score : 50,
            summary: parsed.summary || 'Analysis completed.',
            risk_indicators: Array.isArray(parsed.risk_indicators) ? parsed.risk_indicators : [],
            detected_signals: detectedSignals,
            key_quotes: Array.isArray(parsed.key_quotes) ? parsed.key_quotes : [],
            verification_steps: Array.isArray(parsed.verification_steps) ? parsed.verification_steps : [],
            recommended_action: parsed.recommended_action || 'Verify claims independently before taking action.',
            limitations: parsed.limitations || 'This assessment does not confirm whether the communication is fraudulent.',
          };

          return res.json(result);
        }
      } catch (aiErr) {
        console.warn('Gemini API call failed, using heuristic signal engine fallback:', aiErr);
      }
    }

    const fallback = generateHeuristicReport(cleanedText, selectedCategory);
    const result = {
      id: 'tl-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
      rawText: cleanedText,
      selectedCategory,
      ...fallback,
      detected_signals: detectedSignals,
    };

    return res.json(result);
  } catch (err: any) {
    console.error('Error in /api/analyze:', err);
    res.status(500).json({ error: 'Analysis failed. Please check the input and try again.' });
  }
});

// Follow-up Q&A endpoint ("Ask TrustLens" on specific report)
app.post('/api/chat', async (req, res) => {
  try {
    const { question, originalText, analysis, history } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const ai = getAiClient();

    if (ai) {
      const chatPrompt = `You are TrustLens AI, an objective digital trust & safety verification assistant.
The user is asking a follow-up question about an analysis report of a suspicious or uncertain message they received.

ORIGINAL MESSAGE ANALYZED:
"""
${originalText || ''}
"""

PREVIOUS RISK ASSESSMENT:
- Risk Level: ${analysis?.risk_level || 'Unknown'}
- Risk Score: ${analysis?.risk_score ?? ''}/100
- Summary: ${analysis?.summary || ''}
- Key Indicators: ${JSON.stringify(analysis?.risk_indicators || [])}
- Recommended Action: ${analysis?.recommended_action || ''}

CONVERSATION HISTORY:
${(history || [])
  .map((m: any) => `${m.role === 'user' ? 'User' : 'TrustLens'}: ${m.content}`)
  .join('\n')}

USER'S QUESTION:
"${question}"

INSTRUCTIONS:
1. Answer strictly in the context of the original message and the analysis findings.
2. Be practical, reassuring, and clear. Avoid cybersecurity jargon.
3. Don't claim 100% certainty about fraud, but advise safe verification steps.
4. Give specific, protective advice (e.g. what exact questions to ask the sender, what never to share, or how to locate the official website).
5. Keep your response concise (2-4 clear paragraphs or bullet points).`;

      const response = await callWithTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: chatPrompt,
        })
      );

      const reply = response.text || 'I could not generate a response. Please review the verification checklist above.';
      return res.json({ reply });
    }

    // Heuristic fallback for chat
    const qLower = question.toLowerCase();
    let fallbackReply = '';
    if (qLower.includes('why') || qLower.includes('flag')) {
      fallbackReply = `TrustLens flagged this communication because it triggered observable risk indicators such as payment demands, urgency, or unfamiliar contact information. These tactics are designed to push recipients into quick decisions before verifying facts.`;
    } else if (qLower.includes('first') || qLower.includes('verify')) {
      fallbackReply = `Your very first step should be to look up the organization independently through their verified official website or known public customer support line. Never use the phone numbers, email addresses, or links contained inside the message itself.`;
    } else if (qLower.includes('not share') || qLower.includes('sensitive')) {
      fallbackReply = `Never share one-time passwords (OTPs), bank account PINs, credit card CVVs, net banking passwords, or personal identity numbers in response to unsolicited messages.`;
    } else {
      fallbackReply = `Based on our analysis, proceed with extreme caution. Verify the sender's identity through official channels outside of this message, and do not submit payments, personal credentials, or click on unverified links.`;
    }

    return res.json({ reply: fallbackReply });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    res.status(500).json({ error: 'Chat service error. Please try again.' });
  }
});

// Dedicated Multi-turn Gemini Chatbot Endpoint
// Models:
// - gemini-3.1-pro-preview (complex tasks)
// - gemini-3.5-flash (general tasks)
// - gemini-3.1-flash-lite (fast tasks)
app.post('/api/chatbot', async (req, res) => {
  try {
    const { messages, roleId, modelChoice } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        reply: "Gemini AI is currently not available. Please verify that your GEMINI_API_KEY environment variable is configured in Settings > Secrets.",
      });
    }

    // Select system instruction based on role
    let systemInstruction = "You are TrustLens AI, a specialized Digital Trust, Scam Prevention, and Cyber Safety Advisor.";
    if (roleId === 'forensic') {
      systemInstruction = `You are a Senior Cyber-Fraud Forensic Investigator for TrustLens AI.
Your role: Rigorously dissect suspicious communications, emails, job offers, cryptocurrency schemes, invoices, and bank alerts.
Analyze psychological pressure points, linguistic inconsistencies, domain spoofing tactics, and payment routing.
Always provide concrete independent verification actions and advise zero trust toward unverified sender claims.`;
    } else if (roleId === 'victim_support') {
      systemInstruction = `You are the TrustLens Incident Recovery & Consumer Rights Counselor.
Your role: Support individuals who suspect they may have interacted with or sent funds/data to a scammer.
Provide clear, calm, prioritized triage:
1. Immediate financial containment (contact bank/card issuer/UPI provider immediately to freeze transactions).
2. Credential lockdown (change passwords, invalidate active sessions, revoke permissions).
3. Evidence preservation (keep screenshots, message logs, transaction references).
4. Official reporting channels (FTC, IC3, Action Fraud, National Cyber Crime portals).
Be compassionate, structured, and avoid victim-blaming.`;
    } else if (roleId === 'screener') {
      systemInstruction = `You are the TrustLens Rapid Message Screener.
Your role: Rapidly evaluate short SMS, WhatsApp, Telegram, or email excerpts.
Directly identify red flags: artificial urgency, OTP requests, gift cards, unfamiliar links, or fake authority claims.
Provide short, punchy verdicts with the single most important safety check to do first.`;
    }

    // Select model according to user specification and skill guidelines
    let model = 'gemini-3.8-flash';
    if (modelChoice === 'gemini-3.1-pro-preview') {
      model = 'gemini-3.1-pro-preview';
    } else if (modelChoice === 'gemini-3.1-flash-lite') {
      model = 'gemini-3.1-flash-lite';
    } else {
      model = 'gemini-3.8-flash';
    }

    // Format contents array for multi-turn chat
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    try {
      const response = await callWithTimeout(
        ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
          },
        })
      );

      const reply = response.text || 'I could not generate a response. Please try asking again.';
      return res.json({ reply, modelUsed: model });
    } catch (modelErr: any) {
      console.warn(`Model ${model} failed, falling back to gemini-3.8-flash:`, modelErr);
      const fallbackResponse = await callWithTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
          },
        })
      );
      const reply = fallbackResponse.text || 'Please verify communications through independent official channels before taking action.';
      return res.json({ reply, modelUsed: 'gemini-3.8-flash' });
    }
  } catch (err: any) {
    console.error('Error in /api/chatbot:', err);
    res.status(200).json({
      reply: 'TrustLens Advisor suggests: Always verify unexpected messages through verified channels outside this communication. Never share passwords, OTPs, or send money based on urgent demands.',
      modelUsed: 'heuristic-fallback',
    });
  }
});

// Setup WebSocket Server for Real-Time Live API (gemini-3.8-live)
const wss = new WebSocketServer({ server, path: '/api/live' });

wss.on('connection', async (clientWs: WebSocket) => {
  const ai = getAiClient();
  if (!ai) {
    clientWs.send(JSON.stringify({ error: 'Gemini API is not configured on the server.' }));
    clientWs.close();
    return;
  }

  let session: any = null;

  try {
    session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: `You are TrustLens Voice Advisor, a voice-enabled digital trust and scam prevention expert.
Speak clearly, warmly, and concisely in short conversational sentences suitable for audio listening.
When a user describes a suspicious text, phone call, email, or investment offer, tell them immediately if it exhibits common scam patterns, explain why calmly, and guide them on what to verify through official channels before acting.`,
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ audio }));
          }
          if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }
        },
        onclose: () => {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.close();
          }
        },
      },
    });

    clientWs.on('message', (data) => {
      try {
        const payload = JSON.parse(data.toString());
        if (payload.audio && session) {
          session.sendRealtimeInput({
            audio: { data: payload.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (payload.text && session) {
          session.sendRealtimeInput({
            text: payload.text,
          });
        }
      } catch (err) {
        console.error('Error handling WebSocket client message:', err);
      }
    });

    clientWs.on('close', () => {
      if (session) {
        try {
          session.close();
        } catch {}
      }
    });
  } catch (err: any) {
    console.error('Failed to establish Gemini Live API session:', err);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ error: err?.message || 'Live session initialization failed.' }));
      clientWs.close();
    }
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`TrustLens AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
