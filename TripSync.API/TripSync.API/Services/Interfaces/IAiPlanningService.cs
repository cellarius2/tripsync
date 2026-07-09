using TripSync.API.DTOs;

namespace TripSync.API.Services.Interfaces;

public interface IAiPlanningService
{
    Task<AiPlanningResponse> GeneratePlanningSuggestionsAsync(
        Guid tripId,
        Guid userId,
        AiPlanningRequest request);
}
