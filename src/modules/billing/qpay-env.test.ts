import { describe, expect, it, vi, beforeEach } from "vitest";
import { getQPayEnv, getAppBaseUrl } from "./qpay-env";

describe("getQPayEnv", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null when any required env is missing", () => {
    vi.stubEnv("QPAY_BASE_URL", "https://merchant.qpay.mn");
    vi.stubEnv("QPAY_CLIENT_ID", "test");
    vi.stubEnv("QPAY_CLIENT_SECRET", "secret");
    vi.stubEnv("QPAY_INVOICE_CODE", "");
    expect(getQPayEnv()).toBeNull();
  });

  it("returns config when all envs are set", () => {
    vi.stubEnv("QPAY_BASE_URL", "https://merchant.qpay.mn/");
    vi.stubEnv("QPAY_CLIENT_ID", "MY_ID");
    vi.stubEnv("QPAY_CLIENT_SECRET", "MY_SECRET");
    vi.stubEnv("QPAY_INVOICE_CODE", "MY_CODE");
    const env = getQPayEnv();
    expect(env).toEqual({
      baseUrl: "https://merchant.qpay.mn",
      clientId: "MY_ID",
      clientSecret: "MY_SECRET",
      invoiceCode: "MY_CODE"
    });
  });

  it("strips trailing slash from baseUrl", () => {
    vi.stubEnv("QPAY_BASE_URL", "https://merchant.qpay.mn/");
    vi.stubEnv("QPAY_CLIENT_ID", "id");
    vi.stubEnv("QPAY_CLIENT_SECRET", "sec");
    vi.stubEnv("QPAY_INVOICE_CODE", "code");
    expect(getQPayEnv()?.baseUrl).toBe("https://merchant.qpay.mn");
  });
});

describe("getAppBaseUrl", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns NEXT_PUBLIC_APP_URL when set", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://eventapp.mn");
    vi.stubEnv("VERCEL_URL", "eventapp-olive.vercel.app");
    expect(getAppBaseUrl()).toBe("https://eventapp.mn");
  });

  it("strips trailing slash from NEXT_PUBLIC_APP_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://eventapp.mn/");
    expect(getAppBaseUrl()).toBe("https://eventapp.mn");
  });

  it("falls back to VERCEL_URL with https prefix", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("VERCEL_URL", "eventapp-olive.vercel.app");
    expect(getAppBaseUrl()).toBe("https://eventapp-olive.vercel.app");
  });

  it("defaults to localhost when no env is set", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("VERCEL_URL", "");
    expect(getAppBaseUrl()).toBe("http://localhost:3000");
  });
});
