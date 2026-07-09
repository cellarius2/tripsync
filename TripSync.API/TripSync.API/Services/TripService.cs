using Microsoft.EntityFrameworkCore;
using TripSync.API.Data;
using TripSync.API.DTOs.Trips;
using TripSync.API.Enums;
using TripSync.API.Models;
using TripSync.API.Services.Interfaces;

namespace TripSync.API.Services;

public class TripService
{
    private static readonly HashSet<string> AllowedAvatarKeys = new(StringComparer.OrdinalIgnoreCase)
    {
        "dog",
        "cat",
        "penguin",
        "turtle",
        "koala",
        "cockatiel"
    };

    private readonly AppDbContext _db;
    private readonly IDocumentTemplateService _documentTemplateService;
    private readonly NotificationService _notificationService;

    public TripService(
        AppDbContext db,
        IDocumentTemplateService documentTemplateService,
        NotificationService notificationService)
    {
        _db = db;
        _documentTemplateService = documentTemplateService;
        _notificationService = notificationService;
    }

    public async Task<TripSummaryDto> CreateTripAsync(Guid userId, CreateTripRequest request)
    {
        var trip = new Trip
        {
            Name = request.Name.Trim(),
            Origin = request.Origin.Trim(),
            Destination = request.Destination.Trim(),
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Type = request.Type,
            Status = TripStatus.Planning,
            CreatedById = userId,
            InviteCode = GenerateInviteCode()
        };

        _db.Trips.Add(trip);

        var participant = new TripParticipant
        {
            TripId = trip.Id,
            UserId = userId,
            Role = ParticipantRole.Owner,
            AmountSaved = 0,
            IsActive = true
        };

        _db.TripParticipants.Add(participant);

        await _db.SaveChangesAsync();

        await _documentTemplateService.CreateDefaultDocumentsAsync(
            trip,
            participant.Id
        );

        return await BuildSummaryAsync(trip.Id);
    }

    public async Task JoinTripAsync(Guid userId, JoinTripRequest request)
    {
        var code = request.InviteCode.Trim().ToUpper();

        var trip = await _db.Trips.FirstOrDefaultAsync(x => x.InviteCode == code);

        if (trip is null)
            throw new Exception("Código de convite inválido.");

        var alreadyJoined = await _db.TripParticipants.AnyAsync(x =>
            x.TripId == trip.Id &&
            x.UserId == userId &&
            x.IsActive);

        if (alreadyJoined)
            throw new Exception("Você já participa desta viagem.");

        var participant = new TripParticipant
        {
            TripId = trip.Id,
            UserId = userId,
            Role = ParticipantRole.Member,
            AmountSaved = 0,
            IsActive = true
        };

        _db.TripParticipants.Add(participant);

        await _db.SaveChangesAsync();

        await _documentTemplateService.CreateDefaultDocumentsAsync(
            trip,
            participant.Id
        );

        var userName = await _db.Users
            .Where(user => user.Id == userId)
            .Select(user => user.Name)
            .FirstOrDefaultAsync() ?? "Alguém";

        await _notificationService.NotifyTripAsync(
            trip.Id,
            userId,
            "participant_joined",
            $"{userName} entrou na viagem.");
    }

    public async Task<List<TripSummaryDto>> GetUserTripsAsync(Guid userId)
    {
        var tripIds = await _db.TripParticipants
            .Where(x => x.UserId == userId && x.IsActive)
            .Select(x => x.TripId)
            .ToListAsync();

        var result = new List<TripSummaryDto>();

        foreach (var tripId in tripIds)
        {
            result.Add(await BuildSummaryAsync(tripId));
        }

        return result;
    }

    public async Task<TripDetailsDto> GetTripAsync(Guid tripId)
    {
        var trip = await _db.Trips
            .Include(x => x.Participants)
                .ThenInclude(x => x.User)
            .FirstOrDefaultAsync(x => x.Id == tripId);

        if (trip is null)
            throw new Exception("Viagem não encontrada.");

        var participants = trip.Participants
            .Where(x => x.IsActive)
            .Select(x => new TripParticipantDto(
                x.UserId,
                x.User?.Name ?? "Participante",
                x.User?.AvatarColor,
                x.AvatarKey,
                x.Role == ParticipantRole.Owner,
                x.AmountSaved
            ))
            .ToList();

        return new TripDetailsDto(
            trip.Id,
            trip.Name,
            trip.Origin,
            trip.Destination,
            trip.StartDate,
            trip.EndDate,
            trip.Type,
            trip.Status,
            trip.InviteCode,
            participants,
            trip.EstimatedTotalCost
        );
    }

    public async Task<TripSummaryDto> GetDashboardAsync(Guid tripId)
    {
        return await BuildSummaryAsync(tripId);
    }

    public async Task<TripParticipantDto> UpdateParticipantAvatarAsync(
        Guid tripId,
        Guid userId,
        UpdateParticipantAvatarRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.AvatarKey))
            throw new ArgumentException("Avatar inválido.");

        var avatarKey = request.AvatarKey.Trim().ToLowerInvariant();

        if (!AllowedAvatarKeys.Contains(avatarKey))
            throw new ArgumentException("Avatar inválido.");

        var participant = await _db.TripParticipants
            .Include(x => x.User)
            .FirstOrDefaultAsync(x =>
                x.TripId == tripId &&
                x.UserId == userId &&
                x.IsActive);

        if (participant is null)
            throw new KeyNotFoundException("Participante não encontrado nesta viagem.");

        participant.AvatarKey = avatarKey;

        await _db.SaveChangesAsync();

        return new TripParticipantDto(
            participant.UserId,
            participant.User?.Name ?? "Participante",
            participant.User?.AvatarColor,
            participant.AvatarKey,
            participant.Role == ParticipantRole.Owner,
            participant.AmountSaved
        );
    }

    private async Task<TripSummaryDto> BuildSummaryAsync(Guid tripId)
    {
        var trip = await _db.Trips
            .Include(x => x.Participants)
            .FirstAsync(x => x.Id == tripId);

        var activeParticipants = trip.Participants
            .Where(x => x.IsActive)
            .ToList();

        var totalSaved = activeParticipants.Sum(x => x.AmountSaved);

        return new TripSummaryDto(
            trip.Id,
            trip.Name,
            trip.Destination,
            trip.StartDate,
            trip.EndDate,
            trip.Type,
            trip.Status,
            trip.InviteCode,
            activeParticipants.Count,
            totalSaved,
            trip.EstimatedTotalCost
        );
    }

    private string GenerateInviteCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var random = new Random();

        var code = new string(
            Enumerable.Range(0, 5)
                .Select(_ => chars[random.Next(chars.Length)])
                .ToArray());

        return $"TRIP-{code}";
    }
}
