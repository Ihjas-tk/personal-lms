/** Theme preference: light, dark, or follow the OS. Stored per browser, never in the vault. */

export type ThemeChoice = "light" | "dark" | "system";

export const THEME_KEY = "learn.theme";

export function readTheme(): ThemeChoice {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === "light" || v === "dark") return v;
  } catch {
    /* storage unavailable: fall through to system */
  }
  return "system";
}

/** Stamp `data-theme` on <html>; "system" removes it so `prefers-color-scheme` decides. */
export function applyTheme(choice: ThemeChoice): void {
  const root = document.documentElement;
  if (choice === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", choice);
}

export function saveTheme(choice: ThemeChoice): void {
  try {
    if (choice === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, choice);
  } catch {
    /* storage unavailable: the choice still applies for this page */
  }
  applyTheme(choice);
}
