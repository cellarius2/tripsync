using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TripSync.API.Data;
using TripSync.API.DTOs;
using TripSync.API.Hubs;
using TripSync.API.Models;

namespace TripSync.API.Services;

public class NotificationService
{
    private readonly AppDbContext _db;
    private readonly IHubContext<TripHub> _hub;

    public NotificationService(AppDbContext db, IHubContext<TripHub> hub)
    {
        _db = db;
        _hub = hub;
    }

    public async Task<List<NotificationDto>> GetForUserAsync(Guid userId)
    {
        var notifications = await _db.Notifications
            .AsNoTracking()
            .Include(notification => notification.Trip)
            .Include(notification => notification.SenderUser)
            .Where(notification => notification.RecipientUserId == userId)
            .OrderByDescending(notification => notification.CreatedAt)
            .Take(50)
            .ToListAsync();

        return notifications.Select(Map).ToList();
    }

    public async Task<List<TripActivityDto>> GetTripActivityAsync(Guid tripId, Guid userId)
    {
        var isParticipant = await _db.TripParticipants.AnyAsync(participant =>
            participant.TripId == tripId &&
            participant.UserId == userId &&
            participant.IsActive);

        if (!isParticipant)
            throw new UnauthorizedAccessException("Você não participa desta viagem.");

        var activities = await _db.TripActivities
            .AsNoTracking()
            .Include(activity => activity.Trip)
            .Where(activity => activity.TripId == tripId)
            .OrderByDescending(activity => activity.CreatedAt)
            .Take(50)
            .ToListAsync();

        return activities.Select(activity => MapActivity(activity)).ToList();
    }

    public async Task MarkAllAsReadAsync(Guid userId)
    {
        var unread = await _db.Notifications
            .Where(notification => notification.RecipientUserId == userId && !notification.IsRead)
            .ToListAsync();

        foreach (var notification in unread)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
    }

    public async Task<NotificationDto> ThrowTomatoAsync(Guid tripId, Guid senderUserId, Guid recipientUserId)
    {
        if (senderUserId == recipientUserId)
            throw new ArgumentException("Você não pode jogar tomate em si mesmo.");

        var trip = await _db.Trips
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == tripId);

        if (trip is null)
            throw new KeyNotFoundException("Viagem não encontrada.");

        var sender = await _db.TripParticipants
            .AsNoTracking()
            .Include(participant => participant.User)
            .FirstOrDefaultAsync(participant =>
                participant.TripId == tripId &&
                participant.UserId == senderUserId &&
                participant.IsActive);

        if (sender is null)
            throw new UnauthorizedAccessException("Você não participa desta viagem.");

        var recipient = await _db.TripParticipants
            .AsNoTracking()
            .Include(participant => participant.User)
            .FirstOrDefaultAsync(participant =>
                participant.TripId == tripId &&
                participant.UserId == recipientUserId &&
                participant.IsActive);

        if (recipient is null)
            throw new KeyNotFoundException("Tripulante não encontrado nesta viagem.");

        var senderName = sender.User?.Name?.Trim();
        var recipientName = recipient.User?.Name?.Trim();

        if (string.IsNullOrWhiteSpace(senderName) || string.IsNullOrWhiteSpace(recipientName))
            throw new InvalidOperationException("Não foi possível identificar os usuários envolvidos no tomate.");

        var type = "TOMATO_THROWN";

        var activity = new TripActivity
        {
            TripId = tripId,
            Type = type,
            ActorUserId = senderUserId,
            ActorName = senderName,
            TargetUserId = recipientUserId,
            TargetUserName = recipientName,
            Message = $"{senderName} jogou um tomate em {recipientName}."
        };

        var targetNotification = new Notification
        {
            TripId = tripId,
            SenderUserId = senderUserId,
            RecipientUserId = recipientUserId,
            Type = type,
            TargetUserId = recipientUserId,
            TargetUserName = recipientName,
            Message = $"{senderName} jogou um tomate em você."
        };

        var otherParticipantIds = await _db.TripParticipants
            .AsNoTracking()
            .Where(participant =>
                participant.TripId == tripId &&
                participant.IsActive &&
                participant.UserId != senderUserId &&
                participant.UserId != recipientUserId)
            .Select(participant => participant.UserId)
            .Distinct()
            .ToListAsync();

        var collectiveNotifications = otherParticipantIds.Select(participantUserId => new Notification
        {
            TripId = tripId,
            SenderUserId = senderUserId,
            RecipientUserId = participantUserId,
            Type = type,
            TargetUserId = recipientUserId,
            TargetUserName = recipientName,
            Message = $"{senderName} jogou um tomate em {recipientName}."
        }).ToList();

        _db.TripActivities.Add(activity);
        _db.Notifications.Add(targetNotification);

