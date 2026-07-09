namespace TripSync.API.DTOs.Checklists;

public record CreateChecklistItemRequest(
    string Title,
    string? Category,
    Guid? AssignedToParticipantId
);
