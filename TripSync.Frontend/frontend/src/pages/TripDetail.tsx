import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { tripService, updateMyTripAvatar } from "../services/tripService";
import type { ChecklistItem, DocumentSummary, Notification, TripDetails, VotePoll } from "../types";
import CrewMemberCard from "../components/command-center/CrewMemberCard";
import EmptyState from "../components/command-center/EmptyState";
import { useTripRealtime } from "../hooks/useTripRealtime";

import {
  financialPlanningService,
  type FinancialSummary,
  type ParticipantProgress,
  type TravelBudget,
} from "../services/financialPlanningService";
import { checklistService } from "../services/checklistService";
import { documentService } from "../services/documentService";
import { voteService } from "../services/voteService";
import { notificationService } from "../services/notificationService";
import FinancialPlanningTab from "../components/tabs/FinancialPlanningTab";
import ChecklistTab from "../components/tabs/ChecklistTab";
import DocumentsTab from "../components/tabs/DocumentsTab";
import VotesTab from "../components/tabs/VotesTab";
import OrganizationModal from "../components/OrganizationModal";
import AiPlanningAssistant from "../components/trip/AiPlanningAssistant";
import ChecklistFormModal from "../components/ChecklistFormModal";
import CreateVoteModal from "../components/CreateVoteModal";
import TravelBackground from "../components/trip/TravelBackground";
import AvatarPickerModal from "../components/trip/AvatarPickerModal";
import TomatoEffect from "../components/trip/TomatoEffect";
import { useAuth } from "../context/AuthContext";
import type { AvatarKey } from "../data/avatarOptions";

