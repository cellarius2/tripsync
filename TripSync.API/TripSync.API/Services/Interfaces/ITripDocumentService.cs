using TripSync.API.DTOs;

namespace TripSync.API.Services.Interfaces;

public interface ITripDocumentService
{
    Task<List<ParticipantDocumentsDto>> GetDocumentsAsync(Guid tripId, Guid userId);

    Task<DocumentSummaryDto> GetSummaryAsync(Guid tripId, Guid userId);

    Task<List<ParticipantDocumentsDto>> CreateCustomDocumentAsync(
        Guid tripId,
        Guid userId,
        CreateTripDocumentRequest request);

    Task<TripDocumentDto> ToggleStatusAsync(Guid tripId, Guid documentId, Guid userId);

    Task DeleteDocumentAsync(Guid tripId, Guid documentId, Guid userId);
}
