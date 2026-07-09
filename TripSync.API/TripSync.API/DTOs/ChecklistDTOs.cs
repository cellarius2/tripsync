namespace TripSync.API.DTOs;

public record CreateChecklistItemRequest(string Title, string? Category, Guid? AssignedToParticipantId);

public record UpdateChecklistItemRequest(string Title, string? Category, Guid? AssignedToParticipantId);

public record ChecklistItemDto(
    Guid Id,
    string Title,
    string? Category,
    bool IsDone,
    Guid? AssignedToParticipantId,
    string? AssignedToName,
    DateTime CreatedAt,
    DateTime? CompletedAt
);