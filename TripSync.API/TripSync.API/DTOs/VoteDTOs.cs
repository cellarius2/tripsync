using TripSync.API.Enums;

namespace TripSync.API.DTOs;

public record VoteOptionRequest(string Title);

public record CreateVotePollRequest(
    string Title,
    VoteCategory Category,
    List<VoteOptionRequest> Options
);

public record VoteRequest(Guid OptionId);

public record VoteOptionDto(
    Guid Id,
    string Title,
    int VoteCount,
    decimal Percentage,
    bool IsSelectedByCurrentUser
);

public record VotePollDto(
    Guid Id,
    string Title,
    VoteCategory Category,
    bool IsClosed,
    DateTime CreatedAt,
    List<VoteOptionDto> Options
);