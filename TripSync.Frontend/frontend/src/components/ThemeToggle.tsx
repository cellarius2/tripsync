import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("tripsync-theme") as "dark" | "light" | null;
    const initialTheme = savedTheme ?? "dark";

    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
    localStorage.setItem("tripsync-theme", initialTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("tripsync-theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative flex h-10 w-[86px] items-center rounded-full border border-gray-200 bg-gray-100 p-1 transition dark:border-[var(--border)] dark:bg-[var(--card-bg)]"
      title={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      <span
        className={`absolute h-8 w-8 rounded-full bg-white shadow-md transition-transform dark:bg-[var(--card-hover-bg)] ${
          theme === "dark" ? "translate-x-10" : "translate-x-0"
        }`}
      />

      <span className="relative z-10 flex h-8 w-8 items-center justify-center text-navy-700 dark:text-[var(--text-muted)]">
        <SunIcon />
      </span>

      <span className="relative z-10 ml-auto flex h-8 w-8 items-center justify-center text-navy-700 dark:text-white">
        <MoonIcon />
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M21 14.2A7.8 7.8 0 0 1 9.8 3a8.7 8.7 0 1 0 11.2 11.2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
