import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { tripService } from "../services/tripService";
import type { TripType } from "../types";

export default function CreateTrip() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState<TripType>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (new Date(endDate) < new Date(startDate)) {
      setError("A data de volta não pode ser antes da data de ida.");
      return;
    }

    setLoading(true);

    try {
      const trip = await tripService.createTrip({
        name,
        origin,
        destination,
        startDate,
        endDate,
        type,
      });

      navigate(`/trips/${trip.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Não foi possível criar a viagem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-sand">
      <Navbar />

      <main className="mx-auto max-w-4xl px-5 py-10 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wide text-burgundy-600">
            Novo círculo
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold">
            Criar uma nova viagem
          </h1>
          <p className="mt-2 text-navy-700">
            Preencha os detalhes e convide o grupo depois pelo código da viagem.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-[2rem] border border-gray-200 bg-white p-6 shadow-xl shadow-gray-200/70"
        >
          <div>
            <label className="mb-3 block text-sm font-semibold text-navy-950">
              Tipo da viagem
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <TripTypeButton
                active={type === 0}
                title="Nacional"
                text="Categorias como gasolina, pedágio e transporte local."
                onClick={() => setType(0)}
              />

              <TripTypeButton
                active={type === 1}
                title="Internacional"
                text="Categorias como câmbio, visto, seguro e passaporte."
                onClick={() => setType(1)}
              />
            </div>
          </div>

          <Field
            label="Nome da viagem"
            value={name}
            onChange={setName}
            placeholder="Ex: Paraná → Rio de Janeiro"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Origem"
              value={origin}
              onChange={setOrigin}
              placeholder="Ex: Paraná"
            />

            <Field
              label="Destino"
              value={destination}
              onChange={setDestination}
              placeholder="Ex: Rio de Janeiro"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Data de ida"
              value={startDate}
              onChange={setStartDate}
              type="date"
            />

            <Field
              label="Data de volta"
              value={endDate}
              onChange={setEndDate}
              type="date"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-burgundy-50 px-4 py-3 text-sm text-burgundy-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-burgundy-600 py-4 font-semibold text-white transition hover:bg-burgundy-700 disabled:opacity-60"
          >
            {loading ? "Criando..." : "Criar viagem"}
          </button>
        </form>
      </main>
    </div>
  );
}

function TripTypeButton({
  active,
  title,
  text,
  onClick,
}: {
  active: boolean;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-3xl border p-5 text-left transition ${
        active
          ? "border-burgundy-500 bg-burgundy-50"
          : "border-gray-200 bg-gray-50 hover:border-burgundy-100"
      }`}
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
        ✈️
      </div>
      <p className="font-semibold text-navy-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-navy-700">{text}</p>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  min?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-navy-700">
        {label}
      </label>

      <input
        type={type}
        required
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-navy-950 transition focus:border-burgundy-500 focus:outline-none"
      />
    </div>
  );
}