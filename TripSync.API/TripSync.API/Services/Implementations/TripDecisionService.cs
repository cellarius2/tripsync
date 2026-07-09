using Microsoft.EntityFrameworkCore;
using TripSync.API.Data;
using TripSync.API.DTOs;
using TripSync.API.Enums;
using TripSync.API.Models;
using TripSync.API.Services.Interfaces;

namespace TripSync.API.Services.Implementations;

public class TripDecisionService : ITripDecisionService
{
    private readonly AppDbContext _db;

    public TripDecisionService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<DecisionSummaryDto> GetSummaryAsync(Guid tripId, Guid userId)
    {
        await EnsureParticipantAsync(tripId, userId);

        var decisions = await _db.TripDecisions
            .Where(x => x.TripId == tripId)
            .OrderBy(x => x.Category)
            .ToListAsync();

        const int totalExpected = 3;

        var mapped = decisions.Select(MapToDto).ToList();
        var totalDefined = mapped.Count;

        var percentage = Math.Min(
            100,
            (int)Math.Round((decimal)totalDefined / totalExpected * 100)
        );

        return new DecisionSummaryDto(
            totalExpected,
            totalDefined,
            percentage,
            mapped
        );
    }

    public async Task<TripDecisionDto> UpsertDecisionAsync(
        Guid tripId,
        VoteCategory category,
        string selectedOptionTitle,
        Guid? sourcePollId)
    {
        var decision = await _db.TripDecisions
            .FirstOrDefaultAsync(x => x.TripId == tripId && x.Category == category);

        if (decision is null)
        {
            decision = new TripDecision
            {
                TripId = tripId,
                Category = category,
                SelectedOptionTitle = selectedOptionTitle.Trim(),
                SourcePollId = sourcePollId,
                UpdatedAt = DateTime.UtcNow
            };

            _db.TripDecisions.Add(decision);
        }
        else
        {
            decision.SelectedOptionTitle = selectedOptionTitle.Trim();
            decision.SourcePollId = sourcePollId;
            decision.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        return MapToDto(decision);
    }

    private async Task EnsureParticipantAsync(Guid tripId, Guid userId)
    {
        var isParticipant = await _db.TripParticipants.AnyAsync(x =>
            x.TripId == tripId &&
            x.UserId == userId &&
            x.IsActive);

        if (!isParticipant)
            throw new UnauthorizedAccessException("Você não participa desta viagem.");
    }

    private static TripDecisionDto MapToDto(TripDecision decision)
    {
        return new TripDecisionDto(
            decision.Id,
            decision.Category,
            GetCategoryLabel(decision.Category),
            decision.SelectedOptionTitle,
            decision.SourcePollId,
            decision.UpdatedAt
        );
    }

    private static string GetCategoryLabel(VoteCategory category)
    {
        return category switch
        {
            VoteCategory.Accommodation => "Hospedagem",
            VoteCategory.Transport => "Transporte",
            VoteCategory.Attraction => "Passeio",
            VoteCategory.Restaurant => "Restaurante",
            VoteCategory.DepartureTime => "Horário de saída",
            _ => "Outra decisão"
        };
    }
}