import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "@/components/storefront/site-header";

function setScrollY(value: number) {
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value
  });
}

function setViewportHeight(value: number) {
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value
  });
}

describe("SiteHeader", () => {
  it("keeps hero overlay transparent until the visitor reaches the lower hero", () => {
    setViewportHeight(1000);
    setScrollY(0);
    render(<SiteHeader overlay />);

    const header = screen.getByRole("banner");
    expect(header).toHaveClass("site-header-overlay");
    expect(header).not.toHaveClass("site-header-scrolled");

    act(() => {
      setScrollY(72);
      window.dispatchEvent(new Event("scroll"));
    });

    expect(header).not.toHaveClass("site-header-scrolled");

    act(() => {
      setScrollY(880);
      window.dispatchEvent(new Event("scroll"));
    });

    expect(header).toHaveClass("site-header-scrolled");

    act(() => {
      setScrollY(0);
      window.dispatchEvent(new Event("scroll"));
    });

    expect(header).not.toHaveClass("site-header-scrolled");
  });
});
