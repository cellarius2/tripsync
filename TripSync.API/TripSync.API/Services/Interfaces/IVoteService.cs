using TripSync.API.DTOs;

namespace TripSync.API.Services.Interfaces;

public interface IVoteService
{
    Task<List<VotePollDto>> GetPollsAsync(Guid tripId, Guid userId);
    Task<VotePollDto> CreatePollAsync(Guid tripId, Guid userId, CreateVotePollRequest request);
    Task<VotePollDto> CastVoteAsync(Guid pollId, Guid userId, VoteRequest request);
    Task<VotePollDto> ClosePollAsync(Guid pollId, Guid userId);
    Task<bool> DeletePollAsync(Guid pollId, Guid userId);
}