type OrganizationPanel = "financeiro" | "checklist" | "votacoes" | "documentos" | null;
type DashboardVotingTab = "active" | "decided" | "all";

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [financialBudget, setFinancialBudget] = useState<TravelBudget | null>(null);
  const [organizationParticipants, setOrganizationParticipants] = useState<ParticipantProgress[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [documentSummary, setDocumentSummary] = useState<DocumentSummary | null>(null);
  const [polls, setPolls] = useState<VotePoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeOrganizationPanel, setActiveOrganizationPanel] = useState<OrganizationPanel>(null);
  const [showQuickChecklistForm, setShowQuickChecklistForm] = useState(false);
  const [showQuickVoteForm, setShowQuickVoteForm] = useState(false);
  const [dashboardVotingTab, setDashboardVotingTab] = useState<DashboardVotingTab>("active");
  const [dashboardActionLoading, setDashboardActionLoading] = useState<string | null>(null);
  const [copilotOpenSignal, setCopilotOpenSignal] = useState(0);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [tomatoEffectVisible, setTomatoEffectVisible] = useState(false);
  const scrollYRef = useRef<number | null>(null);

  function rememberScroll() {
    scrollYRef.current = window.scrollY;
  }

  function restoreScroll() {
    const savedScrollY = scrollYRef.current;
    if (savedScrollY === null) return;

    const applyScroll = () => {
      window.scrollTo({ top: savedScrollY, left: 0, behavior: "auto" });
    };

    applyScroll();
    window.requestAnimationFrame(() => {
      applyScroll();
      window.requestAnimationFrame(applyScroll);
    });
    window.setTimeout(applyScroll, 0);
    window.setTimeout(applyScroll, 80);
  }

  function runKeepingScroll(action: () => void) {
    rememberScroll();
    action();
    restoreScroll();
  }

  useEffect(() => {
    loadPage();
  }, [id]);

  useEffect(() => {
    function handleRememberScroll() {
      rememberScroll();
    }

    window.addEventListener("tripsync:remember-scroll", handleRememberScroll);

    return () => {
      window.removeEventListener("tripsync:remember-scroll", handleRememberScroll);
    };
  }, []);

  async function loadPage() {
    if (!id) return;

    try {
      setLoading(true);

      const tripData = await tripService.getTripById(id);

      setTrip(tripData);
      await loadOrganizationData(id);
    } catch {
      setError("Não foi possível carregar os detalhes da viagem.");
    } finally {
      setLoading(false);
    }
  }

  async function loadTrip() {
    if (!id) return;

    const data = await tripService.getTripById(id);
    setTrip(data);
  }

  async function loadOrganizationData(tripId: string = id ?? "") {
    if (!tripId) return;

    const [financeData, budgetData, progressData, checklistData, documentsData, pollsData] = await Promise.all([
      financialPlanningService.getSummary(tripId).catch(() => null),
      financialPlanningService.getBudget(tripId).catch(() => null),
      financialPlanningService.getProgress(tripId).catch(() => []),
      checklistService.list(tripId).catch(() => []),
      documentService.getSummary(tripId).catch(() => null),
      voteService.list(tripId).catch(() => []),
    ]);

    setFinancialSummary(financeData);
    setFinancialBudget(budgetData);
    setOrganizationParticipants(progressData);
    setChecklistItems(checklistData);
    setDocumentSummary(documentsData);
    setPolls(pollsData);
  }

  async function refreshOrganization() {
    await Promise.all([
      loadTrip(),
      loadOrganizationData(),
    ]);
  }

  function copyInviteCode() {
    if (!trip) return;

    navigator.clipboard.writeText(trip.inviteCode);
    setCopied(true);
    showToast("Código de convite copiado!");
    setTimeout(() => setCopied(false), 2000);
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }

  async function throwTomato(participant: TripDetails["participants"][number]) {
    if (!id || !user) return;

    if (participant.userId === user.id) {
      showToast("Você não pode jogar tomate em si mesmo.");
      return;
    }

    try {
      await notificationService.throwTomato(id, participant.userId);
      showToast("Tomate lançado.");
    } catch {
      showToast("Não foi possível lançar o tomate.");
    }
  }

  function handleNotification(notification: Notification) {
    if (notification.recipientUserId && notification.recipientUserId !== user?.id) {
      return;
    }

    window.dispatchEvent(new CustomEvent("tripsync:notification", { detail: notification }));

    const notificationType = (notification.type ?? "").toUpperCase();

    if (notificationType === "TOMATO_THROWN" && notification.recipientUserId === user?.id) {
      setTomatoEffectVisible(true);
      window.setTimeout(() => setTomatoEffectVisible(false), 2400);
    }
  }

  function openOrganizationPanel(panel: Exclude<OrganizationPanel, null>) {
    runKeepingScroll(() => setActiveOrganizationPanel(panel));
  }

  function closeOrganizationPanel() {
    runKeepingScroll(() => setActiveOrganizationPanel(null));
  }

  function openChecklistCreate() {
    runKeepingScroll(() => setShowQuickChecklistForm(true));
  }

  function closeChecklistCreate() {
    runKeepingScroll(() => setShowQuickChecklistForm(false));
  }

  function openVoteCreate() {
    runKeepingScroll(() => setShowQuickVoteForm(true));
  }

  function closeVoteCreate() {
    runKeepingScroll(() => setShowQuickVoteForm(false));
  }

  function openCopilot() {
    setCopilotOpenSignal((current) => current + 1);
  }

  async function toggleDashboardChecklistItem(item: ChecklistItem) {
    if (!id || dashboardActionLoading) return;

    const nextItem = { ...item, isDone: !item.isDone };

    setDashboardActionLoading(`checklist-${item.id}`);
    setChecklistItems((current) =>
      current.map((checklistItem) => checklistItem.id === item.id ? nextItem : checklistItem)
    );

    try {
      const updatedItem = await checklistService.toggle(id, item.id);
      setChecklistItems((current) =>
        current.map((checklistItem) => checklistItem.id === item.id ? updatedItem : checklistItem)
      );
    } catch {
      setChecklistItems((current) =>
        current.map((checklistItem) => checklistItem.id === item.id ? item : checklistItem)
      );
      showToast("Não foi possível atualizar a tarefa.");
    } finally {
      setDashboardActionLoading(null);
    }
  }

  async function castDashboardVote(poll: VotePoll, optionId: string) {
    if (poll.isClosed || dashboardActionLoading) return;

    setDashboardActionLoading(`vote-${poll.id}-${optionId}`);

    try {
      const updatedPoll = await voteService.cast(poll.id, { optionId });
      setPolls((current) =>
        current.map((currentPoll) => currentPoll.id === poll.id ? updatedPoll : currentPoll)
      );
      showToast("Voto registrado.");
    } catch {
      showToast("Não foi possível registrar o voto.");
    } finally {
      setDashboardActionLoading(null);
    }
  }

  async function updateMyAvatar(avatarKey: AvatarKey) {
    if (!id || !user) return;

    try {
      setSavingAvatar(true);
      const updatedParticipant = await updateMyTripAvatar(id, avatarKey);
      const savedAvatarKey = updatedParticipant.avatarKey ?? avatarKey;

      setTrip((current) => {
        if (!current) return current;

        return {
          ...current,
          participants: current.participants.map((participant) =>
            participant.userId === user.id ? { ...participant, avatarKey: savedAvatarKey } : participant
          ),
        };
      });

      setAvatarPickerOpen(false);
      showToast("Avatar atualizado com sucesso.");
    } catch {
      showToast("Não foi possível atualizar o avatar.");
      throw new Error("Avatar update failed");
    } finally {
      setSavingAvatar(false);
    }
  }

  useTripRealtime({
    tripId: id ?? "",
    onDashboardUpdated: refreshOrganization,
    onNotification: handleNotification,
    onActivity: () => undefined,
  });

  const totals = useMemo(() => {
    if (!trip) {
      return {
        totalSaved: 0,
        valuePerPerson: 0,
        financePercent: 0,
        readinessPercent: 0,
      };
    }

    const fallbackSaved = trip.participants.reduce((sum, participant) => {
      return sum + (participant.amountSaved ?? 0);
    }, 0);
    const totalBudget = calculateFinancialTotal(financialSummary, financialBudget, trip);
    const totalSaved = calculateGroupSaved(financialSummary, fallbackSaved);
    const financePercent = calculateFinancialProgress(totalBudget, totalSaved);
    const participantCount = Math.max(1, trip.participants.length);
    const progressTargets = organizationParticipants
      .map((participant) => participant.targetAmount)
      .filter((value) => typeof value === "number" && value > 0);

    const valuePerPerson =
      progressTargets[0] ??
      firstPositiveNumber(financialSummary?.valuePerPerson, totalBudget / participantCount);

    const readinessPercent = calculateTripReadiness({
      trip,
      checklistItems,
      documentSummary,
      financialProgress: financePercent,
      polls,
    }).totalPercentage;

    return {
      totalSaved,
      valuePerPerson,
      financePercent,
      readinessPercent,
    };
  }, [
    trip,
    financialSummary,
    financialBudget,
    organizationParticipants,
    checklistItems,
    documentSummary,
    polls,
  ]);

  if (loading) {
    return (
      <div className="trip-command-shell min-h-dvh">
        <Navbar />

        <main className="py-20 text-center text-[color:var(--text-muted)]">
          Carregando centro de comando...
        </main>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="trip-command-shell min-h-dvh">
        <Navbar />

        <main className="px-6 py-20 text-center">
          <p className="mb-2 font-semibold text-[color:var(--trip-accent)]">Não deu para abrir a viagem</p>
          <p className="mb-5 text-sm text-[color:var(--text-muted)]">{error}</p>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="rounded-full bg-[color:var(--trip-button-bg)] px-5 py-3 text-sm font-semibold text-[color:var(--trip-button-text)] transition hover:bg-[color:var(--accent-hover)]"
          >
            Voltar ao dashboard
          </button>
        </main>
      </div>
    );
  }

  const daysLeft = getDaysLeft(trip.startDate);
  const checklistCompleted = checklistItems.filter((item) => item.isDone).length;
  const checklistPercent =
    checklistItems.length > 0 ? Math.round((checklistCompleted / checklistItems.length) * 100) : 0;
  const openPolls = polls.filter((poll) => !poll.isClosed);
  const closedPolls = polls.filter((poll) => poll.isClosed);
  const financeBudget = calculateFinancialTotal(financialSummary, financialBudget, trip);
  const financeSaved = calculateGroupSaved(financialSummary, totals.totalSaved);
  const financeProgress = calculateFinancialProgress(financeBudget, financeSaved);
  const financeRemaining = Math.max(0, financeBudget - financeSaved);
  const myContribution = financialSummary?.mySavedAmount ?? 0;
  const documentsTotal = documentSummary?.totalDocuments ?? 0;
  const documentsDone = documentSummary?.completedDocuments ?? 0;
  const documentsPercent = documentSummary?.percentage ?? 0;

  const orderedParticipants = [...trip.participants].sort((a, b) => {
    if (a.userId === user?.id) return -1;
    if (b.userId === user?.id) return 1;
    return 0;
  });

  return (
    <div className={`trip-command-shell relative min-h-dvh overflow-x-hidden text-[color:var(--text)] ${tomatoEffectVisible ? "trip-tomato-shake" : ""}`}>
      <TravelBackground />

      <div className="relative z-10">
        <Navbar />

        {toast && (
          <div className="fixed right-6 top-20 z-50 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-3 text-sm font-semibold text-[color:var(--text)] shadow-[var(--shadow)]">
            {toast}
          </div>
        )}

        <TomatoEffect active={tomatoEffectVisible} />

        <AvatarPickerModal
          open={avatarPickerOpen}
          currentAvatarKey={trip.participants.find((participant) => participant.userId === user?.id)?.avatarKey}
          loading={savingAvatar}
          onClose={() => setAvatarPickerOpen(false)}
          onSave={updateMyAvatar}
        />

        <main className="trip-detail-main relative z-10 mx-auto flex flex-col gap-5 pb-10 pt-5 lg:pt-6">
          <div className="trip-detail-first-fold flex flex-col gap-5">
            <section className="trip-detail-top-area grid w-full items-stretch gap-5 min-[900px]:grid-cols-[minmax(0,1.75fr)_minmax(420px,0.95fr)]">
              <div className="trip-panel relative h-auto overflow-hidden rounded-[1.45rem] p-6 pb-6 md:p-8 md:pb-6 lg:p-8 lg:pb-6">
                <div className="trip-route-grid pointer-events-none absolute inset-0" />
                <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full border border-[color:var(--trip-accent-mid)] opacity-80" />
                <div className="pointer-events-none absolute -left-12 top-28 h-32 w-32 rotate-45 border-l border-t border-[color:var(--trip-accent-mid)] opacity-70" />
                <div className="pointer-events-none absolute left-20 top-8 h-3 w-3 rotate-45 bg-[color:var(--trip-accent)] opacity-70" />
                <div className="pointer-events-none absolute left-28 top-15 h-2 w-2 rotate-45 bg-[color:var(--trip-accent)] opacity-45" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--trip-accent-mid)] to-transparent" />

                <div className="relative flex min-w-0 flex-col justify-between">
                  <div className="min-w-0">
                    <span className="rounded-md bg-[color:var(--trip-button-bg)] px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-[color:var(--trip-button-text)] shadow-lg shadow-[var(--trip-shadow)]">
                      CENTRO DE COMANDO
                    </span>

                    <h1 className="mt-4 flex w-full min-w-0 flex-wrap items-center justify-start gap-x-4 gap-y-2 font-display text-5xl font-semibold leading-none text-[color:var(--text)] sm:text-6xl lg:text-7xl xl:text-8xl">
                      <span className="min-w-0 break-words">{trip.origin}</span>
                      <span className="shrink-0 text-[color:var(--accent)]">→</span>
                      <span className="min-w-0 break-words">{trip.destination}</span>
                    </h1>

                    <p className="mt-3 text-sm text-[color:var(--text-muted)] sm:text-base">
                      {trip.name} • {formatDate(trip.startDate)} a {formatDate(trip.endDate)}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2.5">
                      <Badge>
                        🌐 {trip.type === 0 ? "BR Viagem nacional" : "Global Viagem internacional"}
                      </Badge>

                      <Badge>
                        📅 {daysLeft > 0 ? `Faltam ${daysLeft} dias` : "Viagem em andamento"}
                      </Badge>

                      <Badge>👥 {trip.participants.length} tripulante(s)</Badge>
                    </div>
                  </div>

                  <div className="mt-5 w-full">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">
                      <span>Prontidão da viagem</span>
                      <span className="font-mono">{totals.readinessPercent}%</span>
                    </div>

                    <div className="trip-progress-track h-2 overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full bg-[color:var(--accent)] transition-all"
                        style={{ width: `${totals.readinessPercent}%` }}
                      />
                    </div>

                    <p className="mt-3 text-sm text-[color:var(--text-muted)]">
                      {getReadinessMessage(totals.readinessPercent)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex h-full min-h-0 min-w-0 flex-col gap-3">
                <button
                  type="button"
                  onClick={copyInviteCode}
                  className="trip-panel flex min-h-[58px] w-full items-center justify-between gap-4 rounded-[1.25rem] px-5 py-3 text-left text-sm font-semibold transition hover:border-[color:var(--accent)]"
                >
                  <span>
                    {copied ? "Código copiado!" : "Código de convite"}:{" "}
                    <span className="font-mono">{trip.inviteCode}</span>
                  </span>
                  <span aria-hidden="true" className="text-lg text-[color:var(--text-muted)]">⧉</span>
                </button>

                <FinancialHeroSummaryCard
                  totalBudget={financeBudget}
                  totalSaved={financeSaved}
                  remaining={financeRemaining}
                  progress={financeProgress}
                  onOpen={() => openOrganizationPanel("financeiro")}
                />
              </div>
            </section>

            <section className="trip-panel trip-detail-crew-section min-h-[340px] w-full rounded-[1.75rem] p-5 md:p-6">
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="flex items-center gap-3 font-display text-xl font-semibold uppercase tracking-[0.18em] text-[color:var(--text)]">
                    <span className="text-[color:var(--accent)]">👥</span> TRIPULANTES
                  </h2>

                  <p className="text-sm text-[color:var(--text-muted)]">
                    Sua tripulação, seus aliados nessa jornada.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={copyInviteCode}
                  className="w-fit rounded-full border border-[color:var(--border)] bg-[color:var(--surface-soft)] px-5 py-2.5 text-sm font-semibold text-[color:var(--text)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                >
                  Convidar tripulante +
                </button>
              </div>

              {trip.participants.length === 0 ? (
                <EmptyState
                  icon="🛫"
                  title="Sua tripulação ainda está vazia"
                  text="Compartilhe o código de convite para seus amigos entrarem na viagem."
                />
              ) : (
                <div className="crew-strip flex w-full flex-nowrap justify-start gap-4 overflow-x-auto overflow-y-hidden pb-4">
                  {orderedParticipants.map((participant) => {
                    const participantProgress = findParticipantProgress(participant, organizationParticipants);
                    const savedAmount = firstDefinedNumber(
                      participantProgress?.amountSaved,
                      participant.amountSaved
                    );
                    const targetAmount = firstPositiveNumber(
                      participantProgress?.targetAmount,
                      totals.valuePerPerson
                    );

                    return (
                      <CrewMemberCard
                        key={participant.userId}
                        participant={{ ...participant, amountSaved: savedAmount }}
                        valuePerPerson={targetAmount}
                        highlighted={participant.userId === user?.id || participant.isOwner}
                        canEditAvatar={participant.userId === user?.id}
                        onEditAvatar={() => setAvatarPickerOpen(true)}
                        onTomato={() => throwTomato(participant)}
                      />
                    );
                  })}
                </div>
              )}
            </section>

          </div>

          <AiPlanningAssistant
            trip={trip}
            onApplied={refreshOrganization}
            openSignal={copilotOpenSignal}
            showTrigger={false}
          />

          <section className="trip-panel flex scroll-mt-4 flex-col rounded-[1.5rem] p-4 sm:p-5 lg:p-5">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>

                <h2 className="mt-2 font-display text-3xl font-semibold text-[color:var(--accent)] lg:text-4xl">
                  Centro de organização
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-[color:var(--text-muted)]">
                  Gerencie o dinheiro, tarefas, decisões e documentos da viagem em um só lugar.
                </p>
              </div>
              <button
                type="button"
                onClick={openCopilot}
                className="mt-1 inline-flex w-fit shrink-0 items-center gap-2 self-start rounded-full border border-[color:var(--border)] bg-[color:var(--surface-soft)] px-4 py-2 text-xs font-bold text-[color:var(--text-muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] lg:self-center"
              >
                <span className="text-[color:var(--accent)]">✦</span>
                Copilot | Gerar Automaticamente
              </button>
            </div>

            <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.9fr)]">
              <OrganizationCard className="min-h-[172px]">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--accent)]">
                      Planejamento financeiro
                    </p>
                    <h3 className="mt-1.5 font-display text-3xl font-semibold text-[color:var(--text)]">
                      {formatCurrency(financeBudget)}
                    </h3>
                    <p className="mt-1 text-sm text-[color:var(--text-muted)]">Orçamento total estimado</p>
                  </div>

                  <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--accent-soft)] px-4 py-2 font-mono text-sm font-semibold text-[color:var(--accent)]">
                    {financeProgress}%
                  </span>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">
                    <span>Economizado pelo grupo</span>
                    <span>{formatCurrency(financeSaved)}</span>
                  </div>
                  <ProgressBar percent={financeProgress} />
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <MiniMetric label="Grupo" value={formatCurrency(financeSaved)} />
                  <MiniMetric label="Minha contribuição" value={formatCurrency(myContribution)} />
                  <MiniMetric label="Ainda falta" value={formatCurrency(financeRemaining)} />
                </div>

                <div className="mt-4">
                  <ActionButton onClick={() => openOrganizationPanel("financeiro")}>
                    Abrir planejamento
                  </ActionButton>
                </div>
              </OrganizationCard>

              <OrganizationCard className="min-h-[172px]">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--accent)]">
                  Resumo do grupo
                </p>

                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  <DashboardStat icon="😉" label="Participantes" value={String(trip.participants.length)} />
                  <DashboardStat icon="✔" label="Checklist concluído" value={`${checklistCompleted}/${checklistItems.length}`} />
                  <DashboardStat icon="🗂️" label="Documentos enviados" value={`${documentsDone}/${documentsTotal}`} />
                  <DashboardStat icon="🎉" label="Votações abertas" value={String(openPolls.length)} />
                  <DashboardStat icon="💰" label="Progresso financeiro" value={`${financeProgress}%`} />
                </div>
              </OrganizationCard>

              <DashboardChecklistCard
                items={checklistItems}
                completedCount={checklistCompleted}
                percent={checklistPercent}
                actionLoading={dashboardActionLoading}
                onToggle={toggleDashboardChecklistItem}
                onOpen={() => openOrganizationPanel("checklist")}
                onCreate={openChecklistCreate}
              />

              <DashboardVotingCard
                polls={polls}
                openCount={openPolls.length}
                closedCount={closedPolls.length}
                activeTab={dashboardVotingTab}
                actionLoading={dashboardActionLoading}
                onTabChange={setDashboardVotingTab}
                onVote={castDashboardVote}
                onOpen={() => openOrganizationPanel("votacoes")}
                onCreate={openVoteCreate}
              />

              <OrganizationCard className="min-h-[86px] xl:col-span-2">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--accent)]">
                      Documentos da viagem
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-semibold text-[color:var(--text)]">
                      {documentsDone} de {documentsTotal} documentos enviados
                    </h3>
                    <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                      {Math.max(0, documentsTotal - documentsDone)} documento(s) pendente(s).
                    </p>
                  </div>

                  <div className="min-w-0 flex-1 lg:max-w-md">
                    <div className="mb-2 flex justify-between text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">
                      <span>Progresso documental</span>
                      <span>{documentsPercent}%</span>
                    </div>
                    <ProgressBar percent={documentsPercent} />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <ActionButton onClick={() => openOrganizationPanel("documentos")}>
                      Abrir documentos
                    </ActionButton>
                  </div>
                </div>
              </OrganizationCard>
            </div>
          </section>

          {activeOrganizationPanel && (
            <OrganizationModal
              title={getOrganizationPanelTitle(activeOrganizationPanel)}
              onClose={closeOrganizationPanel}
            >
              {activeOrganizationPanel === "financeiro" && (
                <FinancialPlanningTab
                  tripId={trip.id}
                  onChanged={refreshOrganization}
                  onNotify={showToast}
                />
              )}
              {activeOrganizationPanel === "checklist" && (
                <ChecklistTab
                  tripId={trip.id}
                  onChanged={refreshOrganization}
                />
              )}
              {activeOrganizationPanel === "votacoes" && (
                <VotesTab
                  tripId={trip.id}
                  onChanged={refreshOrganization}
                />
              )}
              {activeOrganizationPanel === "documentos" && (
                <DocumentsTab tripId={trip.id} onChanged={refreshOrganization} />
              )}
            </OrganizationModal>
          )}

          {showQuickChecklistForm && (
            <ChecklistFormModal
              tripId={trip.id}
              participants={organizationParticipants}
              onClose={closeChecklistCreate}
              onSaved={async () => {
                closeChecklistCreate();
                await refreshOrganization();
                restoreScroll();
              }}
            />
          )}

          {showQuickVoteForm && (
            <CreateVoteModal
              tripId={trip.id}
              onClose={closeVoteCreate}
              onSaved={async () => {
                closeVoteCreate();
                await refreshOrganization();
                restoreScroll();
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-soft)] px-3.5 py-2 text-xs font-semibold text-[color:var(--text)] backdrop-blur-sm">
      {children}
    </span>
  );
}

