import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging, type MulticastMessage } from 'firebase-admin/messaging';

function getFirebaseApp() {
  if (getApps().length > 0) return getApps()[0]!;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin credentials not configured');
  }
  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

export async function sendPushToTokens(
  tokens: string[],
  notification: { title: string; body: string },
  data?: Record<string, string>
): Promise<{ successCount: number; failureCount: number }> {
  if (tokens.length === 0) return { successCount: 0, failureCount: 0 };

  const messaging = getMessaging(getFirebaseApp());
  const chunks: string[][] = [];
  for (let i = 0; i < tokens.length; i += 500) {
    chunks.push(tokens.slice(i, i + 500));
  }

  let totalSuccess = 0;
  let totalFailure = 0;
  for (const chunk of chunks) {
    const message: MulticastMessage = {
      tokens: chunk,
      notification,
      data: data ?? {},
      android: { priority: 'high' },
      apns: { headers: { 'apns-priority': '10' } },
    };
    const response = await messaging.sendEachForMulticast(message);
    totalSuccess += response.successCount;
    totalFailure += response.failureCount;
  }
  return { successCount: totalSuccess, failureCount: totalFailure };
}
