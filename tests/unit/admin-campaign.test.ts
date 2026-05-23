import { describe, expect, it } from "vitest";
import { campaignMediaSchema } from "@/lib/commerce/admin-campaign";

describe("campaignMediaSchema", () => {
  it("requires media source, title, and alt text", () => {
    expect(campaignMediaSchema.safeParse({ src: "/hero.mp4" }).success).toBe(false);
  });
});
