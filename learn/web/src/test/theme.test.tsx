import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import ThemeToggle from "../components/ThemeToggle";
import { THEME_KEY, applyTheme, readTheme } from "../theme";

describe("theme toggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("defaults to System with no data-theme stamped", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: "System" })).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.getAttribute("data-theme")).toBeNull();
  });

  it("Light stamps data-theme and persists; System clears both", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: "Light" }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem(THEME_KEY)).toBe("light");
    expect(readTheme()).toBe("light");

    fireEvent.click(screen.getByRole("button", { name: "System" }));
    expect(document.documentElement.getAttribute("data-theme")).toBeNull();
    expect(localStorage.getItem(THEME_KEY)).toBeNull();
  });

  it("applyTheme(dark) stamps dark", () => {
    applyTheme("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
