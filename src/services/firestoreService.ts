import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/error';
import { AnalysisReport } from '../types';

export async function saveAnalysisToFirestore(userId: string, report: AnalysisReport): Promise<void> {
  const sanitizedId = report.id.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const path = `users/${userId}/analyses/${sanitizedId}`;
  const docRef = doc(db, 'users', userId, 'analyses', sanitizedId);

  // Strip complex nested objects if needed or preserve all serializable fields
  const payload = {
    id: sanitizedId,
    userId,
    timestamp: report.timestamp || new Date().toISOString(),
    rawText: report.rawText.slice(0, 50000),
    selectedCategory: report.selectedCategory || 'auto',
    inferredCategory: report.inferredCategory || 'General',
    risk_level: report.risk_level,
    risk_score: report.risk_score,
    summary: (report.summary || '').slice(0, 4000),
    recommended_action: (report.recommended_action || '').slice(0, 2000),
    verification_steps: report.verification_steps || [],
    risk_indicators: (report.risk_indicators || []).map((ind) => ({
      category: ind.category,
      severity: ind.severity,
      evidence: ind.evidence,
      explanation: ind.explanation,
    })),
    detected_signals: {
      urls: report.detected_signals?.urls || [],
      phones: report.detected_signals?.phones || [],
      emails: report.detected_signals?.emails || [],
      amounts: report.detected_signals?.amounts || [],
      hasUrgency: !!report.detected_signals?.hasUrgency,
      urgencyPhrases: report.detected_signals?.urgencyPhrases || [],
      hasCredentialRequest: !!report.detected_signals?.hasCredentialRequest,
      credentialKeywords: report.detected_signals?.credentialKeywords || [],
      hasPaymentRequest: !!report.detected_signals?.hasPaymentRequest,
      paymentKeywords: report.detected_signals?.paymentKeywords || [],
      unrealisticPhrases: report.detected_signals?.unrealisticPhrases || [],
    },
    key_quotes: (report.key_quotes || []).map((kq) => ({
      quote: kq.quote,
      tag: kq.tag,
      severity: kq.severity,
    })),
    limitations: report.limitations || '',
  };

  try {
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path, auth.currentUser);
  }
}

export function subscribeToUserAnalyses(
  userId: string,
  onData: (reports: AnalysisReport[]) => void,
  onError?: (err: Error) => void
): () => void {
  const collectionPath = `users/${userId}/analyses`;
  const q = query(collection(db, 'users', userId, 'analyses'), orderBy('timestamp', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const reports: AnalysisReport[] = [];
      snapshot.forEach((d) => {
        reports.push(d.data() as AnalysisReport);
      });
      onData(reports);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, collectionPath, auth.currentUser);
      } catch (err: any) {
        if (onError) onError(err);
      }
    }
  );
}

export async function deleteAnalysisFromFirestore(userId: string, analysisId: string): Promise<void> {
  const sanitizedId = analysisId.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const path = `users/${userId}/analyses/${sanitizedId}`;
  const docRef = doc(db, 'users', userId, 'analyses', sanitizedId);

  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path, auth.currentUser);
  }
}

export async function clearAllAnalysesFromFirestore(userId: string): Promise<void> {
  const collectionPath = `users/${userId}/analyses`;
  try {
    const snapshot = await getDocs(collection(db, 'users', userId, 'analyses'));
    const deletes = snapshot.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletes);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, collectionPath, auth.currentUser);
  }
}
