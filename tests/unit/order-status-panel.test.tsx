import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ORDER_STATUS_POLL_INTERVAL_MS,
  OrderStatusPanel,
  PAYMENT_QR_EXPIRY_MS
} from "@/components/commerce/order-status-panel";
import { LanguageProvider } from "@/components/storefront/language-provider";

function renderStatusPanel(props: React.ComponentProps<typeof OrderStatusPanel>) {
  return render(
    <LanguageProvider>
      <OrderStatusPanel {...props} />
    </LanguageProvider>
  );
}

describe("OrderStatusPanel", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("checks payment status every 1.5 seconds until confirmed", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        orderStatus: "PAID",
        paymentStatus: "PAID",
        confirmed: true
      })
    }));
    vi.stubGlobal("fetch", fetchMock);
    let pollCallback: (() => Promise<void>) | undefined;
    const setIntervalMock = vi.spyOn(window, "setInterval").mockImplementation((callback, delay) => {
      expect(delay).toBe(ORDER_STATUS_POLL_INTERVAL_MS);
      pollCallback = callback as () => Promise<void>;
      return 1 as unknown as ReturnType<typeof window.setInterval>;
    });
    vi.spyOn(window, "clearInterval").mockImplementation(() => {});

    renderStatusPanel({
      orderNumber: "STL-1234567890",
      initialStatus: { orderStatus: "PENDING_PAYMENT", paymentStatus: "PENDING", confirmed: false },
      totalVnd: 10000
    });

    expect(ORDER_STATUS_POLL_INTERVAL_MS).toBe(1500);
    await act(async () => {
      await pollCallback?.();
    });

    expect(setIntervalMock).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith("/api/orders/STL-1234567890/status", { cache: "no-store" });
    expect(screen.getByRole("dialog", { name: "Payment successful" })).toBeInTheDocument();
  });

  it("shows a five-minute QR countdown and hides it after expiry", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          orderStatus: "PENDING_PAYMENT",
          paymentStatus: "PENDING",
          confirmed: false
        })
      }))
    );

    renderStatusPanel({
      orderNumber: "STL-1234567890",
      initialStatus: { orderStatus: "PENDING_PAYMENT", paymentStatus: "PENDING", confirmed: false },
      totalVnd: 10000,
      qrIssuedAtMs: Date.now()
    });

    expect(PAYMENT_QR_EXPIRY_MS).toBe(5 * 60 * 1000);
    expect(screen.getByText(/QR valid for 05:00/i)).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(PAYMENT_QR_EXPIRY_MS);
    });

    expect(screen.getByText(/QR expired/i)).toBeInTheDocument();
  });

  it("focuses the success modal and lets customers close it with Escape", () => {
    renderStatusPanel({
      orderNumber: "STL-1234567890",
      initialStatus: { orderStatus: "PAID", paymentStatus: "PAID", confirmed: true },
      totalVnd: 10000
    });

    expect(screen.getByRole("button", { name: "Close payment notification" })).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog", { name: "Payment successful" })).not.toBeInTheDocument();
  });

  it("localizes payment success in Vietnamese", () => {
    window.localStorage.setItem("starliar-language", "vi");

    renderStatusPanel({
      orderNumber: "STL-1234567890",
      initialStatus: { orderStatus: "PAID", paymentStatus: "PAID", confirmed: true },
      totalVnd: 10000
    });

    expect(screen.getByRole("dialog", { name: "Thanh toán thành công" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tiếp tục mua sắm" })).toHaveAttribute("href", "/shop");
    expect(screen.getAllByText("Đã thanh toán")).toHaveLength(2);
  });
});
