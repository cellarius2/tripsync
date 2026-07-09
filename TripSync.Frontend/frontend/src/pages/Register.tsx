import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import tripSyncLogo from "../assets/tripsync-logo.png";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Preencha todos os campos para criar sua conta.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("A confirmação de senha deve ser igual à senha.");
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password, confirmPassword });
      navigate("/login", {
        replace: true,
        state: { message: "Conta criada com sucesso. Entre para continuar." },
      });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Não foi possível criar sua conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-sand px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex flex-col items-center">
          <div className="auth-brand">
            <img src={tripSyncLogo} alt="TripSync" className="auth-brand-logo" />
            <strong>TripSync</strong>
          </div>
        </Link>

        <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-xl shadow-gray-200/70">
          <div className="mb-6 text-center">
            <h1 className="font-display text-3xl font-semibold text-navy-950">Crie sua conta</h1>
            <p className="mt-2 text-sm leading-6 text-navy-700">Comece a organizar viagens em grupo com mais clareza e diversão.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Nome" type="text" value={name} onChange={setName} placeholder="Seu nome" />
            <Field label="E-mail" type="email" value={email} onChange={setEmail} placeholder="voce@email.com" />
            <Field label="Senha" type="password" value={password} onChange={setPassword} placeholder="Mínimo 6 caracteres" />
            <Field label="Confirmar senha" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Repita sua senha" />

            {error && <div className="rounded-xl border border-burgundy-100 bg-burgundy-50 p-3 text-sm text-burgundy-600">{error}</div>}

            <button type="submit" disabled={loading} className="w-full rounded-full bg-burgundy-600 py-3 font-semibold text-white transition hover:bg-burgundy-700 disabled:opacity-60">
              {loading ? "Criando..." : "Criar conta"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-navy-700">
            Já tem conta? <Link to="/login" className="font-semibold text-burgundy-600 hover:underline">Entrar</Link>
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
