using TripSync.API.Enums;

namespace TripSync.API.DTOs.Trips;

public record TripDetailsDto(
    Guid Id,
    string Name,
    string Origin,
    string Destination,
    DateOnly StartDate,
    DateOnly EndDate,
    TripType Type,
    TripStatus Status,
    string InviteCode,
    List<TripParticipantDto> Participants,
    decimal EstimatedTotalCost
);