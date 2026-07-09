import { useState, type FormEvent } from "react";
import Modal from "./Modal";
import { expenseService } from "../services/expenseService";
import type { Expense, TripParticipant } from "../types";

interface ExpenseFormModalProps {
  tripId: string;
  participants: TripParticipant[];
  expense: Expense | null;
  onClose: () => void;
  onSaved: () => void;
}

const categories = [
  "Hospedagem",
  "Transporte",
  "Alimentação",
  "Combustível",
  "Pedágio",
  "Passeios",
  "Compras",
  "Documentos",
  "Seguro",
  "Outros",
];

export default function ExpenseFormModal({
  tripId,
  participants,
  expense,
  onClose,
  onSaved,
}: ExpenseFormModalProps) {
  const [description, setDescription] = useState(expense?.description ?? "");
  const [category, setCategory] = useState(expense?.category ?? categories[0]);
  const [amount, setAmount] = useState(expense?.amount.toString() ?? "");
  const [paidBy, setPaidBy] = useState(
    expense?.paidByParticipantId ?? participants[0]?.userId ?? ""
  );
  const [splitEqually, setSplitEqually] = useState(expense?.splitEqually ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const value = Number(amount);

    if (!description.trim()) {
      setError("Informe uma descrição.");
      return;
    }

    if (value <= 0) {
      setError("Informe um valor válido.");
      return;
    }

    if (!paidBy) {
      setError("Selecione quem pagou.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        description: description.trim(),
        category,
        amount: value,
        paidByParticipantId: paidBy,
        splitEqually,
      };

      if (expense) {
        await expenseService.update(tripId, expense.id, payload);
      } else {
        await expenseService.create(tripId, payload);
      }

      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Não foi possível salvar a despesa.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={expense ? "Editar despesa" : "Nova despesa"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Descrição"
          value={description}
          onChange={setDescription}
          placeholder="Ex: Hotel, gasolina, passagem..."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-navy-700">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-navy-950 focus:border-burgundy-500 focus:outline-none"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <Field
            label="Valor"
            value={amount}
            onChange={setAmount}
            placeholder="0.00"
            type="number"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy-700">
            Quem pagou?
          </label>
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-navy-950 focus:border-burgundy-500 focus:outline-none"
          >
            {participants.map((participant) => (
              <option key={participant.userId} value={participant.userId}>
                {participant.name}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4 text-sm font-medium text-navy-700">
          <input
            type="checkbox"
            checked={splitEqually}
            onChange={(e) => setSplitEqually(e.target.checked)}
            className="accent-burgundy-600"
          />
          Dividir igualmente entre todos os participantes
        </label>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-burgundy-600 py-3 text-sm font-semibold text-white transition hover:bg-burgundy-700 disabled:opacity-60"
        >
          {loading ? "Salvando..." : expense ? "Salvar alterações" : "Adicionar despesa"}
        </button>
      </form>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-navy-700">
        {label}
      </label>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-navy-950 focus:border-burgundy-500 focus:outline-none"
      />
    </div>
  );
}