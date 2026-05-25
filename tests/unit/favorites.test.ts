import { describe, expect, it } from "vitest";
import { favoriteProductIds, isFavorite } from "@/lib/commerce/favorites";

describe("favorite helpers", () => {
  it("maps database favorite records into product ids", () => {
    const ids = favoriteProductIds([{ productId: "p1" }, { productId: "p2" }]);
    expect(ids).toEqual(["p1", "p2"]);
    expect(isFavorite("p1", ids)).toBe(true);
  });
});
