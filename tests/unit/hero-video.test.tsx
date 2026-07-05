import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroVideo } from "@/components/storefront/hero-video";

describe("HeroVideo", () => {
  it("keeps Starliar branding and collection actions on the hero", () => {
    render(<HeroVideo src="/media/starliar-hero.mp4" />);
    expect(screen.getByText("STARLIAR")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "FIRST SIGNAL" })).toHaveClass("hero-kicker");
    expect(screen.getByRole("link", { name: /shop now/i })).toHaveAttribute("href", "/shop");
    expect(screen.getByRole("link", { name: /view campaign/i })).toHaveAttribute("href", "#campaign");
  });
});
