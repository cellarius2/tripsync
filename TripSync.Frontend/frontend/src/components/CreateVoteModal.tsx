import { useState, type FormEvent } from "react";
import Modal from "./Modal";
import { voteService } from "../services/voteService";
import type { VoteCategory } from "../types";

interface CreateVoteModalProps {
  tripId: string;
  onClose: () => void;
  onSaved: () => void;
}

const CATEGORY_OPTIONS: { value: VoteCategory; label: string }[] = [
  { value: 0, label: "Hospedagem" },
  { value: 1, label: "Transporte" },
  { value: 2, label: "Passeio" },
  { value: 3, label: "Restaurante" },
  { value: 4, label: "Horario" },
  { value: 5, label: "Outro" },
];

export default function CreateVoteModal({ tripId, onClose, onSaved }: CreateVoteModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<VoteCategory>(0);
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((option, i) => (i === index ? value : option)));
  }

  function addOption() {
    setOptions((prev) => [...prev, ""]);
  }

  function removeOption(index: number) {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const validOptions = options.map((option) => option.trim()).filter(Boolean);
    if (validOptions.length < 2) {
      setError("Adicione ao menos 2 opcoes.");
      return;
    }

    setLoading(true);
    try {
      await voteService.create(tripId, {
        title,
        category,
        options: validOptions.map((optionTitle) => ({ title: optionTitle })),
      });
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Nao foi possivel criar a votacao.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Nova votacao" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-sand/60">Titulo</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2.5 text-sm focus:border-coral focus:outline-none"
            placeholder="Ex: Qual hospedagem escolher?"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-sand/60">Categoria</label>
          <select
            value={category}
            onChange={(e) => setCategory(Number(e.target.value) as VoteCategory)}
            className="w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2.5 text-sm focus:border-coral focus:outline-none"
          >
            {CATEGORY_OPTIONS.map((categoryOption) => (
              <option key={categoryOption.value} value={categoryOption.value}>
                {categoryOption.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-sand/60">Opcoes</label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 rounded-lg border border-navy-700 bg-navy-950 px-3 py-2 text-sm focus:border-coral focus:outline-none"
                  placeholder={`Opcao ${index + 1}`}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="p-2 text-sand/40 hover:text-coral"
                  >
                    Remover
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addOption}
            className="mt-2 flex items-center gap-1 text-xs text-teal hover:underline"
          >
            <span aria-hidden="true">+</span> Adicionar opcao
          </button>
        </div>

        {error && <p className="rounded-lg bg-coral/10 px-3 py-2 text-sm text-coral">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-coral py-2.5 font-semibold text-navy-950 transition-colors hover:bg-coral-dark disabled:opacity-60"
        >
          {loading ? "Criando..." : "Criar votacao"}
        </button>
      </form>
    </Modal>
  );
}
