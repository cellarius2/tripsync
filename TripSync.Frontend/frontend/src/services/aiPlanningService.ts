import api from "./api";
import type { TripType } from "../types";

export interface AiPlanningRequest {
  tripId: string;
  destination: string;
  origin: string;
  startDate: string;
  endDate: string;
  tripType: TripType;
  participantsCount: number;
  estimatedBudget?: number;
  userPrompt?: string;
}

export interface AiPlanningResponse {
  summary: string;
  suggestedBudget?: number | null;
  emergencyReserveSuggestion?: number | null;
  checklistSuggestions: string[];
  voteSuggestions: string[];
  itinerarySuggestions: string[];
  warnings: string[];
}

export const aiPlanningService = {
  async getPlanningSuggestions(
    tripId: string,
    data: AiPlanningRequest
  ): Promise<AiPlanningResponse> {
    const res = await api.post<AiPlanningResponse>(
      `/trips/${tripId}/ai/planning-suggestions`,
      data
    );
    return res.data;
  },
};
