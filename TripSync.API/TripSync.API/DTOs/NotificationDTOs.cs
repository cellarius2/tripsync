namespace TripSync.API.DTOs;

public record NotificationDto(
    string Type,
    string Message,
    Guid TripId,
    DateTime CreatedAt,
    Guid? Id = null,
    Guid? RecipientUserId = null,
    Guid? SenderUserId = null,
    bool IsRead = false,
    string? TripName = null,
    string? ActorName = null,
    Guid? TargetUserId = null,
    string? TargetUserName = null
);

public record TripActivityDto(
    Guid Id,
    Guid TripId,
    string? TripName,
    string Type,
    Guid? ActorUserId,
    string? ActorName,
    Guid? TargetUserId,
    string? TargetUserName,
    string Message,
    DateTime CreatedAt
);

public record ThrowTomatoRequest(Guid RecipientUserId);
