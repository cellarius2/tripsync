import api from "./api";

export interface TravelBudget {
  transportationAmount: number;
  accommodationAmount: number;
  foodAmount: number;
  activitiesAmount: number;
  emergencyReserveAmount: number;
  totalAmount: number;
}

export interface FinancialSummary {
  totalBudget: number;
  totalSaved: number;
  remainingAmount: number;
  valuePerPerson: number;
  overallProgress: number;
  mySavedAmount: number;
  myProgress: number;
}

export interface ParticipantProgress {
  participantId: string;
  userId?: string | null;
  name: string;
  avatarColor?: string | null;
  amountSaved: number;
  targetAmount: number;
  remainingAmount: number;
  progress: number;
}

export interface UpdateBudgetRequest {
  transportationAmount: number;
  accommodationAmount: number;
  foodAmount: number;
  activitiesAmount: number;
  emergencyReserveAmount: number;
}

export interface UpdateSavingRequest {
  amountSaved: number;
}

export const financialPlanningService = {
  async getBudget(tripId: string): Promise<TravelBudget> {
    const res = await api.get<TravelBudget>(`/trips/${tripId}/financial/budget`);
    return res.data;
  },

  async updateBudget(tripId: string, data: UpdateBudgetRequest): Promise<TravelBudget> {
    const res = await api.put<TravelBudget>(`/trips/${tripId}/financial/budget`, data);
    return res.data;
  },

  async getSummary(tripId: string): Promise<FinancialSummary> {
    const res = await api.get<FinancialSummary>(`/trips/${tripId}/financial/summary`);
    return res.data;
  },

  async updateSaving(tripId: string, data: UpdateSavingRequest): Promise<FinancialSummary> {
    const res = await api.put<FinancialSummary>(`/trips/${tripId}/financial/savings`, data);
    return res.data;
  },

  async getProgress(tripId: string): Promise<ParticipantProgress[]> {
    const res = await api.get<ParticipantProgress[]>(`/trips/${tripId}/financial/progress`);
    return res.data;
  },
};
