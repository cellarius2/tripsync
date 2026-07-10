import type { TripParticipant } from "../../types";
import ParticipantAvatar from "../trip/ParticipantAvatar";

interface CrewMemberCardProps {
  participant: TripParticipant;
  valuePerPerson: number;
  highlighted?: boolean;
  canEditAvatar?: boolean;
  onEditAvatar?: () => void;
  onTomato?: () => void;
}

export default function CrewMemberCard({
  participant,
  valuePerPerson,
  highlighted = false,
  canEditAvatar = false,
  onEditAvatar,
  onTomato,
}: CrewMemberCardProps) {
  const role = participant.isOwner ? "Capitã da viagem" : "Tripulante da viagem";
  const hasCustomAvatar = Boolean(participant.avatarKey);

  return (
    <article
      className={`relative flex min-h-[340px] w-[230px] shrink-0 flex-col overflow-hidden rounded-[1.25rem] border bg-[color:var(--surface)]/90 px-3 py-3 shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-[var(--shadow)] ${highlighted
          ? "border-[color:var(--accent)] shadow-[var(--trip-shadow)]"
          : "border-[color:var(--border)] hover:border-[color:var(--accent)]"
        }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--trip-accent-soft),transparent_44%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.055] [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:14px_14px]" />

      <div className="relative z-10 flex flex-col items-center">
        <button
          type="button"
          onClick={canEditAvatar ? onEditAvatar : undefined}
          disabled={!canEditAvatar}
          className={`mx-auto flex flex-col items-center rounded-[1.2rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)] ${canEditAvatar ? "cursor-pointer transition hover:-translate-y-0.5" : "cursor-default"
            }`}
          title={canEditAvatar ? "Trocar avatar" : undefined}
        >
          <div className="overflow-hidden rounded-[1.1rem] border border-[color:var(--accent)] shadow-[0_12px_24px_color-mix(in_srgb,var(--trip-accent)_16%,transparent)]">
            {hasCustomAvatar ? (
              <ParticipantAvatar
                name={participant.name}
                avatarKey={participant.avatarKey}
                size="lg"
                className="!h-32 !w-32"
              />
            ) : (
              <AvatarInitial name={participant.name} />
            )}
          </div>
        </button>

        <div className="mt-2 flex h-6 items-center justify-center">
          {canEditAvatar && (
            <button
              type="button"
              onClick={onEditAvatar}
              className="whitespace-nowrap rounded-full border border-[color:var(--accent)] bg-[color:var(--surface)] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-[color:var(--accent)] shadow-sm transition hover:bg-[color:var(--accent-soft)]"
            >
              Trocar avatar
            </button>
          )}
        </div>
      </div>

      <div className="relative mt-1 text-center">
        <div className="flex min-w-0 items-center justify-center gap-2">
          <h3 className="truncate font-display text-base font-semibold leading-none text-[color:var(--text)]">
            {participant.name || "Tripulante"}
          </h3>

          {participant.isOwner && (
            <span className="rounded-full bg-[color:var(--trip-button-bg)] px-2 py-0.5 text-[8px] font-black uppercase leading-none text-[color:var(--trip-button-text)]">
              Líder
            </span>
          )}
        </div>

        <p className="mt-1.5 text-[11px] font-semibold text-[color:var(--accent)]">{role}</p>
      </div>

      <div className="relative mt-auto">
        <div className="mb-2.5 h-px w-full bg-[color:var(--border)]" />

        <div className="grid grid-cols-2 divide-x divide-[color:var(--border)]">
          <Info label="Valor guardado" value={formatCurrency(participant.amountSaved)} />
          <Info label="Meta estimada" value={formatCurrency(valuePerPerson)} />
        </div>

        <div className="my-2.5 h-px w-full bg-[color:var(--border)]" />

        <button
          type="button"
          onClick={onTomato}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[color:var(--accent)] bg-[radial-gradient(circle_at_20%_50%,var(--trip-accent-soft),transparent_42%),color-mix(in_srgb,var(--surface-soft)_88%,transparent)] px-4 py-2 text-xs font-black text-[color:var(--accent)] transition hover:bg-[color:var(--accent-soft)] hover:shadow-[0_0_22px_var(--trip-accent-soft)]"
        >
          <span className="text-base">🍅</span>
          <span>Jogar tomate</span>
        </button>
      </div>
    </article>
  );
}


function AvatarInitial({ name }: { name?: string }) {
  const initial = name?.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      aria-label={name ? `Avatar de ${name}` : "Avatar do tripulante"}
      className="flex h-32 w-32 items-center justify-center bg-[radial-gradient(circle_at_35%_28%,rgba(255,255,255,0.34),transparent_34%),linear-gradient(135deg,var(--trip-accent-soft),color-mix(in_srgb,var(--trip-accent)_16%,var(--surface)))] text-5xl font-black uppercase tracking-[-0.08em] text-[color:var(--accent)]"
    >
      {initial}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center px-2 text-center">
      <p className="text-[9px] font-black uppercase leading-tight tracking-[0.12em] text-[color:var(--text-muted)]">
        {label}
      </p>

      <p className="mt-1.5 truncate font-mono text-xs font-black text-[color:var(--text)]">
        {value}
      </p>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