function FinancialHeroSummaryCard({
  totalBudget,
  totalSaved,
  remaining,
  progress,
  onOpen,
}: {
  totalBudget: number;
  totalSaved: number;
  remaining: number;
  progress: number;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Abrir planejamento financeiro"
      className="trip-panel group flex min-h-[360px] flex-1 flex-col justify-between rounded-[1.35rem] p-5 text-left transition hover:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/70"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--text)]">
            PLANEJAMENTO FINANCEIRO <span className="text-[color:var(--trip-warning)]">☀</span>
          </p>
          <p className="mt-4 text-sm text-[color:var(--text-muted)]">
            Orçamento total estimado
          </p>
          <p className="mt-1 font-display text-3xl font-semibold leading-none text-[color:var(--text)]">
            {formatCurrency(totalBudget)}
          </p>
        </div>

        <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--accent-soft)] px-4 py-2 font-mono text-xs font-semibold text-[color:var(--accent)]">
          {progress}%
        </span>
      </div>

      <div className="mt-4">
        <ProgressBar percent={progress} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-soft)] px-4 py-4 transition">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
            Economizado pelo grupo
          </p>
          <p className="mt-2 truncate font-mono text-lg font-semibold text-[color:var(--text)]">
            {formatCurrency(totalSaved)}
          </p>
        </div>

        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-soft)] px-4 py-4 transition">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
            Ainda falta
          </p>
          <p className="mt-2 truncate font-mono text-lg font-semibold text-[color:var(--text)]">
            {formatCurrency(remaining)}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-[color:var(--text-muted)]">
        Os valores serão atualizados conforme o planejamento da viagem.
      </p>
    </button>
  );
}

function OrganizationCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article className={`trip-panel-soft flex min-w-0 flex-col rounded-[1.5rem] p-4 shadow-sm ${className}`}>
      {children}
    </article>
  );
}

function DashboardChecklistCard({
  items,
  completedCount,
  percent,
  actionLoading,
  onToggle,
  onOpen,
  onCreate,
}: {
  items: ChecklistItem[];
  completedCount: number;
  percent: number;
  actionLoading: string | null;
  onToggle: (item: ChecklistItem) => void;
  onOpen: () => void;
  onCreate: () => void;
}) {
  const pendingItems = items.filter((item) => !item.isDone);
  const doneItems = items.filter((item) => item.isDone);
  const previewItems = [...pendingItems, ...doneItems];
  const allDone = items.length > 0 && pendingItems.length === 0;

  return (
    <OrganizationCard className="dashboard-action-card dashboard-checklist-card min-h-[276px]">
      <div className="dashboard-card-header">
        <div className="min-w-0">
          <p className="dashboard-card-kicker">
            <span aria-hidden="true">✔</span>
            Checklist
          </p>
          <h3 className="dashboard-card-title">
            {completedCount} de {items.length} tarefas concluídas
          </h3>
        </div>
        <span className="dashboard-progress-percent">{percent}%</span>
      </div>

      <div className="mt-3">
        <ProgressBar percent={percent} />
      </div>

      <div className="dashboard-card-content dashboard-checklist-preview mt-3">
        {items.length === 0 ? (
          <div className="dashboard-empty-state">
            Nenhuma tarefa criada ainda.
          </div>
        ) : allDone ? (
          <div className="dashboard-empty-state dashboard-empty-state-positive">
            Tudo pronto por aqui.
          </div>
        ) : (
          previewItems.map((item) => {
            const loading = actionLoading === `checklist-${item.id}`;

            return (
              <button
                key={item.id}
                type="button"
                className={`dashboard-preview-item dashboard-checklist-item ${item.isDone ? "is-done" : ""}`}
                disabled={loading}
                onClick={() => onToggle(item)}
              >
                <span className="dashboard-check" aria-hidden="true">
                  {item.isDone ? "✓" : ""}
                </span>
                <span className="min-w-0 flex-1 truncate">{item.title}</span>
                {item.category && (
                  <span className="dashboard-mini-chip">{item.category}</span>
                )}
              </button>
            );
          })
        )}
      </div>

      <div className="dashboard-card-footer">
        <ActionButton onClick={onOpen}>
          Ver checklist completo
        </ActionButton>
        <GhostButton onClick={onCreate}>
          Nova tarefa
        </GhostButton>
      </div>
    </OrganizationCard>
  );
}

