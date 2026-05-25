import { describe, expect, it } from "vitest";
import { isFavorite, toggleFavoriteId } from "@/lib/commerce/favorites";

describe("favorite helpers", () => {
  it("toggles product ids", () => {
    const added = toggleFavoriteId("p1", []);
    expect(isFavorite("p1", added)).toBe(true);
    expect(toggleFavoriteId("p1", added)).toEqual([]);
  });
});
