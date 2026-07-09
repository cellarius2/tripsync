using Microsoft.EntityFrameworkCore;
using TripSync.API.Data;
using TripSync.API.DTOs;
using TripSync.API.Models;
using TripSync.API.Services;
using TripSync.API.Services.Interfaces;

namespace TripSync.API.Services.Implementations;

public class TripDocumentService : ITripDocumentService
{
    private readonly AppDbContext _db;
    private readonly IDocumentTemplateService _documentTemplateService;
    private readonly NotificationService _notificationService;

    public TripDocumentService(
        AppDbContext db,
        IDocumentTemplateService documentTemplateService,
        NotificationService notificationService)
    {
        _db = db;
        _documentTemplateService = documentTemplateService;
        _notificationService = notificationService;
    }

    public async Task<List<ParticipantDocumentsDto>> GetDocumentsAsync(Guid tripId, Guid userId)
    {
        await EnsureParticipantAsync(tripId, userId);
        await _documentTemplateService.EnsureDefaultDocumentsAsync(tripId);

        return await BuildParticipantDocumentsAsync(tripId);
    }

    public async Task<DocumentSummaryDto> GetSummaryAsync(Guid tripId, Guid userId)
    {
        await EnsureParticipantAsync(tripId, userId);
        await _documentTemplateService.EnsureDefaultDocumentsAsync(tripId);

        var documents = await _db.TripDocuments
            .Where(d => d.TripParticipant!.TripId == tripId && d.TripParticipant.IsActive)
            .ToListAsync();

        var total = documents.Count;
        var completed = documents.Count(d => d.Status == DocumentStatus.Approved);
        var percentage = total == 0 ? 0 : (int)Math.Round((decimal)completed / total * 100);

        return new DocumentSummaryDto(total, completed, percentage);
    }

    public async Task<List<ParticipantDocumentsDto>> CreateCustomDocumentAsync(
        Guid tripId,
        Guid userId,
        CreateTripDocumentRequest request)
    {
        await EnsureParticipantAsync(tripId, userId);

        var name = request.Name.Trim();

        if (string.IsNullOrWhiteSpace(name))
            throw new Exception("Informe o nome do documento.");

        var trip = await _db.Trips.FirstOrDefaultAsync(t => t.Id == tripId);

        if (trip is null)
            throw new Exception("Viagem não encontrada.");

        var participants = await _db.TripParticipants
            .Where(p => p.TripId == tripId && p.IsActive)
            .Include(p => p.Documents)
            .ToListAsync();

        foreach (var participant in participants)
        {
            var alreadyExists = participant.Documents.Any(d =>
                d.Name.ToLower() == name.ToLower());

            if (alreadyExists)
                continue;

            _db.TripDocuments.Add(new TripDocument
            {
                TripParticipantId = participant.Id,
                Name = name,
                Description = NormalizeOptional(request.Description),
                Category = NormalizeOptional(request.Category),
                IsRequired = false,
                IsDefault = false,
                TripType = trip.Type
            });
        }

        await _db.SaveChangesAsync();

        var userName = await GetUserNameAsync(userId);
        await _notificationService.NotifyTripAsync(
            tripId,
            userId,
            "document_created",
            $"{userName} enviou um documento.");

        return await BuildParticipantDocumentsAsync(tripId);
    }

    public async Task<TripDocumentDto> ToggleStatusAsync(Guid tripId, Guid documentId, Guid userId)
    {
        await EnsureParticipantAsync(tripId, userId);

        var document = await _db.TripDocuments
            .Include(d => d.TripParticipant)
            .FirstOrDefaultAsync(d =>
                d.Id == documentId &&
                d.TripParticipant!.TripId == tripId &&
                d.TripParticipant.IsActive);

        if (document is null)
            throw new Exception("Documento não encontrado.");

        document.Status = document.Status == DocumentStatus.Approved
            ? DocumentStatus.Pending
            : DocumentStatus.Approved;

        document.SubmittedAt = document.Status == DocumentStatus.Approved ? DateTime.UtcNow : null;
        document.ApprovedAt = document.Status == DocumentStatus.Approved ? DateTime.UtcNow : null;
        document.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return MapDocument(document);
    }

    public async Task DeleteDocumentAsync(Guid tripId, Guid documentId, Guid userId)
    {
        await EnsureParticipantAsync(tripId, userId);

        var document = await _db.TripDocuments
            .Include(d => d.TripParticipant)
            .FirstOrDefaultAsync(d =>
                d.Id == documentId &&
                d.TripParticipant!.TripId == tripId &&
                d.TripParticipant.IsActive);

        if (document is null)
            throw new KeyNotFoundException("Documento não encontrado.");

        _db.TripDocuments.Remove(document);
        await _db.SaveChangesAsync();
    }

    private async Task<List<ParticipantDocumentsDto>> BuildParticipantDocumentsAsync(Guid tripId)
    {
        var participants = await _db.TripParticipants
            .Where(p => p.TripId == tripId && p.IsActive)
            .Include(p => p.User)
            .Include(p => p.Documents)
            .OrderBy(p => p.Role)
            .ThenBy(p => p.User!.Name)
            .ToListAsync();

        return participants.Select(p =>
        {
            var documents = p.Documents
                .OrderByDescending(d => d.IsRequired)
                .ThenByDescending(d => d.IsDefault)
                .ThenBy(d => d.Name)
                .Select(MapDocument)
                .ToList();

            var completed = documents.Count(d => d.Status == DocumentStatus.Approved);
            var progress = documents.Count == 0
                ? 0
                : (int)Math.Round((decimal)completed / documents.Count * 100);

            return new ParticipantDocumentsDto(
                p.Id,
                p.User?.Name ?? "Participante",
                p.User?.AvatarColor,
                progress,
                documents
            );
        }).ToList();
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

    private static string? NormalizeOptional(string? value)
    {
        var normalized = value?.Trim();
        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }

    private static TripDocumentDto MapDocument(TripDocument document) =>
        new(
            document.Id,
            document.Name,
            document.Description,
            document.Category,
            document.IsRequired,
            document.IsDefault,
            document.Status,
            document.CreatedAt,
            document.UpdatedAt
        );

    private async Task<string> GetUserNameAsync(Guid userId)
    {
        return await _db.Users
            .Where(user => user.Id == userId)
            .Select(user => user.Name)
            .FirstOrDefaultAsync() ?? "Alguém";
    }
}