        if (collectiveNotifications.Count > 0)
            _db.Notifications.AddRange(collectiveNotifications);

        await _db.SaveChangesAsync();

        var activityDto = MapActivity(activity, trip.Name);
        await _hub.Clients.Group(tripId.ToString()).SendAsync("activity", activityDto);

        var targetNotificationDto = Map(targetNotification, trip.Name, senderName);
        await _hub.Clients.User(recipientUserId.ToString()).SendAsync("notification", targetNotificationDto);

        foreach (var notification in collectiveNotifications)
        {
            var dto = Map(notification, trip.Name, senderName);

            await _hub.Clients.User(notification.RecipientUserId.ToString()).SendAsync("notification", dto);
        }

        return targetNotificationDto;
    }

    public async Task<List<NotificationDto>> NotifyTripAsync(
        Guid tripId,
        Guid? senderUserId,
        string type,
        string message,
        bool includeSender = false)
    {
        var trip = await _db.Trips
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == tripId);

        if (trip is null)
            return [];

        var canonicalType = CanonicalizeType(type);
        var actorName = senderUserId.HasValue
            ? await _db.Users
                .Where(user => user.Id == senderUserId.Value)
                .Select(user => user.Name)
                .FirstOrDefaultAsync()
            : null;

        var activity = new TripActivity
        {
            TripId = tripId,
            Type = canonicalType,
            ActorUserId = senderUserId,
            ActorName = actorName,
            Message = message
        };

        var recipientUserIds = await _db.TripParticipants
            .Where(participant =>
                participant.TripId == tripId &&
                participant.IsActive &&
                (includeSender || senderUserId == null || participant.UserId != senderUserId))
            .Select(participant => participant.UserId)
            .Distinct()
            .ToListAsync();

        var notificationMessage = AddTripContext(message, trip.Name);
        var notifications = recipientUserIds.Select(recipientUserId => new Notification
        {
            TripId = tripId,
            SenderUserId = senderUserId,
            RecipientUserId = recipientUserId,
            Type = canonicalType,
            Message = notificationMessage
        }).ToList();

        _db.TripActivities.Add(activity);
        if (notifications.Count > 0)
            _db.Notifications.AddRange(notifications);

        await _db.SaveChangesAsync();

        var activityDto = MapActivity(activity, trip.Name);
        await _hub.Clients.Group(tripId.ToString()).SendAsync("activity", activityDto);

        var dtos = notifications
            .Select(notification => Map(notification, trip.Name, actorName))
            .ToList();

        foreach (var dto in dtos)
        {
            if (dto.RecipientUserId.HasValue)
                await _hub.Clients.User(dto.RecipientUserId.Value.ToString()).SendAsync("notification", dto);
        }

        return dtos;
    }

    private static string CanonicalizeType(string type) =>
        type.Trim().ToUpperInvariant() switch
        {
            "TOMATO" => "TOMATO_THROWN",
            "PARTICIPANT_JOINED" => "MEMBER_JOINED",
            "DOCUMENT_CREATED" => "DOCUMENT_UPLOADED",
            "CHECKLIST_CREATED" => "TASK_CREATED",
            "CHECKLIST_DONE" => "TASK_COMPLETED",
            "FINANCIAL_SAVING_UPDATED" => "CONTRIBUTION_ADDED",
            "FINANCIAL_PERSONAL_GOAL_COMPLETED" => "CONTRIBUTION_GOAL_COMPLETED",
            "FINANCIAL_GROUP_GOAL_50" => "BUDGET_MILESTONE",
            "FINANCIAL_GROUP_GOAL_100" => "BUDGET_COMPLETED",
            var value => value
        };

    private static string AddTripContext(string message, string tripName)
    {
        var trimmed = message.Trim().TrimEnd('.');
        return $"{trimmed} na viagem {tripName}.";
    }

    private static NotificationDto Map(Notification notification) =>
        Map(
            notification,
            notification.Trip?.Name,
            notification.SenderUser?.Name);

    private static NotificationDto Map(
        Notification notification,
        string? tripName,
        string? actorName) =>
        new(
            notification.Type,
            notification.Message,
            notification.TripId,
            notification.CreatedAt,
            notification.Id,
            notification.RecipientUserId,
            notification.SenderUserId,
            notification.IsRead,
            tripName,
            actorName,
            notification.TargetUserId,
            notification.TargetUserName
        );

    private static TripActivityDto MapActivity(TripActivity activity, string? tripName = null) =>
        new(
            activity.Id,
            activity.TripId,
            tripName ?? activity.Trip?.Name,
            activity.Type,
            activity.ActorUserId,
            activity.ActorName,
            activity.TargetUserId,
            activity.TargetUserName,
            activity.Message,
            activity.CreatedAt
        );
}