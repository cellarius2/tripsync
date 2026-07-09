using TripSync.API.Enums;

namespace TripSync.API.DTOs.Trips;

public record CreateTripRequest(
    string Name,
    string Origin,
    string Destination,
    DateOnly StartDate,
    DateOnly EndDate,
    TripType Type
);