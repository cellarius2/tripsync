using Microsoft.EntityFrameworkCore;
using TripSync.API.Data;
using TripSync.API.DTOs;
using TripSync.API.Models;
using TripSync.API.Services;
using TripSync.API.Services.Interfaces;

namespace TripSync.API.Services.Implementations;

public class VoteService : IVoteService
{
    private readonly AppDbContext _db;
    private readonly ITripDecisionService _decisionService;
    private readonly NotificationService _notificationService;

    public VoteService(
        AppDbContext db,
        ITripDecisionService decisionService,
        NotificationService notificationService)
    {
        _db = db;
        _decisionService = decisionService;
        _notificationService = notificationService;
    }

    public async Task<List<VotePollDto>> GetPollsAsync(Guid tripId, Guid userId)
    {
        await EnsureParticipantAsync(tripId, userId);

        var polls = await _db.VotePolls
            .Where(p => p.TripId == tripId)
            .Include(p => p.Options)
                .ThenInclude(o => o.Votes)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return polls.Select(p => MapPoll(p, userId)).ToList();
    }

    public async Task<VotePollDto> CreatePollAsync(Guid tripId, Guid userId, CreateVotePollRequest request)
    {
        await EnsureParticipantAsync(tripId, userId);

        if (string.IsNullOrWhiteSpace(request.Title))
            throw new Exception("Informe o título da votação.");

        var options = request.Options
            .Where(o => !string.IsNullOrWhiteSpace(o.Title))
            .Select(o => o.Title.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (options.Count < 2)
            throw new Exception("A votação precisa ter pelo menos duas opções.");

        var poll = new VotePoll
        {
            TripId = tripId,
            Title = request.Title.Trim(),
            Category = request.Category,
            CreatedById = userId,
            IsClosed = false
        };

        foreach (var option in options)
            poll.Options.Add(new VoteOption { Title = option });

        _db.VotePolls.Add(poll);
        await _db.SaveChangesAsync();

        var userName = await GetUserNameAsync(userId);
        await _notificationService.NotifyTripAsync(
            tripId,
            userId,
            "vote_created",
            $"{userName} criou uma votação.");

        var created = await _db.VotePolls
            .Include(p => p.Options)
                .ThenInclude(o => o.Votes)
            .FirstAsync(p => p.Id == poll.Id);

        return MapPoll(created, userId);
    }

    public async Task<VotePollDto> CastVoteAsync(Guid pollId, Guid userId, VoteRequest request)
    {
        var poll = await _db.VotePolls
            .Include(p => p.Options)
                .ThenInclude(o => o.Votes)
            .FirstOrDefaultAsync(p => p.Id == pollId);

        if (poll is null)
            throw new Exception("Votação não encontrada.");

        await EnsureParticipantAsync(poll.TripId, userId);

        if (poll.IsClosed)
            throw new Exception("Esta votação já foi encerrada.");

        var selectedOption = poll.Options.FirstOrDefault(o => o.Id == request.OptionId);

        if (selectedOption is null)
            throw new Exception("Opção inválida.");

        var previousVotes = poll.Options
            .SelectMany(o => o.Votes)
            .Where(v => v.UserId == userId)
            .ToList();

        _db.Votes.RemoveRange(previousVotes);

        _db.Votes.Add(new Vote
        {
            VotePollId = poll.Id,
            VoteOptionId = selectedOption.Id,
            UserId = userId
        });

        await _db.SaveChangesAsync();

        var updated = await _db.VotePolls
            .Include(p => p.Options)
                .ThenInclude(o => o.Votes)
            .FirstAsync(p => p.Id == pollId);

        return MapPoll(updated, userId);
    }

    public async Task<VotePollDto> ClosePollAsync(Guid pollId, Guid userId)
    {
        var poll = await _db.VotePolls
            .Include(p => p.Options)
                .ThenInclude(o => o.Votes)
            .FirstOrDefaultAsync(p => p.Id == pollId);

        if (poll is null)
            throw new Exception("Votação não encontrada.");

        await EnsureParticipantAsync(poll.TripId, userId);

        if (poll.IsClosed)
            return MapPoll(poll, userId);

        poll.IsClosed = true;

        var winner = poll.Options
            .OrderByDescending(o => o.Votes.Count)
            .ThenBy(o => o.Title)
            .FirstOrDefault();

        if (winner is not null && winner.Votes.Count > 0)
        {
            await _decisionService.UpsertDecisionAsync(
                poll.TripId,
                poll.Category,
                winner.Title,
                poll.Id
            );
        }

        await _db.SaveChangesAsync();

        return MapPoll(poll, userId);
    }

    public async Task<bool> DeletePollAsync(Guid pollId, Guid userId)
    {
        var poll = await _db.VotePolls
            .Include(p => p.Options)
                .ThenInclude(o => o.Votes)
            .FirstOrDefaultAsync(p => p.Id == pollId);

        if (poll is null)
            return false;

        await EnsureParticipantAsync(poll.TripId, userId);

        var decisions = await _db.TripDecisions
            .Where(decision => decision.SourcePollId == pollId)
            .ToListAsync();

        foreach (var decision in decisions)
        {
            decision.SourcePollId = null;
            decision.UpdatedAt = DateTime.UtcNow;
        }

        var votes = poll.Options
            .SelectMany(option => option.Votes)
            .ToList();

        _db.Votes.RemoveRange(votes);
        _db.VoteOptions.RemoveRange(poll.Options);
        _db.VotePolls.Remove(poll);

        await _db.SaveChangesAsync();

        return true;
    }

    private async Task EnsureParticipantAsync(Guid tripId, Guid userId)
    {
        var isParticipant = await _db.TripParticipants.AnyAsync(p =>
            p.TripId == tripId &&
            p.UserId == userId &&
            p.IsActive);

        if (!isParticipant)
            throw new UnauthorizedAccessException("Você não participa desta viagem.");
    }

    private static VotePollDto MapPoll(VotePoll poll, Guid userId)
    {
        var totalVotes = poll.Options.Sum(o => o.Votes.Count);

        var options = poll.Options
            .OrderByDescending(o => o.Votes.Count)
            .ThenBy(o => o.Title)
            .Select(o =>
            {
                var count = o.Votes.Count;
                var percentage = totalVotes == 0
                    ? 0
                    : Math.Round((decimal)count / totalVotes * 100, 1);

                return new VoteOptionDto(
                    o.Id,
                    o.Title,
                    count,
                    percentage,
                    o.Votes.Any(v => v.UserId == userId)
                );
            })
            .ToList();

        return new VotePollDto(
            poll.Id,
            poll.Title,
            poll.Category,
            poll.IsClosed,
            poll.CreatedAt,
            options
        );
    }

    private async Task<string> GetUserNameAsync(Guid userId)
    {
        return await _db.Users
            .Where(user => user.Id == userId)
            .Select(user => user.Name)
            .FirstOrDefaultAsync() ?? "Alguém";
    }
}
