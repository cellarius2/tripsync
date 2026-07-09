import { useState, type FormEvent } from "react";
import Modal from "./Modal";
import { checklistService } from "../services/checklistService";
import type { ParticipantSummary } from "../types";

interface ChecklistFormModalProps {
  tripId: string;
  participants: ParticipantSummary[];
  onClose: () => void;
  onSaved: () => void;
}

const CATEGORY_OPTIONS = [
  "Bagagem",
  "Transporte",
  "Hospedagem",
  "Financeiro",
  "Alimentação",
  "Passeios",
  "Cuidados pessoais",
  "Geral",
];

export default function ChecklistFormModal({
  tripId,
  participants,
  onClose,
  onSaved,
}: ChecklistFormModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await checklistService.create(tripId, {
        title: description.trim() ? `${title.trim()} — ${description.trim()}` : title.trim(),
        category,
        assignedToParticipantId: assignedTo || null,
      });
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Não foi possível criar a tarefa.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Adicionar ao checklist" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-sand/60 font-medium block mb-1.5">Título</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-navy-950 border border-navy-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-coral"
            placeholder="Ex: Comprar passagem de volta"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-sand/60 font-medium block mb-1.5">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-navy-950 border border-navy-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-coral"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-sand/60 font-medium block mb-1.5">Responsável</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full bg-navy-950 border border-navy-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-coral"
            >
              <option value="">Sem responsável</option>
              {participants.map((p) => (
                <option key={p.participantId} value={p.participantId}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-sand/60 font-medium block mb-1.5">Descrição opcional</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-none bg-navy-950 border border-navy-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-coral"
            placeholder="Ex: Comprar até sexta-feira"
          />
        </div>

        {error && <p className="text-coral text-sm bg-coral/10 rounded-lg px-3 py-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-coral hover:bg-coral-dark text-navy-950 font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? "Carregando..." : "Adicionar tarefa"}
        </button>
      </form>
    </Modal>
  );
}
