import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { checklistService } from "../../services/checklistService";
import { financialPlanningService, type ParticipantProgress } from "../../services/financialPlanningService";
import type { ChecklistItem } from "../../types";

interface ChecklistTabProps {
  tripId: string;
  onChanged?: () => void;
  createSignal?: number;
}

const CATEGORY_OPTIONS = [
  { value: "Bagagem", label: "Bagagem", icon: "🧳", tone: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200" },
  { value: "Transporte", label: "Transporte", icon: "🚗", tone: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200" },
  { value: "Hospedagem", label: "Hospedagem", icon: "🏨", tone: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-200" },
  { value: "Financeiro", label: "Financeiro", icon: "💰", tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200" },
  { value: "Alimentação", label: "Alimentação", icon: "🍽", tone: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200" },
  { value: "Passeios", label: "Passeios", icon: "🎯", tone: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-200" },
  { value: "Cuidados pessoais", label: "Cuidados pessoais", icon: "🧴", tone: "bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-200" },
  { value: "Geral", label: "Geral", icon: "📦", tone: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-[#D8DDE6]" },
];

const STATUS_FILTERS = ["Todos", "Pendentes", "Concluídos"];
const CATEGORY_FILTER_OPTIONS = [
  { value: "Todas", label: "Todas" },
  ...CATEGORY_OPTIONS.slice().sort((a, b) => {
    const order = ["Geral", "Bagagem", "Transporte", "Hospedagem", "Financeiro", "Alimentação", "Passeios", "Cuidados pessoais"];
    return order.indexOf(a.value) - order.indexOf(b.value);
  }),
];

const inputClassName =
  "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-navy-950 outline-none transition focus:border-burgundy-300 dark:border-[#2B313D] dark:bg-[#181B22] dark:text-white";

const primaryButtonClassName =
  "inline-flex items-center justify-center gap-2 rounded-full bg-burgundy-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-burgundy-700 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClassName =
  "rounded-full border border-burgundy-100 bg-white px-3 py-1.5 text-xs font-semibold text-burgundy-600 transition hover:border-burgundy-300 hover:bg-burgundy-50 hover:text-burgundy-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-burgundy-600/30 dark:bg-white/5 dark:text-burgundy-300 dark:hover:border-burgundy-500/50 dark:hover:bg-burgundy-600/15 dark:hover:text-burgundy-200";

export default function ChecklistTab({ tripId, onChanged, createSignal = 0 }: ChecklistTabProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [participants, setParticipants] = useState<ParticipantProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "Geral",
    assignedToParticipantId: "",
    description: "",
  });

  useEffect(() => {
    loadAll();
  }, [tripId]);

  useEffect(() => {
    if (createSignal > 0) setShowForm(true);
  }, [createSignal]);

  const completed = items.filter((item) => item.isDone).length;
  const total = items.length;
  const pending = total - completed;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const filteredItems = useMemo(() => {
    return [...items]
      .sort((a, b) => Number(a.isDone) - Number(b.isDone))
      .filter((item) => {
        const matchesStatus =
          statusFilter === "Todos" ||
          (statusFilter === "Pendentes" && !item.isDone) ||
          (statusFilter === "Concluídos" && item.isDone);
        const matchesCategory =
          categoryFilter === "Todas" || (item.category ?? "Geral") === categoryFilter;

        return matchesStatus && matchesCategory;
      });
  }, [categoryFilter, items, statusFilter]);

  const documentTaskWarning = isDocumentRelated(`${form.title} ${form.description}`);

  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      const [checklistItems, progressParticipants] = await Promise.all([
        checklistService.list(tripId),
        financialPlanningService.getProgress(tripId).catch(() => []),
      ]);

      setItems(checklistItems);
      setParticipants(progressParticipants);
    } catch {
      setError("Não foi possível carregar o checklist.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!form.title.trim()) {
      setError("Informe o título da tarefa.");
      return;
    }

    try {
      setSavingId("new");
      setError("");

      await checklistService.create(tripId, {
        title: form.description.trim()
          ? `${form.title.trim()} — ${form.description.trim()}`
          : form.title.trim(),
        category: form.category,
        assignedToParticipantId: form.assignedToParticipantId || null,
      });

      setForm({
        title: "",
        category: "Geral",
        assignedToParticipantId: "",
        description: "",
      });
      setShowForm(false);
      await loadAll();
      onChanged?.();
    } catch {
      setError("Não foi possível criar a tarefa.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleToggle(item: ChecklistItem) {
    try {
      setSavingId(item.id);
      setError("");
      await checklistService.toggle(tripId, item.id);
      await loadAll();
      onChanged?.();
    } catch {
      setError("Não foi possível atualizar a tarefa.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleUpdate(item: ChecklistItem, update: Partial<ChecklistItem>) {
    const next = { ...item, ...update };

    if (!next.title.trim()) {
      setError("O título da tarefa não pode ficar vazio.");
      return;
    }

    try {
      setSavingId(item.id);
      setError("");

      await checklistService.update(tripId, item.id, {
        title: next.title.trim(),
        category: next.category ?? "Geral",
        assignedToParticipantId: next.assignedToParticipantId ?? null,
      });

      await loadAll();
      onChanged?.();
    } catch {
      setError("Não foi possível salvar a edição.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(item: ChecklistItem) {
    if (!confirm("Excluir esta tarefa do checklist?")) return;

    try {
      setSavingId(item.id);
      setError("");
      await checklistService.remove(tripId, item.id);
      await loadAll();
      onChanged?.();
    } catch {
      setError("Não foi possível remover a tarefa.");
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return (
      <p className="py-10 text-center text-sm text-navy-700 dark:text-[#A7B0BE]">
        Carregando checklist...
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="max-w-2xl text-sm text-navy-700 dark:text-[#A7B0BE]">
          Acompanhe tudo o que ainda precisa ser feito antes da viagem.
        </p>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className={primaryButtonClassName}
        >
          + Nova tarefa
        </button>
      </div>

      {error && (
        <p className="rounded-2xl bg-burgundy-50 px-4 py-3 text-sm font-semibold text-burgundy-600 dark:bg-burgundy-600/15">
          {error}
        </p>
      )}

      <section className="rounded-3xl border border-gray-200 bg-gray-50 p-5 transition dark:border-[#2B313D] dark:bg-[#20242D]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-burgundy-600">✔ Checklist concluído</p>
            <p className="mt-1 font-display text-3xl font-semibold text-navy-950 dark:text-white">
              {completed} de {total}
            </p>
            <p className="text-sm text-navy-700 dark:text-[#A7B0BE]">
              {pending === 0 && total > 0 ? "Tudo pronto por aqui." : `${pending} tarefa(s) pendente(s).`}
            </p>
          </div>

          <span className="rounded-full bg-white px-4 py-2 font-mono text-sm font-semibold text-navy-700 dark:bg-[#181B22] dark:text-[#D8DDE6]">
            {percent}%
          </span>
        </div>

        <div className="mt-4">
          <ProgressBar percent={percent} />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setStatusFilter(filter)}
            className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition ${statusFilter === filter
                ? "border-burgundy-600 bg-burgundy-600 text-white"
                : "border-burgundy-100 bg-white text-burgundy-600 hover:border-burgundy-300 hover:bg-burgundy-50 hover:text-burgundy-700 dark:border-burgundy-600/30 dark:bg-white/5 dark:text-burgundy-300 dark:hover:border-burgundy-500/50 dark:hover:bg-burgundy-600/15 dark:hover:text-burgundy-200"
              }`}
          >
            {filter}
          </button>
        ))}

        <div className="relative">
          <button
            type="button"
            onClick={() => setCategoryMenuOpen((current) => !current)}
            className={secondaryButtonClassName}
            aria-haspopup="menu"
            aria-expanded={categoryMenuOpen}
          >
            Categoria: {getCategoryFilterLabel(categoryFilter)} ▾
          </button>

          {categoryMenuOpen && (
            <div className="absolute left-0 top-11 z-20 w-52 overflow-hidden rounded-2xl border border-gray-200 bg-white p-1 shadow-xl dark:border-[#2B313D] dark:bg-[#181B22]">
              {CATEGORY_FILTER_OPTIONS.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => {
                    setCategoryFilter(category.value);
                    setCategoryMenuOpen(false);
                  }}
                  className={`w-full rounded-xl px-3 py-2 text-left text-xs font-semibold transition ${categoryFilter === category.value
                      ? "bg-burgundy-50 text-burgundy-600 dark:bg-burgundy-600/15"
                      : "text-navy-700 hover:bg-gray-50 dark:text-[#D8DDE6] dark:hover:bg-[#20242D]"
                    }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-[#2B313D] dark:bg-[#181B22]">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-sm text-navy-700 dark:text-[#A7B0BE]">
            Nenhuma tarefa encontrada neste filtro.
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <ChecklistRow
              key={item.id}
              item={item}
              participants={participants}
              saving={savingId === item.id}
              onToggle={() => handleToggle(item)}
              onUpdate={(update) => handleUpdate(item, update)}
              onDelete={() => handleDelete(item)}
              isLast={index === filteredItems.length - 1}
            />
          ))
        )}
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 py-6 backdrop-blur-sm md:items-center">
          <div className="w-full max-w-xl rounded-[2rem] border border-gray-200 bg-white p-5 shadow-2xl transition dark:border-[#2B313D] dark:bg-[#181B22]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-burgundy-600">
                  Nova tarefa
                </p>
                <h3 className="mt-1 font-display text-2xl font-semibold text-navy-950 dark:text-white">
                  Adicionar ao checklist
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-full px-3 py-1.5 text-sm font-semibold text-navy-700 transition hover:bg-gray-50 dark:text-[#A7B0BE] dark:hover:bg-[#20242D]"
              >
                Cancelar
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-navy-700 dark:text-[#A7B0BE]">
                  Título
                </span>
                <input
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  className={inputClassName}
                />
              </label>

              {documentTaskWarning && (
                <p className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold text-navy-700 dark:bg-[#20242D] dark:text-[#A7B0BE]">
                  Esse item parece ser relacionado a documentos. Talvez faça mais sentido usar a aba Documentos.
                </p>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-navy-700 dark:text-[#A7B0BE]">
                    Categoria
                  </span>
                  <CategorySelect
                    value={form.category}
                    onChange={(category) => setForm({ ...form, category })}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-navy-700 dark:text-[#A7B0BE]">
                    Responsável (opcional)
                  </span>
                  <ParticipantSelect
                    value={form.assignedToParticipantId}
                    participants={participants}
                    onChange={(assignedToParticipantId) =>
                      setForm({ ...form, assignedToParticipantId })
                    }
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-navy-700 dark:text-[#A7B0BE]">
                  Descrição (opcional)
                </span>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-navy-950 outline-none transition focus:border-burgundy-300 dark:border-[#2B313D] dark:bg-[#181B22] dark:text-white"
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={savingId === "new"}
                  className={primaryButtonClassName}
                >
                  {savingId === "new" ? "Salvando..." : "Salvar"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className={secondaryButtonClassName}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChecklistRow({
  item,
  participants,
  saving,
  onToggle,
  onUpdate,
  onDelete,
  isLast,
}: {
  item: ChecklistItem;
  participants: ParticipantProgress[];
  saving: boolean;
  onToggle: () => void;
  onUpdate: (update: Partial<ChecklistItem>) => void;
  onDelete: () => void;
  isLast: boolean;
}) {
  const [title, setTitle] = useState(item.title);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setTitle(item.title);
  }, [item.title]);

  function saveTitle() {
    if (title !== item.title) onUpdate({ title });
  }

  return (
    <article
      className={`group relative px-3 py-2.5 transition hover:bg-gray-50 dark:hover:bg-[#20242D]/70 ${isLast ? "" : "border-b border-gray-100 dark:border-[#2B313D]"
        }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggle}
          disabled={saving}
          className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border text-sm font-bold shadow-sm transition ${item.isDone
              ? "scale-95 border-emerald-500 bg-emerald-500 text-white"
              : "border-gray-300 bg-white text-transparent hover:border-burgundy-300 dark:border-[#3A4150] dark:bg-[#20242D]"
            }`}
          aria-label={item.isDone ? "Marcar tarefa como pendente" : "Marcar tarefa como concluída"}
        >
          ✓
        </button>

        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onBlur={saveTitle}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  saveTitle();
                  setEditing(false);
                }

                if (event.key === "Escape") {
                  setTitle(item.title);
                  setEditing(false);
                }
              }}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-navy-950 outline-none transition focus:border-burgundy-300 dark:border-[#2B313D] dark:bg-[#181B22] dark:text-white"
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className={`block w-full truncate text-left text-sm font-semibold transition ${item.isDone
                  ? "text-navy-500 line-through dark:text-[#7F8794]"
                  : "text-navy-950 dark:text-white"
                }`}
            >
              {item.title}
            </button>
          )}

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <CategoryBadge category={item.category ?? "Geral"} />
            <MetaBadge>{item.assignedToName ? item.assignedToName : "Sem responsável"}</MetaBadge>
            <MetaBadge>{item.isDone ? "Concluída" : "Pendente"}</MetaBadge>
            {saving && <MetaBadge>Salvando...</MetaBadge>}
          </div>

          {editing && (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <CategorySelect
                value={item.category ?? "Geral"}
                onChange={(category) => onUpdate({ category })}
              />
              <ParticipantSelect
                value={item.assignedToParticipantId ?? ""}
                participants={participants}
                onChange={(assignedToParticipantId) =>
                  onUpdate({ assignedToParticipantId: assignedToParticipantId || null })
                }
              />
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              disabled={saving}
              className={secondaryButtonClassName}
            >
              Editar
            </button>
          )}

          <button
            type="button"
            onClick={onDelete}
            disabled={saving}
            className={secondaryButtonClassName}
          >
            {saving ? "Removendo..." : "Remover"}
          </button>
        </div>
      </div>
    </article>
  );
}

function CategorySelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={inputClassName}
    >
      {CATEGORY_OPTIONS.map((category) => (
        <option key={category.value} value={category.value}>
          {category.icon} {category.label}
        </option>
      ))}
    </select>
  );
}

function getCategoryFilterLabel(value: string) {
  if (value === "Todas") return "Todas";

  return CATEGORY_OPTIONS.find((category) => category.value === value)?.label ?? value;
}

function ParticipantSelect({
  value,
  participants,
  onChange,
}: {
  value: string;
  participants: ParticipantProgress[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={inputClassName}
    >
      <option value="">Sem responsável</option>
      {participants.map((participant) => (
        <option key={participant.participantId} value={participant.participantId}>
          {participant.name}
        </option>
      ))}
    </select>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const option = CATEGORY_OPTIONS.find((item) => item.value === category);

  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${option?.tone ?? CATEGORY_OPTIONS[CATEGORY_OPTIONS.length - 1].tone}`}>
      {option ? `${option.icon} ${option.label}` : `📦 ${category}`}
    </span>
  );
}

function MetaBadge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-navy-700 dark:bg-white/10 dark:text-[#A7B0BE]">
      {children}
    </span>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-[#2B313D]">
      <div
        className="h-full rounded-full bg-burgundy-600 transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
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
    "cartao internacional",
    "documento com foto",
  ];

  return documentTerms.some((term) => normalized.includes(term));
}
