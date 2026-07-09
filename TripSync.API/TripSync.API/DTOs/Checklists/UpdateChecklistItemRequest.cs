namespace TripSync.API.DTOs.Checklists;

public record UpdateChecklistItemRequest(
    string Title,
    string? Category,
    Guid? AssignedToParticipantId
);
