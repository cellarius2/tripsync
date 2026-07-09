import api from "./api";
import type { CastVoteRequest, CreateVotePollRequest, VotePoll } from "../types";

export const voteService = {
  async list(tripId: string): Promise<VotePoll[]> {
    const res = await api.get<VotePoll[]>(`/trips/${tripId}/polls`);
    return res.data;
  },

  async create(tripId: string, data: CreateVotePollRequest): Promise<VotePoll> {
    const res = await api.post<VotePoll>(`/trips/${tripId}/polls`, data);
    return res.data;
  },

  async cast(pollId: string, data: CastVoteRequest): Promise<VotePoll> {
    const res = await api.post<VotePoll>(`/polls/${pollId}/vote`, {
      optionId: data.optionId,
    });

    return res.data;
  },

  async close(pollId: string): Promise<VotePoll> {
    const res = await api.post<VotePoll>(`/polls/${pollId}/close`, {});
    return res.data;
  },

  async removePoll(pollId: string): Promise<void> {
    await api.delete(`/polls/${pollId}`);
  },
};