import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Brand from "./common/Brand";
import NotificationButton from "./notifications/NotificationButton";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const isCreateTripPage =
    location.pathname === "/trips/new" ||
    location.pathname === "/trips/create" ||
    location.pathname === "/create-trip" ||
    location.pathname === "/nova-viagem" ||
    location.pathname.includes("create") ||
    location.pathname.includes("new");

  const currentTripId = useMemo(() => {
    const match = location.pathname.match(/^\/trips\/([^/]+)/);

    if (!match) return null;

    const value = match[1];

    if (
      value === "new" ||
      value === "create" ||
      value === "nova-viagem"
    ) {
      return null;
    }

    return value;
  }, [location.pathname]);

  const isTripArea = Boolean(currentTripId) || isCreateTripPage;

  useEffect(() => {
    const savedTheme = localStorage.getItem("tripsync-theme") as "dark" | "light" | null;
    const initialTheme = savedTheme ?? "dark";

    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
    document.documentElement.setAttribute("data-theme", initialTheme);
    localStorage.setItem("tripsync-theme", initialTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    localStorage.setItem("tripsync-theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.setAttribute("data-theme", nextTheme);
  }

  function handleNavbarAction() {
    if (isTripArea) {
      navigate("/dashboard");
      return;
    }

    logout();
    navigate("/login");
  }

  return (
    <header className="app-header app-navbar sticky top-0 z-30">
      <div className="app-header-inner">
        <Link
          to={isAuthenticated ? "/dashboard" : "/"}
          className="app-header-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-[color:var(--bg)]"
        >
          <Brand userName={user?.name} />
        </Link>

        <div className="app-header-actions">
          <button
            type="button"
            onClick={toggleTheme}
            className="navbar-action-btn relative flex h-10 w-[86px] items-center p-1"
            title={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
            aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
          >
            <span
              className={`absolute h-8 w-8 rounded-full bg-white/90 shadow-md transition-transform ${theme === "dark" ? "translate-x-10" : "translate-x-0"
                }`}
            />

            <span className="relative z-10 flex h-8 w-8 items-center justify-center text-[color:var(--text)]">
              <SunIcon />
            </span>

            <span className="relative z-10 ml-auto flex h-8 w-8 items-center justify-center text-[color:var(--text-muted)]">
              <MoonIcon />
            </span>
          </button>

          {isAuthenticated && user && (
            <div className="relative flex items-center gap-3">
              {!isCreateTripPage && currentTripId && (
                <NotificationButton tripId={currentTripId} />
              )}

              <button
                type="button"
                onClick={handleNavbarAction}
                className="navbar-action-btn px-3 py-2 text-sm font-semibold"
              >
                {isTripArea ? "Voltar" : "Sair"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 14.2A7.8 7.8 0 0 1 9.8 3a8.7 8.7 0 1 0 11.2 11.2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}