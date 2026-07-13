import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HeroVideo } from "@/components/storefront/hero-video";

const heroSlides = [
  "/media/starliar-hero-editorial.png",
  "/media/starliar-hero-quiet-court.png",
  "/media/starliar-hero-white-room.png"
];

describe("HeroVideo", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("keeps Starliar branding and collection actions on the hero", () => {
    render(<HeroVideo slides={heroSlides} />);
    expect(screen.getByText("STARLIAR")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "FIRST SIGNAL" })).toHaveClass("hero-kicker");
    expect(screen.getByRole("link", { name: /shop now/i })).toHaveAttribute("href", "/shop");
    expect(screen.getByRole("link", { name: /view campaign/i })).toHaveAttribute("href", "#campaign");
  });

  it("uses a muted looping video as the hero media when provided", () => {
    render(<HeroVideo videoSrc="/media/starliar-visible-pixel-hero.mp4" />);

    const video = screen.getByTestId("hero-video-media");
    expect(video.tagName).toBe("VIDEO");
    expect(video).toHaveAttribute("src", "/media/starliar-visible-pixel-hero.mp4");
    expect(video).toHaveAttribute("autoplay");
    expect(video).toHaveAttribute("loop");
    expect(video).toHaveAttribute("playsinline");
    expect((video as HTMLVideoElement).muted).toBe(true);
    expect(screen.queryByTestId("hero-track")).not.toBeInTheDocument();
  });

  it("renders three hero images and advances slides automatically", () => {
    vi.useFakeTimers();
    const { container } = render(<HeroVideo slides={heroSlides} intervalMs={5000} />);

    const slides = screen.getAllByTestId("hero-slide");
    const track = screen.getByTestId("hero-track");
    expect(slides).toHaveLength(4);
    expect(track).toHaveStyle("--hero-slide-index: 0");
    expect(container.querySelector(".hero-progress")).toHaveStyle("--hero-slide-count: 3");
    expect(slides[0]).toHaveClass("hero-slide-active");
    expect(slides[1]).not.toHaveClass("hero-slide-active");

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(slides[0]).not.toHaveClass("hero-slide-active");
    expect(slides[1]).toHaveClass("hero-slide-active");
    expect(track).toHaveStyle("--hero-slide-index: 1");
  });

  it("continues sliding forward through the cloned first slide before resetting invisibly", () => {
    vi.useFakeTimers();
    render(<HeroVideo slides={heroSlides} intervalMs={5000} />);

    const track = screen.getByTestId("hero-track");
    expect(screen.getAllByTestId("hero-slide")).toHaveLength(4);

    act(() => {
      vi.advanceTimersByTime(15000);
    });

    expect(track).toHaveStyle("--hero-slide-index: 3");

    fireEvent.transitionEnd(track);

    expect(track).toHaveStyle("--hero-slide-index: 0");
    expect(track).toHaveClass("hero-track-resetting");
  });
});
