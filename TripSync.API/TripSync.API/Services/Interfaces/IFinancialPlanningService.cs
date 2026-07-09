using TripSync.API.DTOs;

namespace TripSync.API.Services.Interfaces;

public interface IFinancialPlanningService
{
    Task<TravelBudgetDto> GetBudgetAsync(Guid tripId, Guid userId);
    Task<TravelBudgetDto> UpdateBudgetAsync(Guid tripId, Guid userId, UpdateTravelBudgetRequest request);
    Task<FinancialSummaryDto> GetSummaryAsync(Guid tripId, Guid userId);
    Task<ParticipantSavingProgressDto> UpdateParticipantSavingAsync(Guid tripId, Guid userId, UpdateParticipantSavingRequest request);
    Task<List<ParticipantSavingProgressDto>> GetParticipantsProgressAsync(Guid tripId, Guid userId);
}
