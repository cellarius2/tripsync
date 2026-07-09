import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { aiPlanningService, type AiPlanningResponse } from "../../services/aiPlanningService";
import { checklistService } from "../../services/checklistService";
import { financialPlanningService } from "../../services/financialPlanningService";
import { voteService } from "../../services/voteService";
import type { TripDetails } from "../../types";

interface AiPlanningAssistantProps {
  trip: TripDetails;
  onApplied?: () => void;
  openSignal?: number;
  showTrigger?: boolean;
}

interface VoteDraft {
  id: string;
  title: string;
  options: string[];
}

interface PlanningDraft {
  summary: string;
  suggestedBudget: string;
  emergencyReserveSuggestion: string;
  checklistSuggestions: string[];
  voteSuggestions: VoteDraft[];
  travelTips: string[];
  warnings: string[];
  ignoredDocumentSuggestions: boolean;
}

export default function AiPlanningAssistant({
  trip,
  onApplied,
  openSignal = 0,
  showTrigger = true,
}: AiPlanningAssistantProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [draft, setDraft] = useState<PlanningDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (openSignal > 0) setOpen(true);
  }, [openSignal]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  async function handleGenerate() {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const data = await aiPlanningService.getPlanningSuggestions(trip.id, {
        tripId: trip.id,
        destination: trip.destination,
        origin: trip.origin,
        startDate: trip.startDate,
        endDate: trip.endDate,
        tripType: trip.type,
        participantsCount: trip.participants.length,
        estimatedBudget: trip.estimatedTotalCost || undefined,
        userPrompt: buildPreparationPrompt(prompt),
      });

      setDraft(buildDraft(data));
    } catch {
      setError("Não foi possível gerar sugestões agora. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateChecklist() {
    if (!draft) return;

    const items = cleanList(draft.checklistSuggestions).filter((item) => !isDocumentRelated(item));
    if (items.length === 0) {
      setError("Adicione pelo menos um item ao checklist antes de criar.");
      return;
    }

    if (!confirm("Deseja criar este checklist na viagem? Nenhuma alteração será feita sem sua confirmação.")) {
      return;
    }

    try {
      setApplying("checklist");
      setError("");
      setSuccess("");

      await Promise.all(
        items.map((title) => checklistService.create(trip.id, { title, category: "Geral" }))
      );

      setSuccess("Checklist criado na viagem.");
      onApplied?.();
    } catch {
      setError("Não foi possível criar o checklist. Revise os itens e tente novamente.");
    } finally {
      setApplying("");
    }
  }

  async function handleCreateTipsChecklist() {
    if (!draft) return;

    const tips = cleanList(draft.travelTips).filter((item) => !isDocumentRelated(item));
    if (tips.length === 0) {
      setError("Adicione pelo menos uma dica antes de enviar ao checklist.");
      return;
    }

    if (!confirm("Deseja adicionar estas dicas ao checklist da viagem? Nenhuma alteração será feita sem sua confirmação.")) {
      return;
    }

    try {
      setApplying("tips");
      setError("");
      setSuccess("");

      await Promise.all(
        tips.map((title) => checklistService.create(trip.id, { title, category: "Geral" }))
      );

      setSuccess("Dicas adicionadas ao checklist da viagem.");
      onApplied?.();
    } catch {
      setError("Não foi possível adicionar as dicas ao checklist. Revise os itens e tente novamente.");
    } finally {
      setApplying("");
    }
  }

  async function handleCreateVotes() {
    if (!draft) return;

    const polls = draft.voteSuggestions
      .map((vote) => ({
        title: vote.title.trim(),
        options: cleanList(vote.options),
      }))
      .filter((vote) => vote.title && vote.options.length >= 2);

    if (polls.length === 0) {
      setError("Cada votação precisa ter título e pelo menos duas opções.");
      return;
    }

    if (!confirm("Deseja criar estas votações na viagem? Nenhuma alteração será feita sem sua confirmação.")) {
      return;
    }

    try {
      setApplying("votes");
      setError("");
      setSuccess("");

      await Promise.all(
        polls.map((poll) =>
          voteService.create(trip.id, {
            title: poll.title,
            category: 5,
            options: poll.options.map((title) => ({ title })),
          })
        )
      );

      setSuccess("Votações criadas na viagem.");
      onApplied?.();
    } catch {
      setError("Não foi possível criar as votações. Revise títulos e opções.");
    } finally {
      setApplying("");
    }
  }

  async function handleFillBudget() {
    if (!draft) return;

    const suggestedBudget = Number(draft.suggestedBudget || 0);
    const emergencyReserve = Number(draft.emergencyReserveSuggestion || 0);

    if (suggestedBudget < 0 || emergencyReserve < 0) {
      setError("Os valores do orçamento não podem ser negativos.");
      return;
    }

    if (!confirm("Deseja preencher o orçamento com estes valores? Nenhuma alteração será feita sem sua confirmação.")) {
      return;
    }

    try {
      setApplying("budget");
      setError("");
      setSuccess("");

      await financialPlanningService.updateBudget(trip.id, {
        transportationAmount: suggestedBudget,
        accommodationAmount: 0,
        foodAmount: 0,
        activitiesAmount: 0,
        emergencyReserveAmount: emergencyReserve,
      });

      setSuccess("Orçamento preenchido com os valores do rascunho.");
      onApplied?.();
    } catch {
      setError("Não foi possível preencher o orçamento. Revise os valores e tente novamente.");
    } finally {
      setApplying("");
    }
  }

  function updateDraft(update: Partial<PlanningDraft>) {
    setDraft((current) => current ? { ...current, ...update } : current);
  }

  return (
    <>
      {showTrigger && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 rounded-full border border-burgundy-600/20 bg-white px-4 py-2 text-xs font-semibold text-burgundy-600 transition hover:-translate-y-0.5 hover:bg-burgundy-50 dark:bg-[#181B22] dark:hover:bg-[#20242D]"
        >
          Planejamento Inteligente
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden bg-black/45 px-4 py-5 backdrop-blur-sm md:items-center">
          <aside className="flex max-h-[82vh] w-[min(820px,92vw)] flex-col overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white shadow-2xl shadow-black/30 transition dark:border-[#2B313D] dark:bg-[#181B22]">
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-200 px-5 pb-3 pt-5 dark:border-white/10 sm:px-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-burgundy-600">
                  COPILOTO TRIPSYNC
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold leading-tight text-navy-950 dark:text-white">
                  Rascunho de planejamento
                </h2>
                <p className="mt-1 max-w-xl text-sm leading-5 text-navy-700 dark:text-[#A7B0BE]">
                  A IA gerou sugestões editáveis para ajudar o grupo a se preparar melhor.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 rounded-full border border-gray-200 px-3.5 py-2 text-xs font-semibold text-navy-700 transition hover:border-burgundy-100 hover:text-burgundy-600 dark:border-white/10 dark:text-[#A7B0BE] dark:hover:border-burgundy-500/50 dark:hover:text-white"
              >
                Fechar
              </button>
            </header>

            <div className="copilot-scrollbar flex-1 overflow-y-auto px-5 py-4 sm:px-6">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-[#2B313D] dark:bg-[#20242D]">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-navy-700 dark:text-[#A7B0BE]">
                    O que você quer receber?
                  </span>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={2}
                    placeholder="Ex.: checklist inicial, reserva de emergência ou dicas práticas"
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-navy-950 outline-none focus:border-burgundy-300 dark:border-[#2B313D] dark:bg-[#181B22] dark:text-white"
                  />
                </label>

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={loading}
                    className="rounded-full bg-burgundy-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-burgundy-700 disabled:opacity-60"
                  >
                    {loading ? "Gerando..." : draft ? "Gerar novo rascunho" : "Gerar dicas e sugestões"}
                  </button>
                </div>
              </div>

              {error && (
                <p className="mt-3 rounded-2xl bg-burgundy-50 px-4 py-3 text-sm font-semibold text-burgundy-600 dark:bg-burgundy-600/15">
                  {error}
                </p>
              )}

              {success && (
                <p className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-600 dark:bg-emerald-500/10">
                  {success}
                </p>
              )}

              {draft?.ignoredDocumentSuggestions && (
                <p className="mt-3 rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold text-navy-700 dark:bg-[#20242D] dark:text-[#A7B0BE]">
                  Algumas sugestões relacionadas a documentos foram ignoradas porque já existe uma aba própria para Documentos.
                </p>
              )}

              {draft && (
                <div className="mt-4 space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <ResultSection title="Resumo" compact>
                      <textarea
                        value={draft.summary}
                        onChange={(e) => updateDraft({ summary: e.target.value })}
                        rows={3}
                        className={textAreaClassName}
                      />
                    </ResultSection>

                    <ResultSection title="Orçamento" compact>
                      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-semibold text-navy-700 dark:text-[#A7B0BE]">
                            Orçamento sugerido
                          </span>
                          <NumberInput
                            value={draft.suggestedBudget}
                            onChange={(value) => updateDraft({ suggestedBudget: value })}
                          />
                        </label>

                        <label className="block">
                          <span className="mb-1.5 block text-xs font-semibold text-navy-700 dark:text-[#A7B0BE]">
                            Reserva sugerida
                          </span>
                          <NumberInput
                            value={draft.emergencyReserveSuggestion}
                            onChange={(value) => updateDraft({ emergencyReserveSuggestion: value })}
                          />
                        </label>
                      </div>
                    </ResultSection>
                  </div>

                  <EditableList
                    title="Checklist sugerido"
                    items={draft.checklistSuggestions}
                    addLabel="+ Adicionar item"
                    onChange={(items) => updateDraft({ checklistSuggestions: items })}
                    scrollable
                  />

                  <EditableVotes
                    votes={draft.voteSuggestions}
                    onChange={(votes) => updateDraft({ voteSuggestions: votes })}
                  />

                  <EditableList
                    title="Dicas da viagem"
                    items={draft.travelTips}
                    addLabel="+ Adicionar dica"
                    onChange={(items) => updateDraft({ travelTips: items })}
                    scrollable
                  />

                  <div className="-mt-1">
                    <ActionButton
                      label="Adicionar dicas ao checklist"
                      loading={applying === "tips"}
                      disabled={Boolean(applying)}
                      onClick={handleCreateTipsChecklist}
                    />
                  </div>

                  <EditableList
                    title="Avisos"
                    items={draft.warnings}
                    addLabel="+ Adicionar aviso"
                    onChange={(items) => updateDraft({ warnings: items })}
                  />
                </div>
              )}
            </div>

            <footer className="flex shrink-0 flex-col gap-2 border-t border-gray-200 px-5 py-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-gray-200 px-4 py-2.5 text-sm font-semibold text-navy-700 transition hover:border-burgundy-100 hover:text-burgundy-600 dark:border-white/10 dark:text-[#A7B0BE] dark:hover:text-white"
              >
                Cancelar
              </button>

              {draft && (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <ActionButton
                    label="Criar checklist"
                    loading={applying === "checklist"}
                    disabled={Boolean(applying)}
                    onClick={handleCreateChecklist}
                  />
                  <ActionButton
                    label="Criar votações"
                    loading={applying === "votes"}
                    disabled={Boolean(applying)}
                    onClick={handleCreateVotes}
                  />
                  <ActionButton
                    label="Preencher orçamento"
                    loading={applying === "budget"}
                    disabled={Boolean(applying)}
                    onClick={handleFillBudget}
                  />
                </div>
              )}
            </footer>
          </aside>
        </div>
      )}
    </>
  );
}

function EditableVotes({
  votes,
  onChange,
}: {
  votes: VoteDraft[];
  onChange: (votes: VoteDraft[]) => void;
}) {
  function updateVote(id: string, update: Partial<VoteDraft>) {
    onChange(votes.map((vote) => vote.id === id ? { ...vote, ...update } : vote));
  }

  function updateOption(voteId: string, index: number, value: string) {
    onChange(votes.map((vote) => {
      if (vote.id !== voteId) return vote;

      return {
        ...vote,
        options: vote.options.map((option, optionIndex) =>
          optionIndex === index ? value : option
        ),
      };
    }));
  }

  return (
    <ResultSection title="Votações sugeridas">
      <div className="space-y-3">
        {votes.map((vote) => (
          <div
            key={vote.id}
            className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-[#2B313D] dark:bg-[#181B22]"
          >
            <div className="flex items-end gap-2">
              <label className="flex-1">
                <span className="mb-1 block text-xs font-semibold text-navy-700 dark:text-[#A7B0BE]">
                  Título
                </span>
                <input
                  value={vote.title}
                  onChange={(e) => updateVote(vote.id, { title: e.target.value })}
                  className={inputClassName}
                />
              </label>
              <RemoveButton onClick={() => onChange(votes.filter((item) => item.id !== vote.id))} />
            </div>

            <div className="mt-3 space-y-2">
              <p className="text-xs font-semibold text-navy-700 dark:text-[#A7B0BE]">
                Opções
              </p>
              {vote.options.map((option, index) => (
                <div key={`${vote.id}-${index}`} className="flex gap-2">
                  <input
                    value={option}
                    onChange={(e) => updateOption(vote.id, index, e.target.value)}
                    className={inputClassName}
                  />
                  <RemoveButton
                    onClick={() =>
                      updateVote(vote.id, {
                        options: vote.options.filter((_, optionIndex) => optionIndex !== index),
                      })
                    }
                  />
                </div>
              ))}
            </div>

            <SmallButton
              label="+ Adicionar opção"
              onClick={() => updateVote(vote.id, { options: [...vote.options, ""] })}
            />
          </div>
        ))}
      </div>

      <SmallButton
        label="+ Adicionar votação"
        onClick={() =>
          onChange([
            ...votes,
            {
              id: createDraftId(),
              title: "",
              options: ["", ""],
            },
          ])
        }
      />
    </ResultSection>
  );
}

function EditableList({
  title,
  items,
  addLabel,
  onChange,
  scrollable = false,
}: {
  title: string;
  items: string[];
  addLabel: string;
  onChange: (items: string[]) => void;
  scrollable?: boolean;
}) {
  return (
    <ResultSection title={title}>
      <div className={`${scrollable ? "copilot-scrollbar max-h-44 overflow-y-auto pr-1" : ""} space-y-2`}>
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="flex gap-2">
            <input
              value={item}
              onChange={(e) =>
                onChange(items.map((current, currentIndex) =>
                  currentIndex === index ? e.target.value : current
                ))
              }
              className={inputClassName}
            />
            <RemoveButton onClick={() => onChange(items.filter((_, currentIndex) => currentIndex !== index))} />
          </div>
        ))}
      </div>

      <SmallButton label={addLabel} onClick={() => onChange([...items, ""])} />
    </ResultSection>
  );
}

function ResultSection({
  title,
  children,
  compact = false,
}: {
  title: string;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={`rounded-2xl border border-gray-200 bg-gray-50 text-sm leading-6 text-navy-700 transition dark:border-[#2B313D] dark:bg-[#20242D] dark:text-[#A7B0BE] ${compact ? "p-3" : "p-4"}`}>
      <h3 className="mb-2 border-b border-gray-200 pb-2 text-xs font-bold uppercase tracking-wide text-burgundy-600 dark:border-[#2B313D]">
        {title}
      </h3>
      {children}
    </section>
  );
}

function NumberInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <input
      type="number"
      min={0}
      step="0.01"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputClassName}
    />
  );
}

