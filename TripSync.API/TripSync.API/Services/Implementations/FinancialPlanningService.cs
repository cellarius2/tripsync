using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using TripSync.API.Data;
using TripSync.API.DTOs;
using TripSync.API.Hubs;
using TripSync.API.Models;
using TripSync.API.Services.Interfaces;

namespace TripSync.API.Services.Implementations;

public class FinancialPlanningService : IFinancialPlanningService
{
    private readonly AppDbContext _db;
    private readonly IHubContext<TripHub> _hub;
    private readonly NotificationService _notificationService;

    public FinancialPlanningService(
        AppDbContext db,
        IHubContext<TripHub> hub,
        NotificationService notificationService)
    {
        _db = db;
        _hub = hub;
        _notificationService = notificationService;
    }

    public async Task<TravelBudgetDto> GetBudgetAsync(Guid tripId, Guid userId)
    {
        await EnsureParticipantAsync(tripId, userId);

        var budget = await _db.TravelBudgets
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.TripId == tripId);

        return MapBudget(tripId, budget);
    }

    public async Task<TravelBudgetDto> UpdateBudgetAsync(
        Guid tripId,
        Guid userId,
        UpdateTravelBudgetRequest request)
    {
        await EnsureParticipantAsync(tripId, userId);
        ValidateAmounts(request);

        var budget = await _db.TravelBudgets
            .FirstOrDefaultAsync(x => x.TripId == tripId);

        var now = DateTime.UtcNow;

        if (budget is null)
        {
            budget = new TravelBudget
            {
                TripId = tripId,
                CreatedAt = now
            };

            _db.TravelBudgets.Add(budget);
        }

        budget.TransportationAmount = request.TransportationAmount;
        budget.AccommodationAmount = request.AccommodationAmount;
        budget.FoodAmount = request.FoodAmount;
        budget.ActivitiesAmount = request.ActivitiesAmount;
        budget.EmergencyReserveAmount = request.EmergencyReserveAmount;
        budget.TotalAmount = CalculateTotal(request);
        budget.UpdatedAt = now;

        await _db.SaveChangesAsync();

        return MapBudget(tripId, budget);
    }

    public async Task<FinancialSummaryDto> GetSummaryAsync(Guid tripId, Guid userId)
    {
        var currentParticipant = await EnsureParticipantAsync(tripId, userId);

        var budget = await _db.TravelBudgets
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.TripId == tripId);

        var activeParticipants = await GetActiveParticipantsQuery(tripId)
            .Include(x => x.Saving)
            .ToListAsync();

        var totalBudget = budget?.TotalAmount ?? 0;
        var activeParticipantsCount = activeParticipants.Count;
        var totalSaved = activeParticipants.Sum(x => x.Saving?.AmountSaved ?? 0);
        var valuePerPerson = CalculateGoalPerParticipant(totalBudget, activeParticipantsCount);

        var myAmountSaved = activeParticipants
            .FirstOrDefault(x => x.Id == currentParticipant.Id)
            ?.Saving?.AmountSaved ?? 0;

        return new FinancialSummaryDto(
            totalBudget,
            totalSaved,
            Math.Max(0, totalBudget - totalSaved),
            valuePerPerson,
            CalculatePercentage(totalSaved, totalBudget),
            myAmountSaved,
            CalculatePercentage(myAmountSaved, valuePerPerson),
            activeParticipantsCount
        );
    }

    public async Task<ParticipantSavingProgressDto> UpdateParticipantSavingAsync(
        Guid tripId,
        Guid userId,
        UpdateParticipantSavingRequest request)
    {
        if (request.AmountSaved < 0)
            throw new Exception("O valor guardado não pode ser negativo.");

        var participant = await EnsureParticipantAsync(tripId, userId);
        var totalBudget = await GetTotalBudgetAsync(tripId);
        var activeCount = await GetActiveParticipantsQuery(tripId).CountAsync();
        var valuePerPerson = CalculateGoalPerParticipant(totalBudget, activeCount);
        var previousTotalSaved = await GetActiveParticipantsQuery(tripId)
            .Select(x => x.Saving != null ? x.Saving.AmountSaved : 0)
            .SumAsync();

        var saving = await _db.ParticipantSavings
            .FirstOrDefaultAsync(x => x.TripParticipantId == participant.Id);

        var previousAmount = saving?.AmountSaved ?? 0;
        var now = DateTime.UtcNow;

        if (saving is null)
        {
            saving = new ParticipantSaving
            {
                TripParticipantId = participant.Id,
                AmountSaved = request.AmountSaved,
                UpdatedAt = now
            };

            _db.ParticipantSavings.Add(saving);
        }
        else
        {
            saving.AmountSaved = request.AmountSaved;
            saving.UpdatedAt = now;
        }

        if (previousAmount != request.AmountSaved)
        {
            _db.SavingHistories.Add(new SavingHistory
            {
                ParticipantSaving = saving,
                PreviousAmount = previousAmount,
                NewAmount = request.AmountSaved,
                Difference = request.AmountSaved - previousAmount,
                CreatedAt = now
            });
        }

        await _db.SaveChangesAsync();

        if (previousAmount != saving.AmountSaved)
        {
            var participantName = participant.User?.Name ?? "Participante";
            var currentTotalSaved = previousTotalSaved - previousAmount + saving.AmountSaved;
            var previousGroupProgress = CalculatePercentage(previousTotalSaved, totalBudget);
            var currentGroupProgress = CalculatePercentage(currentTotalSaved, totalBudget);
            var previousPersonalProgress = CalculatePercentage(previousAmount, valuePerPerson);
            var currentPersonalProgress = CalculatePercentage(saving.AmountSaved, valuePerPerson);

            await NotifyAndSync(
                tripId,
                "financial_saving_updated",
                $"{participantName} atualizou sua contribuição para {FormatCurrency(saving.AmountSaved)}.");

            if (previousPersonalProgress < 100 && currentPersonalProgress >= 100)
            {
                await NotifyAndSync(
                    tripId,
                    "financial_personal_goal_completed",
                    $"{participantName} concluiu sua meta pessoal para a viagem.");
            }

            if (previousGroupProgress < 50 && currentGroupProgress >= 50)
            {
                await NotifyAndSync(
                    tripId,
                    "financial_group_goal_50",
                    "O grupo atingiu 50% da meta financeira.");
            }

            if (previousGroupProgress < 100 && currentGroupProgress >= 100)
            {
                await NotifyAndSync(
                    tripId,
                    "financial_group_goal_100",
                    "O grupo atingiu 100% da meta financeira.");
            }
        }

        return new ParticipantSavingProgressDto(
            participant.Id,
            participant.UserId,
            participant.User?.Name ?? string.Empty,
            participant.User?.AvatarColor,
            saving.AmountSaved,
            valuePerPerson,
            Math.Max(0, valuePerPerson - saving.AmountSaved),
            CalculatePercentage(saving.AmountSaved, valuePerPerson),
            saving.UpdatedAt
        );
    }

    public async Task<List<ParticipantSavingProgressDto>> GetParticipantsProgressAsync(
        Guid tripId,
        Guid userId)
    {
        await EnsureParticipantAsync(tripId, userId);

        var totalBudget = await GetTotalBudgetAsync(tripId);

        var participants = await GetActiveParticipantsQuery(tripId)
            .Include(x => x.User)
            .Include(x => x.Saving)
            .OrderBy(x => x.User!.Name)
            .ToListAsync();

        var valuePerPerson = CalculateGoalPerParticipant(totalBudget, participants.Count);

        return participants
            .Select(x =>
            {
                var amountSaved = x.Saving?.AmountSaved ?? 0;

                return new ParticipantSavingProgressDto(
                    x.Id,
                    x.UserId,
                    x.User?.Name ?? string.Empty,
                    x.User?.AvatarColor,
                    amountSaved,
                    valuePerPerson,
                    Math.Max(0, valuePerPerson - amountSaved),
                    CalculatePercentage(amountSaved, valuePerPerson),
                    x.Saving?.UpdatedAt
                );
            })
            .ToList();
    }

    private async Task<TripParticipant> EnsureParticipantAsync(Guid tripId, Guid userId)
    {
        var participant = await _db.TripParticipants
            .Include(x => x.User)
            .FirstOrDefaultAsync(x =>
                x.TripId == tripId &&
                x.UserId == userId &&
                x.IsActive);

        if (participant is null)
            throw new UnauthorizedAccessException("Você não participa desta viagem.");

        return participant;
    }

    private IQueryable<TripParticipant> GetActiveParticipantsQuery(Guid tripId)
    {
        return _db.TripParticipants
            .Where(x => x.TripId == tripId && x.IsActive);
    }

    private async Task<decimal> GetTotalBudgetAsync(Guid tripId)
    {
        return await _db.TravelBudgets
            .Where(x => x.TripId == tripId)
            .Select(x => x.TotalAmount)
            .FirstOrDefaultAsync();
    }

    private static TravelBudgetDto MapBudget(Guid tripId, TravelBudget? budget)
    {
        return new TravelBudgetDto(
            budget?.Id,
            tripId,
            budget?.TransportationAmount ?? 0,
            budget?.AccommodationAmount ?? 0,
            budget?.FoodAmount ?? 0,
            budget?.ActivitiesAmount ?? 0,
            budget?.EmergencyReserveAmount ?? 0,
            budget?.TotalAmount ?? 0,
            budget?.CreatedAt,
            budget?.UpdatedAt
        );
    }

    private static void ValidateAmounts(UpdateTravelBudgetRequest request)
    {
        if (request.TransportationAmount < 0 ||
            request.AccommodationAmount < 0 ||
            request.FoodAmount < 0 ||
            request.ActivitiesAmount < 0 ||
            request.EmergencyReserveAmount < 0)
        {
            throw new Exception("Os valores do orçamento não podem ser negativos.");
        }
    }

    private static decimal CalculateTotal(UpdateTravelBudgetRequest request)
    {
        return request.TransportationAmount +
            request.AccommodationAmount +
            request.FoodAmount +
            request.ActivitiesAmount +
            request.EmergencyReserveAmount;
    }

    private static decimal CalculateGoalPerParticipant(decimal totalBudget, int activeParticipantsCount)
    {
        if (totalBudget <= 0 || activeParticipantsCount <= 0)
            return 0;

        return Math.Round(totalBudget / activeParticipantsCount, 2);
    }

    private static decimal CalculatePercentage(decimal amount, decimal goal)
    {
        if (amount <= 0 || goal <= 0)
            return 0;

        return Math.Min(100, Math.Round(amount / goal * 100, 1));
    }

    private async Task NotifyAndSync(Guid tripId, string type, string message)
    {
        await _notificationService.NotifyTripAsync(tripId, null, type, message, includeSender: true);
        await _hub.Clients.Group(tripId.ToString()).SendAsync("dashboardUpdated", tripId);
    }

    private static string FormatCurrency(decimal value)
    {
        return string.Format(
            System.Globalization.CultureInfo.GetCultureInfo("pt-BR"),
            "{0:C}",
            value);
    }
}
