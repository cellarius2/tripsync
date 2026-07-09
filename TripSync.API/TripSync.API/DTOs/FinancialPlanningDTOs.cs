namespace TripSync.API.DTOs;

public record TravelBudgetDto(
    Guid? Id,
    Guid TripId,
    decimal TransportationAmount,
    decimal AccommodationAmount,
    decimal FoodAmount,
    decimal ActivitiesAmount,
    decimal EmergencyReserveAmount,
    decimal TotalAmount,
    DateTime? CreatedAt,
    DateTime? UpdatedAt
);

public record UpdateTravelBudgetRequest(
    decimal TransportationAmount,
    decimal AccommodationAmount,
    decimal FoodAmount,
    decimal ActivitiesAmount,
    decimal EmergencyReserveAmount
);

public record UpdateParticipantSavingRequest(decimal AmountSaved);

public record FinancialSummaryDto(
    decimal TotalBudget,
    decimal TotalSaved,
    decimal RemainingAmount,
    decimal ValuePerPerson,
    decimal OverallProgress,
    decimal MySavedAmount,
    decimal MyProgress,
    int ActiveParticipantsCount
);

public record ParticipantSavingProgressDto(
    Guid ParticipantId,
    Guid UserId,
    string Name,
    string? AvatarColor,
    decimal AmountSaved,
    decimal TargetAmount,
    decimal RemainingAmount,
    decimal Progress,
    DateTime? UpdatedAt
);