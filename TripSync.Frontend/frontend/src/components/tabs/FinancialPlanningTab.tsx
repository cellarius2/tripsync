import { useEffect, useMemo, useState } from "react";
import {
  financialPlanningService,
  type FinancialSummary,
  type ParticipantProgress,
  type TravelBudget,
  type UpdateBudgetRequest,
} from "../../services/financialPlanningService";

interface FinancialPlanningTabProps {
  tripId: string;
  onChanged?: () => void | Promise<void>;
  onNotify?: (message: string) => void;
}

const emptyBudget: TravelBudget = {
  transportationAmount: 0,
  accommodationAmount: 0,
  foodAmount: 0,
  activitiesAmount: 0,
  emergencyReserveAmount: 0,
  totalAmount: 0,
};

export default function FinancialPlanningTab({ tripId, onChanged, onNotify }: FinancialPlanningTabProps) {
  const [budget, setBudget] = useState<TravelBudget>(emptyBudget);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [participants, setParticipants] = useState<ParticipantProgress[]>([]);
  const [estimatedTripValue, setEstimatedTripValue] = useState("");
  const [emergencyReserve, setEmergencyReserve] = useState("");
  const [mySaved, setMySaved] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingBudget, setSavingBudget] = useState(false);
  const [savingMyValue, setSavingMyValue] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAll();
  }, [tripId]);

  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      const [budgetData, summaryData, progressData] = await Promise.all([
        financialPlanningService.getBudget(tripId),
        financialPlanningService.getSummary(tripId),
        financialPlanningService.getProgress(tripId),
      ]);

      const nextBudget = budgetData ?? emptyBudget;
      setBudget(nextBudget);
      setSummary(summaryData);
      setParticipants(progressData ?? []);
      setMySaved(toInputValue(summaryData?.mySavedAmount));
      setEstimatedTripValue(toInputValue(nextBudget.transportationAmount));
      setEmergencyReserve(toInputValue(nextBudget.emergencyReserveAmount));
    } catch {
      setError("Não foi possível carregar o planejamento financeiro.");
    } finally {
      setLoading(false);
    }
  }

  const estimatedTripAmount = useMemo(
    () => parseMoneyInput(estimatedTripValue),
    [estimatedTripValue]
  );
  const emergencyReserveAmount = useMemo(
    () => parseMoneyInput(emergencyReserve),
    [emergencyReserve]
  );
  const personalSavedInputAmount = useMemo(
    () => parseMoneyInput(mySaved),
    [mySaved]
  );

  const calculatedTotal = useMemo(() => {
    return estimatedTripAmount + emergencyReserveAmount;
  }, [estimatedTripAmount, emergencyReserveAmount]);

  const totalBudget = firstPositive(calculatedTotal, budget.totalAmount, summary?.totalBudget) ?? 0;
  const participantCount = Math.max(1, participants.length);
  const goalPerParticipant =
    (summary as (FinancialSummary & { goalPerParticipant?: number; GoalPerParticipant?: number }) | null)
      ?.goalPerParticipant ??
    (summary as (FinancialSummary & { goalPerParticipant?: number; GoalPerParticipant?: number }) | null)
      ?.GoalPerParticipant;
  const valuePerPerson =
    firstPositive(goalPerParticipant, summary?.valuePerPerson) ?? totalBudget / participantCount;

  const mySavedAmount = firstDefinedNumber(summary?.mySavedAmount, personalSavedInputAmount);
  const myProgress = valuePerPerson > 0 ? Math.min(100, (mySavedAmount / valuePerPerson) * 100) : 0;
  const myRemaining = Math.max(0, valuePerPerson - mySavedAmount);
  const exceeded = Math.max(0, mySavedAmount - valuePerPerson);

  async function handleSaveBudget() {
    try {
      setSavingBudget(true);
      setError("");

      const payload: UpdateBudgetRequest = {
        transportationAmount: estimatedTripAmount,
        accommodationAmount: 0,
        foodAmount: 0,
        activitiesAmount: 0,
        emergencyReserveAmount: emergencyReserveAmount,
      };

      const updatedBudget = await financialPlanningService.updateBudget(tripId, payload);
      const nextBudget = updatedBudget ?? {
        ...emptyBudget,
        ...payload,
        totalAmount: calculatedTotal,
      };

      setBudget(nextBudget);
      setEstimatedTripValue(toInputValue(nextBudget.transportationAmount));
      setEmergencyReserve(toInputValue(nextBudget.emergencyReserveAmount));
      await loadAll();
      await onChanged?.();
      onNotify?.("Orçamento atualizado com sucesso.");
    } catch {
      setError("Não foi possível salvar o orçamento da viagem.");
    } finally {
      setSavingBudget(false);
    }
  }

  async function handleSaveMyValue() {
    try {
      setSavingMyValue(true);
      setError("");

      const updatedSummary = await financialPlanningService.updateSaving(tripId, {
        amountSaved: personalSavedInputAmount,
      });

      setSummary(updatedSummary);
      setMySaved(toInputValue(updatedSummary?.mySavedAmount ?? personalSavedInputAmount));
      await loadAll();
      await onChanged?.();
      onNotify?.("Seu progresso foi atualizado.");
    } catch {
      setError("Não foi possível atualizar seu valor guardado.");
    } finally {
      setSavingMyValue(false);
    }
  }

  if (loading) {
    return (
      <p className="py-10 text-center text-sm text-navy-700 dark:text-[#A7B0BE]">
        Carregando planejamento financeiro...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-2xl bg-burgundy-50 px-4 py-3 text-sm font-semibold text-burgundy-600 dark:bg-burgundy-600/15">
          {error}
        </p>
      )}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="rounded-[2rem] border border-gray-200 bg-gray-50 p-5 dark:border-[#2B313D] dark:bg-[#20242D]">
          <h3 className="font-display text-2xl font-semibold text-navy-950 dark:text-white">
            Minha contribuição
          </h3>

          <p className="mt-2 text-sm text-navy-700 dark:text-[#A7B0BE]">
            Veja apenas o seu progresso nesta viagem.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <ContributionMetric label="Meta pessoal" value={formatCurrency(valuePerPerson)} />
            <ContributionMetric label="Já reservado" value={formatCurrency(mySavedAmount)} />
            <ContributionMetric
              label="Ainda faltam"
              value={formatCurrency(myRemaining)}
              positive={myRemaining <= 0}
            />
          </div>

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-sm text-navy-700 dark:text-[#A7B0BE]">
              <span>Progresso pessoal</span>
              <span>{myProgress.toFixed(0)}%</span>
            </div>

            <ProgressBar percent={myProgress} />
          </div>

          {exceeded > 0 && (
            <p className="mt-3 text-sm font-semibold text-emerald-500">
              Você ultrapassou sua meta em {formatCurrency(exceeded)} 🎉
            </p>
          )}

          <div className="mt-5">
            <label className="mb-1.5 block text-xs font-semibold text-navy-700 dark:text-[#A7B0BE]">
              Quanto você possui reservado para esta viagem?
            </label>

            <div className="flex flex-col gap-3 md:flex-row">
              <input
                type="text"
                inputMode="decimal"
                value={mySaved}
                onChange={(event) => setMySaved(event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-navy-950 outline-none focus:border-burgundy-300 dark:border-[#2B313D] dark:bg-[#181B22] dark:text-white"
              />

              <button
                type="button"
                onClick={handleSaveMyValue}
                disabled={savingMyValue}
                className="rounded-full bg-burgundy-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-burgundy-700 disabled:opacity-60"
              >
                {savingMyValue ? "Salvando..." : "Atualizar"}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-200 bg-gray-50 p-5 dark:border-[#2B313D] dark:bg-[#20242D]">
          <h3 className="font-display text-2xl font-semibold text-navy-950 dark:text-white">
            Orçamento da viagem
          </h3>

          <p className="mt-2 text-sm text-navy-700 dark:text-[#A7B0BE]">
            Informe quanto o grupo estima gastar na viagem. A reserva para imprevistos é opcional.
          </p>

          <BudgetInput
            label="Orçamento estimado da viagem"
            value={estimatedTripValue}
            onChange={setEstimatedTripValue}
          />

          <BudgetInput
            label="Reserva para imprevistos (opcional)"
            value={emergencyReserve}
            onChange={setEmergencyReserve}
          />

          <div className="mt-4 rounded-2xl bg-white p-4 dark:bg-[#181B22]">
            <p className="text-xs font-bold uppercase text-navy-700 dark:text-[#A7B0BE]">
              Total estimado
            </p>

            <p className="mt-1 font-display text-2xl font-semibold text-navy-950 dark:text-white">
              {formatCurrency(calculatedTotal)}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveBudget}
            disabled={savingBudget}
            className="mt-4 w-full rounded-full bg-burgundy-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-burgundy-700 disabled:opacity-60"
          >
            {savingBudget ? "Salvando..." : "Salvar orçamento"}
          </button>
        </div>
      </section>

      <section className="rounded-[2rem] border border-gray-200 bg-gray-50 p-5 dark:border-[#2B313D] dark:bg-[#20242D]">
        <h3 className="font-display text-2xl font-semibold text-navy-950 dark:text-white">
          Contribuição dos participantes
        </h3>

        <p className="mt-2 text-sm text-navy-700 dark:text-[#A7B0BE]">
          Acompanhe como cada participante está evoluindo em relação à própria meta.
        </p>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {participants.map((participant) => {
            const saved = participant.amountSaved ?? 0;
            const target =
              participant.targetAmount && participant.targetAmount > 0
                ? participant.targetAmount
                : valuePerPerson;

            const progress = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
            const missing = Math.max(0, target - saved);

            return (
              <article
                key={participant.participantId}
                className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-[#2B313D] dark:bg-[#181B22]"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold text-white"
                      style={{ backgroundColor: participant.avatarColor ?? "#7A102A" }}
                    >
                      {(participant.name ?? "?").charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="font-semibold text-navy-950 dark:text-white">
                        {participant.name ?? "Participante"}
                      </p>

                      <p className="text-xs text-navy-700 dark:text-[#A7B0BE]">
                        Economizou
                      </p>

                      <p className="text-sm font-semibold text-navy-950 dark:text-white">
                        {formatCurrency(saved)} / {formatCurrency(target)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <ProgressBar percent={progress} />
                  </div>

                  <span className="w-11 text-right font-mono text-xs font-semibold text-navy-700 dark:text-[#A7B0BE]">
                    {progress.toFixed(0)}%
                  </span>
                </div>

                <p className="mt-3 text-xs text-navy-700 dark:text-[#A7B0BE]">
                  {missing <= 0 ? "🎉 Meta concluída" : `Faltam ${formatCurrency(missing)}`}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function BudgetInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mt-4 block">
      <span className="mb-1.5 block text-xs font-semibold text-navy-700 dark:text-[#A7B0BE]">
        {label}
      </span>

      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-navy-950 outline-none focus:border-burgundy-300 dark:border-[#2B313D] dark:bg-[#181B22] dark:text-white"
      />
    </label>
  );
}

function ContributionMetric({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 dark:bg-[#181B22]">
      <p className="text-sm font-medium text-navy-700 dark:text-[#A7B0BE]">
        {label}
      </p>

      <p className={`mt-1 font-display text-2xl font-semibold ${positive ? "text-emerald-500" : "text-navy-950 dark:text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  const safePercent = Math.min(100, Math.max(0, percent ?? 0));

  return (
    <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-[#2B313D]">
      <div
        className="h-full rounded-full bg-burgundy-600 transition-all duration-500"
        style={{ width: `${safePercent}%` }}
      />
    </div>
  );
}

function parseMoneyInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 0;

  const normalized = trimmed.includes(",")
    ? trimmed.replace(/\./g, "").replace(",", ".")
    : trimmed;

  const parsed = Number(normalized.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function toInputValue(value?: number | null) {
  if (value === null || value === undefined || value === 0) return "";
  return String(value);
}

function firstDefinedNumber(...values: Array<number | null | undefined>) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }

  return 0;
}

function firstPositive(...values: Array<number | null | undefined>) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  }

  return undefined;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}
