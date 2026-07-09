import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import tripSyncLogo from "../assets/tripsync-logo.png";

interface LocationState {
  message?: string;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = (location.state as LocationState | null)?.message;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Informe e-mail e senha para continuar.");
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Não foi possível entrar. Confira seus dados.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-sand px-4 py-10">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex flex-col items-center">
          <div className="auth-brand">
            <img src={tripSyncLogo} alt="TripSync" className="auth-brand-logo" />
            <strong>TripSync</strong>
          </div>
        </Link>

        <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-xl shadow-gray-200/70">
          <div className="mb-6 text-center">
            <h1 className="font-display text-3xl font-semibold text-navy-950">Bem-vindo de volta</h1>
            <p className="mt-2 text-sm leading-6 text-navy-700">Entre para continuar planejando sua próxima viagem.</p>
          </div>

          {successMessage && (
            <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="E-mail" type="email" value={email} onChange={setEmail} placeholder="voce@email.com" />
            <Field label="Senha" type="password" value={password} onChange={setPassword} placeholder="Sua senha" />

            {error && <div className="rounded-xl border border-burgundy-100 bg-burgundy-50 p-3 text-sm text-burgundy-600">{error}</div>}

            <button type="submit" disabled={loading} className="w-full rounded-full bg-burgundy-600 py-3 font-semibold text-white transition hover:bg-burgundy-700 disabled:opacity-60">
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-navy-700">
            Ainda não tem conta? <Link to="/register" className="font-semibold text-burgundy-600 hover:underline">Cadastre-se</Link>
          </p>
        </section>
      </div>
    </main>
  );
}

function Field({ label, type, value, onChange, placeholder }: { label: string; type: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-navy-700">{label}</label>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-navy-950 transition focus:border-burgundy-500 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
      />
    </div>
  );
}
