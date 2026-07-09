using TripSync.API.Enums;

namespace TripSync.API.DTOs.Trips;

public record TripSummaryDto(
    Guid Id,
    string Name,
    string Destination,
    DateOnly StartDate,
    DateOnly EndDate,
    TripType Type,
    TripStatus Status,
    string InviteCode,
    int ParticipantsCount,
    decimal TotalSaved,
    decimal EstimatedTotalCost
);