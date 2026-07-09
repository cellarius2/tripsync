import api from "./api";
import type {
  CreateTripRequest,
  JoinTripRequest,
  TripDashboard,
  TripDetails,
  TripListItem,
  TripParticipant,
} from "../types";
import type { AvatarKey } from "../data/avatarOptions";

export async function updateMyTripAvatar(tripId: string, avatarKey: AvatarKey): Promise<TripParticipant> {
  const res = await api.patch<TripParticipant>(`/trips/${tripId}/participants/me/avatar`, { avatarKey });
  return res.data;
}

export const tripService = {
  async getMyTrips(): Promise<TripListItem[]> {
    const res = await api.get<TripListItem[]>("/trips");
    return res.data;
  },

  async createTrip(data: CreateTripRequest): Promise<TripDashboard> {
    const res = await api.post<TripDashboard>("/trips", data);
    return res.data;
  },

  async joinTrip(data: JoinTripRequest): Promise<{ tripId: string }> {
    const res = await api.post<{ tripId: string }>("/trips/join", data);
    return res.data;
  },

  async getTripById(tripId: string): Promise<TripDetails> {
    const res = await api.get<TripDetails>(`/trips/${tripId}`);
    return res.data;
  },

  async getDashboard(tripId: string): Promise<TripDashboard> {
    const res = await api.get<TripDashboard>(`/trips/${tripId}/dashboard`);
    return res.data;
  },

  async updateMyAvatar(tripId: string, avatarKey: AvatarKey): Promise<void> {
    await updateMyTripAvatar(tripId, avatarKey);
  },
};
