import { useState } from "react";
import { readTheme, saveTheme, type ThemeChoice } from "../theme";

const CHOICES: { value: ThemeChoice; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

/** Rail-foot appearance control. "System" follows the OS, which is the default. */
export default function ThemeToggle() {
  const [choice, setChoice] = useState<ThemeChoice>(() => readTheme());

  const pick = (value: ThemeChoice) => {
    saveTheme(value);
    setChoice(value);
  };

  return (
    <div className="theme-seg" role="group" aria-label="Appearance">
      {CHOICES.map((c) => (
        <button
          key={c.value}
          type="button"
          className="theme-seg-btn"
          aria-pressed={choice === c.value}
          onClick={() => pick(c.value)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
