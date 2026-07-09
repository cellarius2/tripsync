import api from "./api";

export interface TripDecision {
  id: string;
  category: number;
  categoryLabel: string;
  selectedOptionTitle: string;
  sourcePollId?: string | null;
  updatedAt: string;
}

export interface DecisionSummary {
  totalExpected: number;
  totalDefined: number;
  percentage: number;
  decisions: TripDecision[];
}

export const decisionService = {
  async getSummary(tripId: string): Promise<DecisionSummary> {
    const res = await api.get<DecisionSummary>(`/trips/${tripId}/decisions`);
    return res.data;
  },
};