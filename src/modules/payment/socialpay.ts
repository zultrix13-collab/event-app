/**
 * SocialPay payment client
 * Docs: https://socialpay.mn/developers
 */

const SOCIALPAY_BASE_URL =
  process.env.SOCIALPAY_BASE_URL ?? 'https://sandbox.socialpay.mn';
const SOCIALPAY_TOKEN = process.env.SOCIALPAY_TOKEN ?? '';
const SOCIALPAY_MERCHANT_ID = process.env.SOCIALPAY_MERCHANT_ID ?? '';

export interface SocialPayInvoice {
  invoiceId: string;
  amount: number;
  description: string;
  externalId: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  paymentUrl: string; // redirect URL for web
  qrCode?: string;   // QR string for mobile
}

export async function createSocialPayInvoice(params: {
  amount: number;
  description: string;
  externalId: string;
  returnUrl?: string;
}): Promise<{ success: boolean; data?: SocialPayInvoice; error?: string }> {
  if (!SOCIALPAY_TOKEN) {
    return { success: false, error: 'SocialPay token not configured' };
  }

  try {
    const payload: Record<string, unknown> = {
      amount: params.amount,
      description: params.description.slice(0, 255),
      externalId: params.externalId,
    };

    if (params.returnUrl) {
      payload.returnUrl = params.returnUrl;
    }

    if (SOCIALPAY_MERCHANT_ID) {
      payload.merchantId = SOCIALPAY_MERCHANT_ID;
    }

    const res = await fetch(`${SOCIALPAY_BASE_URL}/merchant/payment/invoice/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SOCIALPAY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      return {
        success: false,
        error: `SocialPay create invoice failed ${res.status}: ${body.slice(0, 400)}`,
      };
    }

    const data = (await res.json()) as Record<string, unknown>;

    // Normalise the response — field names may vary by SocialPay version
    const invoiceId =
      (typeof data.invoiceId === 'string' && data.invoiceId) ||
      (typeof data.invoice_id === 'string' && data.invoice_id) ||
      '';

    if (!invoiceId) {
      return { success: false, error: 'SocialPay invoice response missing invoiceId' };
    }

    const paymentUrl =
      (typeof data.paymentUrl === 'string' && data.paymentUrl) ||
      (typeof data.payment_url === 'string' && data.payment_url) ||
      `${SOCIALPAY_BASE_URL}/merchant/payment?invoiceId=${invoiceId}`;

    const invoice: SocialPayInvoice = {
      invoiceId,
      amount: params.amount,
      description: params.description,
      externalId: params.externalId,
      status: 'PENDING',
      paymentUrl,
      qrCode:
        (typeof data.qrCode === 'string' ? data.qrCode : undefined) ||
        (typeof data.qr_code === 'string' ? data.qr_code : undefined),
    };

    return { success: true, data: invoice };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[socialpay] createSocialPayInvoice error:', err);
    return { success: false, error: `SocialPay request failed: ${message}` };
  }
}

export async function checkSocialPayInvoice(invoiceId: string): Promise<{
  success: boolean;
  status?: string;
  error?: string;
}> {
  if (!SOCIALPAY_TOKEN) {
    return { success: false, error: 'SocialPay token not configured' };
  }

  try {
    const res = await fetch(`${SOCIALPAY_BASE_URL}/merchant/payment/invoice/check`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SOCIALPAY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ invoiceId }),
    });

    if (!res.ok) {
      const body = await res.text();
      return {
        success: false,
        error: `SocialPay check invoice failed ${res.status}: ${body.slice(0, 400)}`,
      };
    }

    const data = (await res.json()) as Record<string, unknown>;

    const status =
      (typeof data.status === 'string' && data.status) ||
      (typeof data.invoice_status === 'string' && data.invoice_status) ||
      'UNKNOWN';

    return { success: true, status };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[socialpay] checkSocialPayInvoice error:', err);
    return { success: false, error: `SocialPay request failed: ${message}` };
  }
}
