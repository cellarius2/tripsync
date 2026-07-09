using TripSync.API.Enums;

namespace TripSync.API.DTOs;

public record AiPlanningRequest(
    Guid TripId,
    string Destination,
    string Origin,
    DateOnly StartDate,
    DateOnly EndDate,
    TripType TripType,
    int ParticipantsCount,
    decimal? EstimatedBudget,
    string? UserPrompt
);

public record AiSuggestionDto(
    string Title,
    string Description
);

public record AiPlanningResponse(
    string Summary,
    decimal? SuggestedBudget,
    decimal? EmergencyReserveSuggestion,
    List<string> ChecklistSuggestions,
    List<string> VoteSuggestions,
    List<string> ItinerarySuggestions,
    List<string> Warnings
);