function DashboardVotingCard({
  polls,
  openCount,
  closedCount,
  activeTab,
  actionLoading,
  onTabChange,
  onVote,
  onOpen,
  onCreate,
}: {
  polls: VotePoll[];
  openCount: number;
  closedCount: number;
  activeTab: DashboardVotingTab;
  actionLoading: string | null;
  onTabChange: (tab: DashboardVotingTab) => void;
  onVote: (poll: VotePoll, optionId: string) => void;
  onOpen: () => void;
  onCreate: () => void;
}) {
  const activePolls = polls.filter((poll) => !poll.isClosed);
  const decidedPolls = polls.filter((poll) => poll.isClosed);
  const visiblePolls = getDashboardPolls(polls, activeTab);

  return (
    <OrganizationCard className="dashboard-action-card dashboard-voting-card min-h-[276px]">
      <div className="dashboard-card-header">
        <div className="min-w-0">
          <p className="dashboard-card-kicker">
            <span aria-hidden="true">🗳</span>
            Votações
          </p>
          <h3 className="dashboard-card-title">
            {openCount} abertas
          </h3>
          <p className="dashboard-card-subtitle">
            {closedCount} decisão(ões) já definidas.
          </p>
        </div>
        <span className="dashboard-total-chip">{polls.length} total</span>
      </div>

      <div className="dashboard-tabs mt-3" role="tablist" aria-label="Filtro de votações">
        {[
          ["active", `Ativas ${activePolls.length}`],
          ["decided", `Decididas ${decidedPolls.length}`],
          ["all", "Todas"],
        ].map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={`dashboard-tab ${activeTab === tab ? "is-active" : ""}`}
            onClick={() => onTabChange(tab as DashboardVotingTab)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="dashboard-card-content dashboard-voting-list mt-3">
        {polls.length === 0 ? (
          <div className="dashboard-empty-state">
            Nenhuma votação criada ainda.
          </div>
        ) : visiblePolls.length === 0 ? (
          <div className="dashboard-empty-state">
            Nenhuma votação nesta aba.
          </div>
        ) : (
          visiblePolls.map((poll) => (
            <DashboardVotingPreviewItem
              key={poll.id}
              poll={poll}
              actionLoading={actionLoading}
              onVote={(optionId) => onVote(poll, optionId)}
              onOpen={onOpen}
            />
          ))
        )}
      </div>

      <div className="dashboard-card-footer">
        <ActionButton onClick={onOpen}>
          Ver votações
        </ActionButton>
        <GhostButton onClick={onCreate}>
          Criar votação
        </GhostButton>
      </div>
    </OrganizationCard>
  );
}

function DashboardVotingPreviewItem({
  poll,
  actionLoading,
  onVote,
  onOpen,
}: {
  poll: VotePoll;
  actionLoading: string | null;
  onVote: (optionId: string) => void;
  onOpen: () => void;
}) {
  const totalVotes = getPollTotalVotes(poll);
  const winner = getPollWinner(poll);
  const selectedOption = poll.options.find((option) => option.isSelectedByCurrentUser);
  const primaryOptions = [...poll.options]
    .sort((a, b) => b.voteCount - a.voteCount)
    .slice(0, poll.isClosed ? 2 : 3);

  return (
    <article className="dashboard-vote-preview">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[color:var(--text)]">{poll.title}</p>
          <p className="mt-1 text-xs text-[color:var(--text-muted)]">
            {poll.isClosed && winner
              ? `Resultado: ${winner.title}`
              : poll.isClosed
                ? "Votação encerrada sem votos."
              : selectedOption
                ? `Seu voto: ${selectedOption.title}`
                : "Escolha uma opção para participar."}
          </p>
        </div>
        <span className={`dashboard-status-chip ${poll.isClosed ? "is-decided" : "is-active"}`}>
          {poll.isClosed ? "Decidida" : "Ativa"}
        </span>
      </div>

      <div className="mt-2 space-y-1.5">
        {primaryOptions.map((option) => {
          const percent = getOptionPercent(option, totalVotes);
          const isLoading = actionLoading === `vote-${poll.id}-${option.id}`;

          return (
            <button
              key={option.id}
              type="button"
              className={`dashboard-vote-option ${option.isSelectedByCurrentUser ? "is-selected" : ""}`}
              disabled={poll.isClosed || isLoading || Boolean(actionLoading)}
              onClick={() => onVote(option.id)}
            >
              <span className="dashboard-vote-option-row">
                <span className="truncate">{option.title}</span>
                <span>{percent}%</span>
              </span>
              <span className="dashboard-vote-track" aria-hidden="true">
                <span style={{ width: `${percent}%` }} />
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 text-xs text-[color:var(--text-muted)]">
        <span>{totalVotes} voto(s)</span>
        {poll.isClosed ? (
          <button type="button" className="dashboard-inline-link" onClick={onOpen}>
            Ver detalhes
          </button>
        ) : selectedOption ? (
          <span className="font-semibold text-[color:var(--accent)]">Voto registrado</span>
        ) : null}
      </div>
    </article>
  );
}

function getDashboardPolls(polls: VotePoll[], tab: DashboardVotingTab) {
  const activePolls = polls.filter((poll) => !poll.isClosed);
  const decidedPolls = polls.filter((poll) => poll.isClosed);

  if (tab === "active") return activePolls;
  if (tab === "decided") return decidedPolls;

  return [...activePolls, ...decidedPolls];
}

function getPollTotalVotes(poll: VotePoll) {
  return poll.options.reduce((sum, option) => sum + option.voteCount, 0);
}

function getPollWinner(poll: VotePoll) {
  if (!poll.isClosed || poll.options.length === 0 || getPollTotalVotes(poll) <= 0) return null;

  return [...poll.options].sort((a, b) => b.voteCount - a.voteCount)[0] ?? null;
}

function getOptionPercent(option: VotePoll["options"][number], totalVotes: number) {
  if (typeof option.percentage === "number" && Number.isFinite(option.percentage)) {
    return clampPercentage(option.percentage);
  }

  if (totalVotes <= 0) return 0;

  return clampPercentage((option.voteCount / totalVotes) * 100);
}

function ActionButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={() => {
        window.dispatchEvent(new CustomEvent("tripsync:remember-scroll"));
      }}
      onClick={onClick}
      className="rounded-full bg-[color:var(--trip-button-bg)] px-5 py-2.5 text-sm font-semibold text-[color:var(--trip-button-text)] transition hover:bg-[color:var(--accent-hover)]"
    >
      {children}
    </button>
  );
}

function GhostButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={() => {
        window.dispatchEvent(new CustomEvent("tripsync:remember-scroll"));
      }}
      onClick={onClick}
      className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-soft)] px-5 py-2.5 text-sm font-semibold text-[color:var(--text)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
    >
      {children}
    </button>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-soft)] px-3.5 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">{label}</p>
      <p className="mt-1 truncate font-mono text-sm font-semibold text-[color:var(--text)]">{value}</p>
    </div>
  );
}

function DashboardStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-soft)] px-4 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--accent-soft)] text-sm">
          {icon}
        </span>
        <span className="truncate text-sm font-semibold text-[color:var(--text-muted)]">{label}</span>
      </div>
      <span className="font-mono text-sm font-semibold text-[color:var(--text)]">{value}</span>
    </div>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="trip-progress-track h-2 overflow-hidden rounded-full">
      <div
        className="h-full rounded-full bg-[color:var(--accent)] transition-all"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}

function getOrganizationPanelTitle(panel: Exclude<OrganizationPanel, null>) {
  const labels = {
    financeiro: "Planejamento financeiro",
    checklist: "Checklist",
    votacoes: "Votações",
    documentos: "Documentos",
  };

  return labels[panel];
}

function getDaysLeft(startDate: string) {
  const today = new Date();
  const start = new Date(startDate);
  const diff = start.getTime() - today.getTime();

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function calculateFinancialTotal(
  summary: FinancialSummary | null,
  budget: TravelBudget | null,
  trip: TripDetails
) {
  const budgetPartsTotal = budget
    ? budget.transportationAmount +
    budget.accommodationAmount +
    budget.foodAmount +
    budget.activitiesAmount +
    budget.emergencyReserveAmount
    : 0;

  return firstPositiveNumber(
    budget?.totalAmount,
    budgetPartsTotal,
    summary?.totalBudget,
    trip.estimatedTotalCost
  );
}

function calculateGroupSaved(summary: FinancialSummary | null, fallback: number) {
  return firstDefinedNumber(summary?.totalSaved, fallback);
}

function calculateFinancialProgress(totalBudget: number, totalSaved: number) {
  if (totalBudget <= 0) return 0;

  return Math.min(100, Math.round((totalSaved / totalBudget) * 100));
}

function calculateTripReadiness({
  trip,
  checklistItems,
  documentSummary,
  financialProgress,
  polls,
}: {
  trip: TripDetails;
  checklistItems: ChecklistItem[];
  documentSummary: DocumentSummary | null;
  financialProgress: number;
  polls: VotePoll[];
}) {
  const basicProgress =
    trip.origin && trip.destination && trip.startDate && trip.endDate ? 100 : 0;

  const checklistProgress =
    checklistItems.length > 0
      ? (checklistItems.filter((item) => item.isDone).length / checklistItems.length) * 100
      : 0;

  const documentProgress =
    documentSummary && documentSummary.totalDocuments > 0
      ? firstDefinedNumber(
        documentSummary.percentage,
        (documentSummary.completedDocuments / documentSummary.totalDocuments) * 100
      )
      : 0;

  const votingProgress =
    polls.length > 0
      ? (polls.filter((poll) => poll.isClosed).length / polls.length) * 100
      : 100;

  const totalPercentage = Math.round(
    clampPercentage(basicProgress) * 0.2 +
    clampPercentage(checklistProgress) * 0.25 +
    clampPercentage(documentProgress) * 0.25 +
    clampPercentage(financialProgress) * 0.2 +
    clampPercentage(votingProgress) * 0.1
  );

  return {
    totalPercentage: clampPercentage(totalPercentage),
    basicPercentage: clampPercentage(basicProgress),
    checklistPercentage: clampPercentage(checklistProgress),
    documentsPercentage: clampPercentage(documentProgress),
    financialPercentage: clampPercentage(financialProgress),
    votingPercentage: clampPercentage(votingProgress),
  };
}

function findParticipantProgress(
  participant: TripDetails["participants"][number],
  progressList: ParticipantProgress[]
) {
  const normalizedName = participant.name?.trim().toLowerCase();

  return progressList.find((progress) => {
    const progressName = progress.name?.trim().toLowerCase();

    return (
      progress.userId === participant.userId ||
      progress.participantId === participant.userId ||
      (!!normalizedName && progressName === normalizedName)
    );
  });
}

function clampPercentage(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function firstPositiveNumber(...values: Array<number | null | undefined>) {
  return values.find((value) => typeof value === "number" && value > 0) ?? 0;
}

function firstDefinedNumber(...values: Array<number | null | undefined>) {
  return values.find((value) => typeof value === "number") ?? 0;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getReadinessMessage(percent: number) {
  if (percent >= 90) return "Tripulação praticamente pronta para decolar.";
  if (percent >= 70) return "A viagem está bem encaminhada.";
  if (percent >= 40) return "A missão está em preparação.";

  return "O planejamento começou. Hora de chamar a tripulação.";
}
