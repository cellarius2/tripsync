using TripSync.API.DTOs;
using TripSync.API.Enums;

namespace TripSync.API.Services.Interfaces;

public interface ITripDecisionService
{
    Task<DecisionSummaryDto> GetSummaryAsync(Guid tripId, Guid userId);

    Task<TripDecisionDto> UpsertDecisionAsync(
        Guid tripId,
        VoteCategory category,
        string selectedOptionTitle,
        Guid? sourcePollId
    );
}