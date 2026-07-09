import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import { tripService } from "../services/tripService";

interface JoinTripModalProps {
  onClose: () => void;
  onJoined: () => void;
}

export default function JoinTripModal({ onClose, onJoined }: JoinTripModalProps) {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const dashboard = await tripService.joinTrip({ inviteCode: code.trim() });
      onJoined();
      onClose();
      navigate(`/trips/${dashboard.tripId}`);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Código inválido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Entrar em uma viagem" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy-700">Código de convite</label>
          <input
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={8}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 font-mono text-sm uppercase tracking-widest text-navy-950 transition focus:border-burgundy-500 focus:outline-none"
            placeholder="EX: 3F9A2B7C"
          />
        </div>

        {error && <p className="rounded-xl bg-burgundy-50 px-3 py-2 text-sm text-burgundy-600">{error}</p>}

        <button type="submit" disabled={loading} className="flex w-full items-center justify-center rounded-full bg-burgundy-600 py-3 font-semibold text-white transition hover:bg-burgundy-700 disabled:opacity-60">
          {loading ? "Entrando..." : "Entrar na viagem"}
        </button>
      </form>
    </Modal>
  );
}
