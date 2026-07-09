namespace TripSync.API.DTOs.Trips;

public record TripParticipantDto(
    Guid UserId,
    string Name,
    string? AvatarColor,
    string? AvatarKey,
    bool IsOwner,
    decimal AmountSaved
);
