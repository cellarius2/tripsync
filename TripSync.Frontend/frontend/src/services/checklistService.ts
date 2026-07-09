import api from "./api";
import type {
  ChecklistItem,
  CreateChecklistItemRequest,
  UpdateChecklistItemRequest,
} from "../types";

export const checklistService = {
  async list(tripId: string) {
    const res = await api.get<ChecklistItem[]>(`/trips/${tripId}/checklist`);
    return res.data;
  },

  async create(tripId: string, data: CreateChecklistItemRequest) {
    const res = await api.post<ChecklistItem>(
      `/trips/${tripId}/checklist`,
      data
    );
    return res.data;
  },

  async toggle(tripId: string, itemId: string) {
    const res = await api.patch<ChecklistItem>(
      `/trips/${tripId}/checklist/${itemId}/toggle`
    );
    return res.data;
  },

  async update(
    tripId: string,
    itemId: string,
    data: UpdateChecklistItemRequest
  ) {
    const res = await api.put<ChecklistItem>(
      `/trips/${tripId}/checklist/${itemId}`,
      data
    );
    return res.data;
  },

  async remove(tripId: string, itemId: string) {
    await api.delete(`/trips/${tripId}/checklist/${itemId}`);
  },
};