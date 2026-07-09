import { BookmarkCheckIcon } from "lucide-react";
import type { ReactNode } from "react";

const steps: Array<{
  number: string;
  title: string;
  text: string;
  icon: ReactNode;
}> = [
    {
      number: "01",
      title: "Crie uma viagem",
      text: "Escolha entre viagem nacional ou internacional e informe origem, destino, datas e participantes.",
      icon: <PlanePathIcon />,
    },
    {
      number: "02",
      title: "Convide seus amigos",
      text: "Compartilhe um link ou código para que todos entrem no mesmo grupo.",
      icon: <UsersPlusIcon />,
    },
    {
      number: "03",
      title: "Configure o perfil",
      text: "Cada participante define sua meta financeira, documentos e quanto já guardou.",
      icon: <ProfileIcon />,
    },
    {
      number: "04",
      title: "Acompanhe o progresso",
      text: "Veja status individuais, pendências, valores economizados e preparação geral da viagem.",
      icon: <ProgressIcon />,
    },
    {
      number: "05",
      title: "Decidam juntos",
      text: "Criem votações para escolher hospedagem, passeios, alimentação, transporte e prioridades.",
      icon: <BookmarkCheckIcon />,
    },
    {
      number: "06",
      title: "Viajem tranquilos",
      text: "Todas as decisões, gastos e checklists ficam organizados em um único lugar.",
      icon: <ShieldIcon />,
    },
  ];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="how-section">
      <div className="landing-container landing-section">
        <div className="landing-section-heading">
          <p className="landing-eyebrow">Como funciona</p>
          <h2>Como o TripSync funciona?</h2>
          <p>Do primeiro convite ao embarque, todo mundo acompanha o planejamento no mesmo lugar.</p>
        </div>

        <div className="how-steps-grid">
          {steps.map((step) => (
            <article key={step.number} className="how-step-card">
              <div className="how-step-top">
                <span className="how-step-icon" aria-hidden="true">{step.icon}</span>
                <span className="how-step-number">{step.number}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanePathIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M3.5 16.5C7 9.5 13 7.5 20.5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 4" />
      <path d="m4 11 16-7-6.5 16-2.8-7.2L4 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UsersPlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M15 20c0-2.4-1.9-4.3-4.3-4.3H7.6c-2.4 0-4.3 1.9-4.3 4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9.2 12.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z" stroke="currentColor" strokeWidth="2" />
      <path d="M18 8v6M21 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3h9A2.5 2.5 0 0 1 19 5.5v13A2.5 2.5 0 0 1 16.5 21h-9A2.5 2.5 0 0 1 5 18.5v-13Z" stroke="currentColor" strokeWidth="2" />
      <path d="M9 8h6M9 12h6M9 16h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ProgressIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M4 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 17v-5M12 17V8M16 17v-7M20 17V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 3 20 6v5c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="m8.8 12 2 2 4.6-4.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
