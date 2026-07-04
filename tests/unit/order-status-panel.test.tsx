import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ORDER_STATUS_POLL_INTERVAL_MS,
  OrderStatusPanel,
  PAYMENT_QR_EXPIRY_MS
} from "@/components/commerce/order-status-panel";

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

    render(
      <OrderStatusPanel
        orderNumber="STL-1234567890"
        initialStatus={{ orderStatus: "PENDING_PAYMENT", paymentStatus: "PENDING", confirmed: false }}
        totalVnd={10000}
      />
    );

    expect(ORDER_STATUS_POLL_INTERVAL_MS).toBe(1500);
    await act(async () => {
      await pollCallback?.();
    });

    expect(setIntervalMock).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith("/api/orders/STL-1234567890/status", { cache: "no-store" });
    expect(screen.getByRole("dialog", { name: "Thanh toán thành công" })).toBeInTheDocument();
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

    render(
      <OrderStatusPanel
        orderNumber="STL-1234567890"
        initialStatus={{ orderStatus: "PENDING_PAYMENT", paymentStatus: "PENDING", confirmed: false }}
        totalVnd={10000}
        qrIssuedAtMs={Date.now()}
      />
    );

    expect(PAYMENT_QR_EXPIRY_MS).toBe(5 * 60 * 1000);
    expect(screen.getByText(/QR còn hiệu lực 05:00/i)).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(PAYMENT_QR_EXPIRY_MS);
    });

    expect(screen.getByText(/QR đã hết hiệu lực/i)).toBeInTheDocument();
  });

  it("lets customers close the success modal after payment is confirmed", () => {
    render(
      <OrderStatusPanel
        orderNumber="STL-1234567890"
        initialStatus={{ orderStatus: "PAID", paymentStatus: "PAID", confirmed: true }}
        totalVnd={10000}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Đóng thông báo thanh toán" }));

    expect(screen.queryByRole("dialog", { name: "Thanh toán thành công" })).not.toBeInTheDocument();
  });
});
