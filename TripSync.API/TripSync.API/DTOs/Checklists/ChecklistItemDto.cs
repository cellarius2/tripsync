namespace TripSync.API.DTOs.Checklists;

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
