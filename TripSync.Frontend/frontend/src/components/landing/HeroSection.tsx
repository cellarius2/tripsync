import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import tripSyncLogo from "../../assets/tripsync-logo.png";

export default function HeroSection() {
  return (
    <section id="topo" className="hero-section">
      <div className="landing-container hero-grid">
        <div className="hero-copy">
          <p className="hero-kicker">Planejamento colaborativo de viagens</p>

          <h1 className="hero-title font-display font-semibold text-[color:var(--text)]">
            <span>Planeje.</span>
            <span>Organize.</span>
            <span className="accent-line text-[color:var(--accent)]">Viaje em grupo.</span>
          </h1>

          <p className="hero-description mt-7 text-lg leading-8 text-[color:var(--text-muted)]">
            O TripSync é o seu copiloto para planejar viagens em grupo com organização, transparência e diversão.
          </p>

          <div className="hero-actions mt-9">
            <Link to="/register" className="hero-primary-action">
              <span>Começar agora</span>
              <ArrowRightIcon className="h-[18px] w-[18px]" />
            </Link>

            <a href="#como-funciona" className="hero-secondary-action">
              <span>Ver como funciona</span>
              <PlayIcon className="h-4 w-4" />
            </a>
          </div>

          <div className="hero-benefits mt-10">
            <BenefitCard icon={<UsersIcon className="h-[18px] w-[18px]" />} title="Organização total" text="Tudo em um só lugar." />
            <BenefitCard icon={<ShieldCheckIcon className="h-[18px] w-[18px]" />} title="Transparência" text="Decisões claras para todos." />
            <BenefitCard icon={<SparkleIcon className="h-[18px] w-[18px]" />} title="Mais diversão" text="Foque no que importa." />
          </div>
        </div>

        <div className="hero-visual-area">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

function BenefitCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <article className="hero-benefit-card">
      <div className="hero-benefit-icon">{icon}</div>
      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </article>
  );
}

function HeroVisual() {
  return (
    <div className="tripsync-orbit-panel" aria-label="Resumo visual do planejamento da viagem">
      <div className="tripsync-orbit-background" aria-hidden="true">
        <div className="tripsync-orbit-grid" />

        <svg className="tripsync-orbit-routes" viewBox="0 0 720 520" fill="none" preserveAspectRatio="none">
          <path className="orbit-route orbit-route-one" d="M94 305 C188 190 291 300 371 196 C444 102 535 126 626 72" />
          <path className="orbit-route orbit-route-two" d="M97 356 C201 410 306 355 386 415 C474 481 563 426 637 360" />
        </svg>

        <span className="orbit-pin orbit-pin-one">
          <MapPinIcon />
        </span>
        <span className="orbit-pin orbit-pin-two">
          <MapPinIcon />
        </span>
        <span className="orbit-pin orbit-pin-three">
          <MapPinIcon />
        </span>
      </div>

      <div className="tripsync-orbit-content">
        <article className="orbit-card orbit-card-destination">
          <span className="orbit-card-icon">
            <MapPinIcon />
          </span>

          <div>
            <p className="orbit-card-kicker">Rio de Janeiro</p>
            <strong>54% preparado</strong>

            <div className="orbit-progress" aria-hidden="true">
              <span />
            </div>
          </div>
        </article>

        <article className="orbit-card orbit-card-group">
          <span className="orbit-card-icon">
            <UsersIcon />
          </span>

          <div>
            <p className="orbit-card-title">Grupo</p>
            <strong>4 participantes</strong>

            <div className="orbit-avatar-row" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <em>+1</em>
            </div>
          </div>
        </article>

        <article className="orbit-card orbit-card-savings">
          <span className="orbit-card-icon">
            <BadgeCheckIcon />
          </span>

          <div>
            <p className="orbit-card-title">Economizado</p>
            <strong>R$ 2.800</strong>

            <svg className="orbit-mini-chart" viewBox="0 0 140 32" fill="none" aria-hidden="true">
              <path d="M2 25 C18 25 23 23 34 25 C45 27 50 21 61 22 C72 23 75 10 86 12 C98 14 99 24 111 20 C124 16 126 8 138 12" />
            </svg>
          </div>
        </article>

        <div className="orbit-logo-wrap">
          <div className="orbit-logo-ring" aria-hidden="true" />
          <div className="orbit-logo-card">
            <SafeTripSyncLogo alt="Logo oficial TripSync" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SafeTripSyncLogo({
  alt = "",
  className,
  decorative = false,
}: {
  alt?: string;
  className?: string;
  decorative?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={`${className ?? ""} inline-flex items-center justify-center rounded-full bg-[color:var(--accent-soft)] text-[color:var(--accent)]`}
        aria-hidden={decorative ? "true" : undefined}
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : alt || "TripSync"}
      >
        <PlaneIcon className="h-2/3 w-2/3" />
      </span>
    );
  }

  return (
    <img
      src={tripSyncLogo}
      alt={decorative ? "" : alt}
      className={className}
      aria-hidden={decorative ? "true" : undefined}
      onError={() => setFailed(true)}
    />
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M8 5.5v13l10-6.5-10-6.5Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M16 20c0-2.2-1.8-4-4-4H7c-2.2 0-4 1.8-4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M9.5 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="2.2" />
      <path d="M21 20c0-1.9-1.3-3.5-3.1-3.9M16.5 5.3a3 3 0 0 1 0 5.4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M12 3 20 6v5c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-3Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="m8.8 12 2 2 4.5-4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function PlaneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="m3 11 18-7-7 18-3-8-8-3Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m11 14 4-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M12 21s7-5.3 7-12a7 7 0 1 0-14 0c0 6.7 7 12 7 12Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2.4" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}

function BadgeCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="m12 3 2.3 2.1 3.1-.2.6 3 2.5 1.8-1.4 2.8.7 3-3 1.1-1.4 2.7-3.4-.9-3.4.9-1.4-2.7-3-1.1.7-3-1.4-2.8L6 7.9l.6-3 3.1.2L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="m8.7 12.2 2.1 2.1 4.6-4.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
