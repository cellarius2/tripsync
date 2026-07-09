import { useEffect, useState } from "react";
import { voteService } from "../../services/voteService";
import type { VoteCategory, VotePoll } from "../../types";
import CreateVoteModal from "../CreateVoteModal";

interface VotesTabProps {
  tripId: string;
  onChanged?: () => void;
  createSignal?: number;
}

const categoryLabel: Record<VoteCategory, string> = {
  0: "Hospedagem",
  1: "Transporte",
  2: "Passeio",
  3: "Restaurante",
  4: "Horário",
  5: "Outro",
};

const primaryButtonClassName =
  "inline-flex items-center justify-center gap-2 rounded-full bg-burgundy-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-burgundy-700 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClassName =
  "rounded-full border border-burgundy-100 bg-white px-3 py-1.5 text-xs font-semibold text-burgundy-600 transition hover:border-burgundy-300 hover:bg-burgundy-50 hover:text-burgundy-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-burgundy-600/30 dark:bg-white/5 dark:text-burgundy-300 dark:hover:border-burgundy-500/50 dark:hover:bg-burgundy-600/15 dark:hover:text-burgundy-200";

export default function VotesTab({ tripId, onChanged, createSignal = 0 }: VotesTabProps) {
  const [polls, setPolls] = useState<VotePoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadVotes();
  }, [tripId]);

  useEffect(() => {
    if (createSignal > 0) setShowForm(true);
  }, [createSignal]);

  async function loadVotes() {
    try {
      setLoading(true);
      setError("");
      const data = await voteService.list(tripId);
      setPolls(data);
    } catch {
      setError("Não foi possível carregar as votações.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCast(pollId: string, optionId: string) {
    try {
      setError("");
      setActionLoading(`vote-${pollId}-${optionId}`);

      await voteService.cast(pollId, { optionId });
      await loadVotes();
      onChanged?.();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Não foi possível registrar seu voto.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleClose(pollId: string) {
    if (!confirm("Encerrar essa votação? Ninguém mais poderá votar.")) return;

    try {
      setError("");
      setActionLoading(`close-${pollId}`);

      await voteService.close(pollId);
      await loadVotes();
      onChanged?.();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Não foi possível encerrar a votação.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRemove(pollId: string) {
    if (!confirm("Remover esta votação? Essa ação não poderá ser desfeita.")) return;

    try {
      setError("");
      setActionLoading(`remove-${pollId}`);

      await voteService.removePoll(pollId);
      await loadVotes();
      onChanged?.();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Não foi possível remover a votação.");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <p className="py-10 text-center text-sm text-navy-700 dark:text-[#A7B0BE]">
        Carregando votações...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className={primaryButtonClassName}
        >
          <span aria-hidden="true">+</span>
          Nova votação
        </button>
      </div>

      {error && (
        <p className="rounded-2xl bg-burgundy-50 px-4 py-3 text-sm font-semibold text-burgundy-600 dark:bg-burgundy-600/15">
          {error}
        </p>
      )}

      {polls.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-navy-700 dark:border-[#2B313D] dark:bg-[#20242D] dark:text-[#A7B0BE]">
          Nenhuma votação criada ainda. Que tal decidir a hospedagem em grupo?
        </p>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <VoteCard
              key={poll.id}
              poll={poll}
              actionLoading={actionLoading}
              onCast={(optionId) => handleCast(poll.id, optionId)}
              onClose={() => handleClose(poll.id)}
              onRemove={() => handleRemove(poll.id)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <CreateVoteModal
          tripId={tripId}
          onClose={() => setShowForm(false)}
          onSaved={async () => {
            setShowForm(false);
            await loadVotes();
            onChanged?.();
          }}
        />
      )}
    </div>
  );
}

interface VoteCardProps {
  poll: VotePoll;
  actionLoading: string | null;
  onCast: (optionId: string) => void;
  onClose: () => void;
  onRemove: () => void;
}

function VoteCard({ poll, actionLoading, onCast, onClose, onRemove }: VoteCardProps) {
  const totalVotes = poll.options.reduce((sum, option) => sum + option.voteCount, 0);
  const highestVoteCount = Math.max(0, ...poll.options.map((option) => option.voteCount));

  const winnerId =
    poll.isClosed && highestVoteCount > 0
      ? [...poll.options].sort((a, b) => b.voteCount - a.voteCount)[0]?.id
      : null;

  const winner = poll.options.find((option) => option.id === winnerId);
  const closeLoading = actionLoading === `close-${poll.id}`;
  const removeLoading = actionLoading === `remove-${poll.id}`;

  return (
    <article className="rounded-[2rem] border border-gray-200 bg-gray-50 p-5 dark:border-[#2B313D] dark:bg-[#20242D]">
      <div className="mb-1 flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase text-burgundy-600">
            {categoryLabel[poll.category]}
          </span>

          <h3 className="mt-0.5 font-display text-2xl font-semibold text-navy-950 dark:text-white">
            {poll.title}
          </h3>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {poll.isClosed ? (
            <span className="rounded-full bg-gray-200 px-3 py-1.5 text-xs font-semibold text-navy-700 dark:bg-[#181B22] dark:text-[#A7B0BE]">
              Encerrada
            </span>
          ) : (
            <button
              type="button"
              onClick={onClose}
              disabled={closeLoading || removeLoading}
              className={secondaryButtonClassName}
            >
              {closeLoading ? "Encerrando..." : "Encerrar"}
            </button>
          )}

          <button
            type="button"
            onClick={onRemove}
            disabled={removeLoading || closeLoading}
            className={secondaryButtonClassName}
          >
            {removeLoading ? "Removendo..." : "Remover"}
          </button>
        </div>
      </div>

      {winner && (
        <p className="mt-3 rounded-2xl bg-burgundy-50 px-4 py-3 text-sm font-semibold text-burgundy-600 dark:bg-burgundy-600/15">
          🏆 Vencedor: {winner.title}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {poll.options.map((option) => {
          const percent = Number(option.percentage ?? 0);
          const isMyChoice = option.isSelectedByCurrentUser;
          const isWinner = winnerId === option.id;
          const isLoading = actionLoading === `vote-${poll.id}-${option.id}`;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                if (!poll.isClosed && !isLoading) {
                  onCast(option.id);
                }
              }}
              disabled={poll.isClosed || isLoading || Boolean(actionLoading?.startsWith("remove-"))}
              className={`relative w-full overflow-hidden rounded-2xl border px-4 py-3 text-left transition ${isMyChoice
                  ? "border-burgundy-200 bg-white dark:border-burgundy-600/40 dark:bg-[#181B22]"
                  : isWinner
                    ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10"
                    : "border-gray-200 bg-white hover:border-burgundy-100 dark:border-[#2B313D] dark:bg-[#181B22]"
                } ${poll.isClosed ? "cursor-default" : "cursor-pointer"}`}
            >
              <div
                className="absolute inset-y-0 left-0 bg-burgundy-100/70 transition-all duration-500 dark:bg-burgundy-600/15"
                style={{ width: `${percent}%` }}
              />

              <div className="relative flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 font-semibold text-navy-950 dark:text-white">
                  {option.title}
                  {isMyChoice && <span className="text-xs text-burgundy-600">(seu voto)</span>}
                </span>

                <span className="font-mono text-xs text-navy-700 dark:text-[#A7B0BE]">
                  {isLoading ? "votando..." : `${option.voteCount} voto(s) - ${percent.toFixed(0)}%`}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-navy-700 dark:text-[#A7B0BE]">
        {totalVotes} voto(s) no total
      </p>
    </article>
  );
}
