import { beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findMany
    }
  }
}));

describe("SEO metadata routes", () => {
  beforeEach(() => {
    findMany.mockReset();
    process.env.NEXT_PUBLIC_SITE_URL = "";
  });

  it("exposes robots rules for the live Starlier domain", async () => {
    const { default: robots } = await import("@/app/robots");

    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"]
      },
      sitemap: "https://wwwstarlier.com/sitemap.xml",
      host: "https://wwwstarlier.com"
    });
  });

  it("builds a sitemap with storefront and published product URLs", async () => {
    findMany.mockResolvedValue([
      { slug: "quiet-shirt", updatedAt: new Date("2026-07-01T00:00:00.000Z") },
      { slug: "trace-cap", updatedAt: new Date("2026-07-02T00:00:00.000Z") }
    ]);

    const { default: sitemap } = await import("@/app/sitemap");
    const entries = await sitemap();

    expect(findMany).toHaveBeenCalledWith({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" }
    });
    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: "https://wwwstarlier.com/" }),
        expect.objectContaining({ url: "https://wwwstarlier.com/shop" }),
        expect.objectContaining({ url: "https://wwwstarlier.com/shop/quiet-shirt" }),
        expect.objectContaining({ url: "https://wwwstarlier.com/shop/trace-cap" })
      ])
    );
  });

  it("keeps the canonical sitemap on wwwstarlier.com even when Vercel exposes a preview URL", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://starlier.vercel.app";
    findMany.mockResolvedValue([{ slug: "trace-cap", updatedAt: new Date("2026-07-02T00:00:00.000Z") }]);

    const { default: sitemap } = await import("@/app/sitemap");
    const entries = await sitemap();

    expect(entries.map((entry) => entry.url)).toContain("https://wwwstarlier.com/");
    expect(entries.map((entry) => entry.url)).toContain("https://wwwstarlier.com/shop/trace-cap");
    expect(entries.map((entry) => entry.url)).not.toContain("https://starlier.vercel.app/");
  });
});
