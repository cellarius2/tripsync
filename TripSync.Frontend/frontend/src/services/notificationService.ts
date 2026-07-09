import api from "./api";
import type { Notification, TripActivity } from "../types";

export const notificationService = {
  async list(tripId?: string): Promise<Notification[]> {
    const res = await api.get<Notification[]>("/notifications", {
      params: tripId ? { tripId } : undefined,
    });

    return res.data;
  },

  async listTripActivity(tripId: string): Promise<TripActivity[]> {
    const res = await api.get<TripActivity[]>(`/trips/${tripId}/activity`);
    return res.data;
  },

  async markAllAsRead(tripId?: string): Promise<void> {
    await api.patch("/notifications/read-all", null, {
      params: tripId ? { tripId } : undefined,
    });
  },

  async throwTomato(
    tripId: string,
    recipientUserId: string,
  ): Promise<Notification> {
    const res = await api.post<Notification>(`/trips/${tripId}/tomatoes`, {
      recipientUserId,
    });

    return res.data;
  },
};