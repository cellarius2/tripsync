import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

interface OrganizationModalProps {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  onClose: () => void;
  actions?: ReactNode;
}

export default function OrganizationModal({
  title,
  eyebrow = "CENTRO DE ORGANIZAÇÃO",
  children,
  onClose,
  actions,
}: OrganizationModalProps) {
  const [expanded, setExpanded] = useState(false);
  const openedAtScrollYRef = useRef(0);

  useEffect(() => {
    openedAtScrollYRef.current = window.scrollY;

    function restorePageScroll() {
      window.scrollTo({ top: openedAtScrollYRef.current, left: 0, behavior: "auto" });
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);

    restorePageScroll();
    window.requestAnimationFrame(restorePageScroll);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      restorePageScroll();
      window.requestAnimationFrame(restorePageScroll);
      window.setTimeout(restorePageScroll, 0);
    };
  }, [onClose]);

  return (
    <div className="organization-modal-overlay" role="presentation">
      <section
        className={`organization-modal ${expanded ? "organization-modal--expanded" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="organization-modal-title"
      >
        <header className="organization-modal-header">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--trip-accent)]">
              {eyebrow}
            </p>
            <h3
              id="organization-modal-title"
              className="mt-1 truncate font-display text-2xl font-semibold text-[color:var(--modal-text)]"
            >
              {title}
            </h3>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {actions}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[color:var(--modal-border)] bg-[color:var(--modal-surface)] px-4 py-2 text-sm font-semibold text-[color:var(--modal-muted)] transition hover:border-[color:var(--trip-accent)] hover:text-[color:var(--trip-accent)]"
            >
              Fechar
            </button>
          </div>
        </header>

        <div className="organization-modal-body">{children}</div>

        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="organization-modal-expand-button"
          aria-label={expanded ? "Reduzir janela" : "Expandir janela"}
          title={expanded ? "Reduzir janela" : "Expandir janela"}
        >
          <span aria-hidden="true">{expanded ? "↙" : "⛶"}</span>
        </button>
      </section>
    </div>
  );
}
