/**
 * QPay API client for the Services/Payment module.
 * Wraps the existing billing qpay-client with a simpler interface.
 */

const QPAY_BASE = process.env.QPAY_BASE_URL ?? 'https://merchant.qpay.mn/v2';
const QPAY_USERNAME = process.env.QPAY_USERNAME ?? process.env.QPAY_CLIENT_ID ?? 'TEST';
const QPAY_PASSWORD = process.env.QPAY_PASSWORD ?? process.env.QPAY_CLIENT_SECRET ?? 'TEST';
const QPAY_INVOICE_CODE = process.env.QPAY_INVOICE_CODE ?? 'TEST_INVOICE';

type TokenCache = { token: string; expiresAt: number };
let _tokenCache: TokenCache | null = null;

export async function qpayGetToken(): Promise<string> {
  const now = Date.now();
  if (_tokenCache && now < _tokenCache.expiresAt - 60_000) {
    return _tokenCache.token;
  }

  const credentials = Buffer.from(`${QPAY_USERNAME}:${QPAY_PASSWORD}`).toString('base64');
  const res = await fetch(`${QPAY_BASE}/auth/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`QPay auth failed ${res.status}: ${body.slice(0, 400)}`);
  }

  const data = (await res.json()) as Record<string, unknown>;
  const token =
    (typeof data.access_token === 'string' && data.access_token) ||
    (typeof data.token === 'string' && data.token);
  if (!token) throw new Error('QPay token response missing access_token');

  const expiresIn = typeof data.expires_in === 'number' ? data.expires_in : 3600;
  _tokenCache = { token, expiresAt: now + expiresIn * 1000 };
  return token;
}

export interface QPayCreateInvoiceParams {
  invoiceCode?: string;
  senderInvoiceNo: string;
  invoiceReceiverCode: string;
  amount: number;
  description: string;
  callbackUrl: string;
}

export interface QPayCreateInvoiceResult {
  invoiceId: string;
  qrText: string;
  qrImage: string;
  urls: Array<{ name?: string; description?: string; link?: string }>;
}

export async function qpayCreateInvoice(
  params: QPayCreateInvoiceParams
): Promise<QPayCreateInvoiceResult> {
  const token = await qpayGetToken();

  const payload = {
    invoice_code: params.invoiceCode ?? QPAY_INVOICE_CODE,
    sender_invoice_no: params.senderInvoiceNo,
    invoice_receiver_code: params.invoiceReceiverCode.slice(0, 45),
    invoice_description: params.description.slice(0, 255),
    callback_url: params.callbackUrl.slice(0, 255),
    amount: params.amount,
    lines: [
      {
        line_description: params.description.slice(0, 255),
        line_quantity: '1.00',
        line_unit_price: params.amount.toFixed(2),
      },
    ],
  };

  const res = await fetch(`${QPAY_BASE}/invoice`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`QPay create invoice failed ${res.status}: ${body.slice(0, 400)}`);
  }

  const data = (await res.json()) as Record<string, unknown>;
  const invoiceId = typeof data.invoice_id === 'string' ? data.invoice_id : null;
  if (!invoiceId) throw new Error('QPay invoice response missing invoice_id');

  return {
    invoiceId,
    qrText: typeof data.qr_text === 'string' ? data.qr_text : '',
    qrImage: typeof data.qr_image === 'string' ? data.qr_image : '',
    urls: Array.isArray(data.urls)
      ? (data.urls as QPayCreateInvoiceResult['urls'])
      : [],
  };
}

export interface QPayCheckResult {
  isPaid: boolean;
  rows?: Array<{
    payment_id: string;
    payment_status: string;
    payment_amount: number;
  }>;
}

export async function qpayCheckPayment(invoiceId: string): Promise<QPayCheckResult> {
  const token = await qpayGetToken();

  const res = await fetch(`${QPAY_BASE}/payment/check`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      object_type: 'INVOICE',
      object_id: invoiceId,
      offset: { page_number: 1, page_limit: 100 },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`QPay payment check failed ${res.status}: ${body.slice(0, 400)}`);
  }

  const data = (await res.json()) as Record<string, unknown>;
  const count = typeof data.count === 'number' ? data.count : Number(data.count ?? 0);
  const rowsRaw = Array.isArray(data.rows) ? data.rows : [];

  return {
    isPaid: count > 0,
    rows: rowsRaw.map((r: unknown) => {
      const o = r as Record<string, unknown>;
      return {
        payment_id: String(o.payment_id ?? ''),
        payment_status: String(o.payment_status ?? ''),
        payment_amount: Number(o.payment_amount ?? 0),
      };
    }),
  };
}
