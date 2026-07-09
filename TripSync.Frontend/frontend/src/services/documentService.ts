import api from "./api";
import type {
    CreateTripDocumentRequest,
    DocumentSummary,
    ParticipantDocuments,
    TripDocument,
} from "../types";

export const documentService = {
    async list(tripId: string): Promise<ParticipantDocuments[]> {
        const res = await api.get<ParticipantDocuments[]>(`/trips/${tripId}/documents`);
        return res.data;
    },

    async getSummary(tripId: string): Promise<DocumentSummary> {
        const res = await api.get<DocumentSummary>(`/trips/${tripId}/documents/summary`);
        return res.data;
    },

    async toggle(tripId: string, documentId: string): Promise<TripDocument> {
        const res = await api.patch<TripDocument>(`/trips/${tripId}/documents/${documentId}/toggle`);
        return res.data;
    },

    async create(tripId: string, payload: CreateTripDocumentRequest): Promise<ParticipantDocuments[]> {
        const res = await api.post<ParticipantDocuments[]>(`/trips/${tripId}/documents`, payload);
        return res.data;
    },

    async remove(tripId: string, documentId: string): Promise<void> {
        await api.delete(`/trips/${tripId}/documents/${documentId}`);
    },
};
