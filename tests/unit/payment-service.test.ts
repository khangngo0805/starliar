import { describe, expect, it } from "vitest";
import { mapPayOSStatus } from "@/lib/payments/payos";

describe("mapPayOSStatus", () => {
  it("maps paid and canceled provider states", () => {
    expect(mapPayOSStatus("PAID")).toBe("PAID");
    expect(mapPayOSStatus("00")).toBe("PAID");
    expect(mapPayOSStatus("CANCELLED")).toBe("CANCELED");
  });
});
