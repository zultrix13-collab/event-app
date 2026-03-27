import crypto from 'crypto';

const SECRET_KEY = process.env.DIGITAL_ID_SECRET ?? 'change-me-in-production';
const EVENT_ID = process.env.NEXT_PUBLIC_EVENT_ID ?? 'event-2026';

export interface DigitalIdPayload {
  userId: string;
  role: string;
  eventId: string;
  issuedAt: number;
  expiresAt: number;
}

export function generateDigitalIdPayload(
  userId: string,
  role: string
): {
  payload: string;
  signature: string;
  expiresAt: Date;
} {
  const now = Date.now();
  const expiresAt = now + 15 * 60 * 1000; // 15 minutes rolling

  const data: DigitalIdPayload = {
    userId,
    role,
    eventId: EVENT_ID,
    issuedAt: now,
    expiresAt,
  };

  const payloadStr = JSON.stringify(data);
  const encoded = Buffer.from(payloadStr).toString('base64');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(encoded).digest('hex');

  return {
    payload: encoded,
    signature,
    expiresAt: new Date(expiresAt),
  };
}

export function verifyDigitalId(
  payload: string,
  signature: string
): { valid: boolean; data?: DigitalIdPayload; error?: string } {
  try {
    const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');

    if (expectedSig !== signature) {
      return { valid: false, error: 'Invalid signature' };
    }

    const data: DigitalIdPayload = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));

    if (Date.now() > data.expiresAt) {
      return { valid: false, error: 'Digital ID expired' };
    }

    return { valid: true, data };
  } catch {
    return { valid: false, error: 'Invalid payload' };
  }
}
