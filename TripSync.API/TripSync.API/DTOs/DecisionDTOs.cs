using TripSync.API.Enums;

namespace TripSync.API.DTOs;

public record TripDecisionDto(
    Guid Id,
    VoteCategory Category,
    string CategoryLabel,
    string SelectedOptionTitle,
    Guid? SourcePollId,
    DateTime UpdatedAt
);

public record DecisionSummaryDto(
    int TotalExpected,
    int TotalDefined,
    int Percentage,
    List<TripDecisionDto> Decisions
);