function ActionButton({
  label,
  loading,
  disabled,
  onClick,
}: {
  label: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full bg-burgundy-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-burgundy-700 disabled:opacity-60"
    >
      {loading ? "Aplicando..." : label}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-full border border-gray-200 px-2.5 py-1.5 text-[11px] font-semibold text-navy-700 transition hover:border-burgundy-100 hover:text-burgundy-600 dark:border-[#2B313D] dark:text-[#A7B0BE]"
    >
      remover
    </button>
  );
}

function SmallButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 rounded-full border border-gray-200 px-3.5 py-2 text-xs font-semibold text-navy-700 transition hover:border-burgundy-100 hover:text-burgundy-600 dark:border-[#2B313D] dark:text-[#A7B0BE]"
    >
      {label}
    </button>
  );
}

function buildDraft(suggestions: AiPlanningResponse): PlanningDraft {
  const filteredChecklist = filterDocumentSuggestions(suggestions.checklistSuggestions);
  const filteredTips = filterDocumentSuggestions(suggestions.itinerarySuggestions);
  const ignoredDocumentSuggestions =
    filteredChecklist.removed > 0 || filteredTips.removed > 0;

  return {
    summary: suggestions.summary,
    suggestedBudget: String(suggestions.suggestedBudget ?? ""),
    emergencyReserveSuggestion: String(suggestions.emergencyReserveSuggestion ?? ""),
    checklistSuggestions: filteredChecklist.items.length
      ? filteredChecklist.items
      : [""],
    voteSuggestions: suggestions.voteSuggestions.map((title) => ({
      id: createDraftId(),
      title,
      options: getDefaultVoteOptions(title),
    })),
    travelTips: filteredTips.items.length
      ? filteredTips.items
      : [""],
    warnings: buildWarnings(suggestions.warnings, ignoredDocumentSuggestions),
    ignoredDocumentSuggestions,
  };
}

