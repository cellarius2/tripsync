using Microsoft.EntityFrameworkCore;
using TripSync.API.Data;
using TripSync.API.DTOs.Checklists;
using TripSync.API.Models;

namespace TripSync.API.Services;

public class ChecklistService
{
    private readonly AppDbContext _db;
    private readonly NotificationService _notificationService;

    public ChecklistService(AppDbContext db, NotificationService notificationService)
    {
        _db = db;
        _notificationService = notificationService;
    }

    public async Task<List<ChecklistItemDto>> GetItemsAsync(Guid tripId, Guid userId)
    {
        await EnsureParticipantAsync(tripId, userId);

        var items = await _db.ChecklistItems
            .Where(x => x.TripId == tripId)
            .Include(x => x.AssignedToParticipant)
                .ThenInclude(x => x!.User)
            .OrderBy(x => x.IsDone)
            .ThenByDescending(x => x.CreatedAt)
            .ToListAsync();

        return items.Select(Map).ToList();
    }

    public async Task<ChecklistItemDto> CreateAsync(Guid tripId, Guid userId, CreateChecklistItemRequest request)
    {
        await EnsureParticipantAsync(tripId, userId);

        if (string.IsNullOrWhiteSpace(request.Title))
            throw new Exception("Informe o título da tarefa.");

        if (request.AssignedToParticipantId.HasValue)
        {
            var participantExists = await _db.TripParticipants.AnyAsync(x =>
                x.Id == request.AssignedToParticipantId.Value &&
                x.TripId == tripId &&
                x.IsActive);

            if (!participantExists)
                throw new Exception("Participante responsável inválido.");
        }

        var item = new ChecklistItem
        {
            TripId = tripId,
            Title = request.Title.Trim(),
            Category = NormalizeCategory(request.Category),
            AssignedToParticipantId = request.AssignedToParticipantId
        };

        _db.ChecklistItems.Add(item);
        await _db.SaveChangesAsync();

        var userName = await GetUserNameAsync(userId);
        await _notificationService.NotifyTripAsync(
            tripId,
            userId,
            "checklist_created",
            $"{userName} criou uma tarefa.");

        return await GetByIdAsync(tripId, userId, item.Id);
    }

    public async Task<ChecklistItemDto> UpdateAsync(
        Guid tripId,
        Guid userId,
        Guid itemId,
        UpdateChecklistItemRequest request)
    {
        await EnsureParticipantAsync(tripId, userId);

        if (string.IsNullOrWhiteSpace(request.Title))
            throw new Exception("Informe o título da tarefa.");

        if (request.AssignedToParticipantId.HasValue)
        {
            var participantExists = await _db.TripParticipants.AnyAsync(x =>
                x.Id == request.AssignedToParticipantId.Value &&
                x.TripId == tripId &&
                x.IsActive);

            if (!participantExists)
                throw new Exception("Participante responsável inválido.");
        }

        var item = await _db.ChecklistItems
            .FirstOrDefaultAsync(x => x.Id == itemId && x.TripId == tripId);

        if (item is null)
            throw new Exception("Tarefa não encontrada.");

        item.Title = request.Title.Trim();
        item.Category = NormalizeCategory(request.Category);
        item.AssignedToParticipantId = request.AssignedToParticipantId;

        await _db.SaveChangesAsync();

        return await GetByIdAsync(tripId, userId, item.Id);
    }

    public async Task<ChecklistItemDto> ToggleAsync(Guid tripId, Guid userId, Guid itemId)
    {
        await EnsureParticipantAsync(tripId, userId);

        var item = await _db.ChecklistItems
            .FirstOrDefaultAsync(x => x.Id == itemId && x.TripId == tripId);

        if (item is null)
            throw new Exception("Tarefa não encontrada.");

        item.IsDone = !item.IsDone;
        item.CompletedAt = item.IsDone ? DateTime.UtcNow : null;

        await _db.SaveChangesAsync();

        return await GetByIdAsync(tripId, userId, item.Id);
    }

    public async Task DeleteAsync(Guid tripId, Guid userId, Guid itemId)
    {
        await EnsureParticipantAsync(tripId, userId);

        var item = await _db.ChecklistItems
            .FirstOrDefaultAsync(x => x.Id == itemId && x.TripId == tripId);

        if (item is null)
            throw new Exception("Tarefa não encontrada.");

        _db.ChecklistItems.Remove(item);
        await _db.SaveChangesAsync();
    }

    private async Task<ChecklistItemDto> GetByIdAsync(Guid tripId, Guid userId, Guid itemId)
    {
        await EnsureParticipantAsync(tripId, userId);

        var item = await _db.ChecklistItems
            .Include(x => x.AssignedToParticipant)
                .ThenInclude(x => x!.User)
            .FirstAsync(x => x.Id == itemId && x.TripId == tripId);

        return Map(item);
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

    private static ChecklistItemDto Map(ChecklistItem item) =>
        new(
            item.Id,
            item.Title,
            item.Category,
            item.IsDone,
            item.AssignedToParticipantId,
            item.AssignedToParticipant?.User?.Name,
            item.CreatedAt,
            item.CompletedAt
        );

    private static string? NormalizeCategory(string? category)
    {
        return string.IsNullOrWhiteSpace(category) ? "Geral" : category.Trim();
    }

    private async Task<string> GetUserNameAsync(Guid userId)
    {
        return await _db.Users
            .Where(user => user.Id == userId)
            .Select(user => user.Name)
            .FirstOrDefaultAsync() ?? "Alguém";
    }
}
