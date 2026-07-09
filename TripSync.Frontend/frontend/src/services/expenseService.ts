import api from "./api";
import type { Debt, Expense } from "../types";

export interface CreateExpenseRequest {
  description: string;
  category: string;
  amount: number;
  paidByParticipantId: string;
  splitEqually: boolean;
}

export const expenseService = {
  async list(tripId: string): Promise<Expense[]> {
    const res = await api.get<Expense[]>(`/trips/${tripId}/expenses`);
    return res.data;
  },

  async create(tripId: string, data: CreateExpenseRequest): Promise<Expense> {
    const res = await api.post<Expense>(`/trips/${tripId}/expenses`, data);
    return res.data;
  },

  async update(
    tripId: string,
    expenseId: string,
    data: CreateExpenseRequest
  ): Promise<Expense> {
    const res = await api.put<Expense>(`/trips/${tripId}/expenses/${expenseId}`, data);
    return res.data;
  },

  async getDebts(tripId: string): Promise<Debt[]> {
    const res = await api.get<Debt[]>(`/trips/${tripId}/expenses/debts`);
    return res.data;
  },

  async markAsPaid(tripId: string, expenseId: string): Promise<Expense> {
    const res = await api.patch<Expense>(`/trips/${tripId}/expenses/${expenseId}/pay`);
    return res.data;
  },

  async remove(tripId: string, expenseId: string): Promise<void> {
    await api.delete(`/trips/${tripId}/expenses/${expenseId}`);
  },
};