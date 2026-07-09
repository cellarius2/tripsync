import { useEffect, useState } from "react";
import { expenseService } from "../../services/expenseService";
import type { Debt, Expense, TripParticipant } from "../../types";

interface ExpensesTabProps {
  tripId: string;
  participants: TripParticipant[];
  onChanged?: () => void;
}

export default function ExpensesTab({ tripId, participants, onChanged }: ExpensesTabProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, [tripId]);

  async function loadExpenses() {
    try {
      setLoading(true);
      const [expensesData, debtsData] = await Promise.all([
        expenseService.list(tripId),
        expenseService.getDebts(tripId),
      ]);

      setExpenses(expensesData);
      setDebts(debtsData);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsPaid(expenseId: string) {
    await expenseService.markAsPaid(tripId, expenseId);
    await loadExpenses();
    onChanged?.();
  }

  async function handleDelete(expenseId: string) {
    if (!confirm("Remover esta despesa?")) return;

    await expenseService.remove(tripId, expenseId);
    await loadExpenses();
    onChanged?.();
  }

  const predicted = expenses.filter((expense) => expense.status === 0);
  const paid = expenses.filter((expense) => expense.status === 1);
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (loading) {
    return <p className="py-10 text-center text-sm text-navy-700">Carregando despesas...</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl bg-burgundy-50 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-burgundy-600">Resumo das despesas</p>
          <h3 className="mt-1 font-display text-3xl font-semibold text-navy-950">
            {formatCurrency(total)}
          </h3>
          <p className="mt-1 text-sm text-navy-700">
            {expenses.length} despesa(s) cadastrada(s)
          </p>
        </div>

        <button
          type="button"
          disabled
          className="rounded-full bg-burgundy-600 px-5 py-3 text-sm font-semibold text-white opacity-70"
        >
          + Nova despesa em breve
        </button>
      </div>

      {debts.length > 0 && (
        <section className="rounded-3xl border border-gray-200 bg-white p-5">
          <h3 className="mb-4 font-display text-2xl font-semibold text-navy-950">
            Quem deve para quem
          </h3>

          <div className="space-y-3">
            {debts.map((debt, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-2xl bg-gray-50 p-4 text-sm"
              >
                <span className="font-semibold text-navy-950">{debt.fromName}</span>
                <span className="text-burgundy-600">→</span>
                <span className="font-semibold text-navy-950">{debt.toName}</span>
                <span className="ml-auto font-mono font-semibold text-burgundy-600">
                  {formatCurrency(debt.amount)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <ExpenseSection
        title={`Despesas previstas (${predicted.length})`}
        empty="Nenhuma despesa prevista ainda."
        expenses={predicted}
        onMarkAsPaid={handleMarkAsPaid}
        onDelete={handleDelete}
      />

      <ExpenseSection
        title={`Despesas pagas (${paid.length})`}
        empty="Nenhuma despesa paga ainda."
        expenses={paid}
        onDelete={handleDelete}
      />

      {participants.length === 0 && (
        <p className="text-sm text-navy-700">
          Convide participantes para começar a dividir despesas.
        </p>
      )}
    </div>
  );
}

function ExpenseSection({
  title,
  empty,
  expenses,
  onMarkAsPaid,
  onDelete,
}: {
  title: string;
  empty: string;
  expenses: Expense[];
  onMarkAsPaid?: (expenseId: string) => void;
  onDelete: (expenseId: string) => void;
}) {
  return (
    <section>
      <h3 className="mb-3 font-display text-2xl font-semibold text-navy-950">{title}</h3>

      {expenses.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-navy-700">
          {empty}
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              onMarkAsPaid={onMarkAsPaid}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ExpenseRow({
  expense,
  onMarkAsPaid,
  onDelete,
}: {
  expense: Expense;
  onMarkAsPaid?: (expenseId: string) => void;
  onDelete: (expenseId: string) => void;
}) {
  return (
    <article className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-navy-950">{expense.description}</p>
          <p className="mt-1 text-sm text-navy-700">
            {expense.category} · pago por {expense.paidByName}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-semibold text-navy-950">
            {formatCurrency(expense.amount)}
          </span>

          {expense.status === 0 && onMarkAsPaid && (
            <button
              type="button"
              onClick={() => onMarkAsPaid(expense.id)}
              className="rounded-full bg-burgundy-50 px-4 py-2 text-xs font-semibold text-burgundy-600"
            >
              Marcar paga
            </button>
          )}

          <button
            type="button"
            onClick={() => onDelete(expense.id)}
            className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-navy-700"
          >
            Remover
          </button>
        </div>
      </div>
    </article>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