function getDefaultVoteOptions(title: string) {
  const normalized = title.toLowerCase();

  if (normalized.includes("hosped")) return ["Hotel", "Airbnb", "Pousada"];
  if (normalized.includes("transporte")) return ["Carro", "Ônibus", "Avião"];
  if (normalized.includes("restaurante")) return ["Opção 1", "Opção 2", "Opção 3"];
  if (normalized.includes("passeio")) return ["Manhã", "Tarde", "Noite"];

  return ["Opção 1", "Opção 2", "Opção 3"];
}

function cleanList(items: string[]) {
  return items.map((item) => item.trim()).filter(Boolean);
}

function buildPreparationPrompt(prompt: string) {
  const basePrompt = prompt.trim();
  const guardrail =
    "Sugira apenas tarefas práticas de preparação para checklist. Não inclua documentos, passaporte, visto, RG, CPF, CNH, seguro viagem ou comprovantes no checklist ou nas dicas; se necessário, cite documentos apenas como aviso porque há uma aba própria de Documentos.";

  return basePrompt ? `${basePrompt}\n\n${guardrail}` : guardrail;
}

function filterDocumentSuggestions(items: string[]) {
  const filtered = items.filter((item) => !isDocumentRelated(item));

  return {
    items: filtered,
    removed: items.length - filtered.length,
  };
}

function buildWarnings(warnings: string[], ignoredDocumentSuggestions: boolean) {
  const cleanWarnings = warnings.length ? warnings : [""];

  if (!ignoredDocumentSuggestions) return cleanWarnings;

  return [
    ...cleanWarnings,
    "Algumas sugestões relacionadas a documentos foram ignoradas porque já existe uma aba própria para Documentos.",
  ];
}

function isDocumentRelated(value: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const documentTerms = [
    "documento",
    "documentos",
    "passaporte",
    "visto",
    "rg",
    "cpf",
    "cnh",
    "seguro viagem",
    "comprovante",
    "comprovante de hospedagem",
    "comprovante de passagem",
    "cartao internacional",
    "cartão internacional",
    "documento com foto",
  ];

  return documentTerms.some((term) => normalized.includes(term));
}

function createDraftId() {
  return crypto.randomUUID();
}

const inputClassName =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-navy-950 outline-none focus:border-burgundy-300 dark:border-[#2B313D] dark:bg-[#181B22] dark:text-white";

const textAreaClassName =
  "w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-navy-950 outline-none focus:border-burgundy-300 dark:border-[#2B313D] dark:bg-[#181B22] dark:text-white";
