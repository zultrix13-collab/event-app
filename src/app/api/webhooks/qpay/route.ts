import { NextResponse } from "next/server";
import { handleQPayWebhookRequest } from "@/modules/billing/webhook-handler";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const invoiceId = url.searchParams.get("invoice_id");
  const token = url.searchParams.get("token");

  const rawBodyText = await req.text();
  let parsedBody: unknown = {};
  if (rawBodyText) {
    try {
      parsedBody = JSON.parse(rawBodyText) as unknown;
    } catch {
      parsedBody = { _unparsed: true, text: rawBodyText.slice(0, 4000) };
    }
  }

  const result = await handleQPayWebhookRequest({
    invoiceIdFromQuery: invoiceId,
    tokenFromQuery: token,
    rawBodyText,
    parsedBody
  });

  return NextResponse.json(result.body, { status: result.httpStatus });
}
