import { describe, expect, it } from "vitest";
import { favoritePreviewImage, favoriteProductIds, isFavorite } from "@/lib/commerce/favorites";

describe("favorite helpers", () => {
  it("maps database favorite records into product ids", () => {
    const ids = favoriteProductIds([{ productId: "p1" }, { productId: "p2" }]);
    expect(ids).toEqual(["p1", "p2"]);
    expect(isFavorite("p1", ids)).toBe(true);
  });

  it("uses the first product image as a favorite preview", () => {
    expect(favoritePreviewImage({ product: { images: [{ src: "/first.svg" }, { src: "/second.svg" }] } })).toBe(
      "/first.svg"
    );
    expect(favoritePreviewImage({ product: { images: [] } })).toBeNull();
  });
});
