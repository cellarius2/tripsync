using TripSync.API.Models;

namespace TripSync.API.DTOs;

public record TripDocumentDto(
    Guid Id,
    string Name,
    string? Description,
    string? Category,
    bool IsRequired,
    bool IsDefault,
    DocumentStatus Status,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record ParticipantDocumentsDto(
    Guid ParticipantId,
    string ParticipantName,
    string? AvatarColor,
    int Progress,
    List<TripDocumentDto> Documents
);

public record DocumentSummaryDto(
    int TotalDocuments,
    int CompletedDocuments,
    int Percentage
);

public record CreateTripDocumentRequest(
    string Name,
    string? Description,
    string? Category,
    bool IsRequired
);
