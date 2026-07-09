import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  LockKeyhole,
  Search,
  TicketCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Brand from "../components/common/Brand";
import TripCard from "../components/TripCard";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { tripService } from "../services/tripService";
import type { TripListItem } from "../types";

type TripFilter = "all" | "national" | "international";
type TripSort = "recent" | "oldest" | "name" | "date";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<TripListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState("");
  const [joinOpen, setJoinOpen] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TripFilter>("all");
  const [sort, setSort] = useState<TripSort>("recent");

  useEffect(() => {
    void loadTrips();
  }, []);

  async function loadTrips() {
    try {
      setLoading(true);
      const data = await tripService.getMyTrips();
      setTrips(data);
    } catch {
      setError("Não foi possível carregar suas viagens.");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinTrip() {
    try {
      setError("");
      await tripService.joinTrip({ inviteCode });
      setJoinOpen(false);
      setInviteCode("");
      await loadTrips();
    } catch {
      setError("Não foi possível entrar nessa viagem. Confira o código.");
    }
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const visibleTrips = useMemo(() => {
    const query = normalizeText(search.trim());
    const filtered = trips.filter((trip) => {
      const matchesType =
        filter === "all" ||
        (filter === "national" && trip.type === 0) ||
        (filter === "international" && trip.type === 1);
      const searchable = normalizeText(
        `${trip.name} ${trip.origin} ${trip.destination} ${trip.inviteCode}`,
      );
      return matchesType && (!query || searchable.includes(query));
    });

    return [...filtered].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name, "pt-BR");
      if (sort === "oldest" || sort === "date") {
        return dateValue(a.startDate) - dateValue(b.startDate);
      }
      return dateValue(b.startDate) - dateValue(a.startDate);
    });
  }, [filter, search, sort, trips]);

  return (
    <div className="trips-page">
      <header className="trips-navbar">
        <div className="trips-navbar-inner">
          <Brand userName={user?.name} />
          <div className="trips-navbar-actions">
            <ThemeToggle />
            <button type="button" onClick={handleLogout} className="trips-logout">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="trips-shell">
        <section className="trips-hero">
          <div className="trips-hero-copy">
            <span className="trips-protected-badge">
              <LockKeyhole size={13} aria-hidden="true" />
              Área protegida
            </span>
            <h1>Suas viagens</h1>
            <p>Encontre uma viagem existente ou crie uma nova jornada com seu grupo.</p>
          </div>

          <div className="trips-hero-actions">
            <ActionCard
              icon={<TicketCheck size={22} aria-hidden="true" />}
              title="Entrar com código de convite"
              text="Use um código enviado pelo organizador para acessar uma viagem compartilhada."
              onClick={() => setJoinOpen(true)}
            />
            <ActionCard
              icon={<BriefcaseBusiness size={22} aria-hidden="true" />}
              title="Criar uma nova viagem"
              text="Prepare uma jornada com destino, datas, participantes e planejamento."
              onClick={() => navigate("/trips/new")}
            />
          </div>
        </section>

        {error && <div className="trips-error" role="alert">{error}</div>}

        <section className="trips-toolbar" aria-label="Buscar e filtrar viagens">
          <label className="trips-search">
            <Search size={18} aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar viagem, destino ou código..."
              aria-label="Buscar viagem, destino ou código"
            />
          </label>

          <div className="trips-filters" aria-label="Filtrar por tipo">
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>Todas</FilterChip>
            <FilterChip active={filter === "national"} onClick={() => setFilter("national")}>Nacional</FilterChip>
            <FilterChip active={filter === "international"} onClick={() => setFilter("international")}>Internacional</FilterChip>
          </div>

          <div className="trips-toolbar-right">
            <label className="trips-sort">
              <span>Ordenar por:</span>
              <select value={sort} onChange={(event) => setSort(event.target.value as TripSort)}>
                <option value="recent">Mais recentes</option>
                <option value="oldest">Mais antigas</option>
                <option value="name">Nome</option>
                <option value="date">Data da viagem</option>
              </select>
            </label>
            <span className="trips-count-pill">
              <BriefcaseBusiness size={17} aria-hidden="true" />
              {visibleTrips.length} {visibleTrips.length === 1 ? "viagem" : "viagens"}
            </span>
          </div>
        </section>

        <section aria-live="polite">
          {loading ? (
            <div className="trips-grid" aria-label="Carregando viagens">
              {Array.from({ length: 8 }, (_, index) => (
                <div className="trip-card-skeleton" key={index} />
              ))}
            </div>
          ) : visibleTrips.length > 0 ? (
            <div className="trips-grid">
              {visibleTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} onOpen={() => navigate(`/trips/${trip.id}`)} />
              ))}
            </div>
          ) : trips.length === 0 ? (
            <div className="trips-empty">
              <BriefcaseBusiness size={28} aria-hidden="true" />
              <h2>Você ainda não tem viagens cadastradas.</h2>
              <p>Crie uma nova jornada ou entre com o código enviado pelo seu grupo.</p>
              <button type="button" onClick={() => navigate("/trips/new")}>Criar viagem</button>
            </div>
          ) : (
            <div className="trips-empty">
              <Search size={28} aria-hidden="true" />
              <h2>Nenhuma viagem encontrada.</h2>
              <p>Experimente alterar a busca ou os filtros selecionados.</p>
              <button type="button" onClick={() => { setSearch(""); setFilter("all"); }}>
                Limpar filtros
              </button>
            </div>
          )}
        </section>
      </main>

      {joinOpen && (
        <div className="trips-modal-overlay" role="presentation" onMouseDown={() => setJoinOpen(false)}>
          <div
            className="trips-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="join-trip-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 id="join-trip-title">Entrar com código</h2>
            <p>Digite o código enviado pelo organizador da viagem.</p>
            <input
              autoFocus
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
              placeholder="TRIP-ABCDE"
            />
            <div className="trips-modal-actions">
              <button type="button" className="is-secondary" onClick={() => setJoinOpen(false)}>Cancelar</button>
              <button type="button" onClick={handleJoinTrip} disabled={!inviteCode.trim()}>Entrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionCard({
  icon,
  title,
  text,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="trips-action-card" onClick={onClick}>
      <span className="trips-action-accent" aria-hidden="true" />
      <span className="trips-action-icon">{icon}</span>
      <span className="trips-action-copy">
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
      <span className="trips-action-arrow"><ArrowRight size={19} aria-hidden="true" /></span>
    </button>
  );
}

function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`trips-filter-chip${active ? " is-active" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function dateValue(value: string) {
  const date = new Date(value).getTime();
  return Number.isNaN(date) ? 0 : date;
}
