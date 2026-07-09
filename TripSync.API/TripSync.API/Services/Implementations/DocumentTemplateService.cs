using Microsoft.EntityFrameworkCore;
using TripSync.API.Data;
using TripSync.API.Enums;
using TripSync.API.Models;
using TripSync.API.Services.Interfaces;

namespace TripSync.API.Services.Implementations;

public class DocumentTemplateService : IDocumentTemplateService
{
    private readonly AppDbContext _db;

    public DocumentTemplateService(AppDbContext db)
    {
        _db = db;
    }

    public async Task CreateDefaultDocumentsAsync(Trip trip, Guid tripParticipantId)
    {
        var existingNames = await _db.TripDocuments
            .Where(d => d.TripParticipantId == tripParticipantId)
            .Select(d => d.Name.ToLower())
            .ToListAsync();

        AddMissingDefaultDocuments(trip, tripParticipantId, existingNames);

        await _db.SaveChangesAsync();
    }

    public async Task EnsureDefaultDocumentsAsync(Guid tripId)
    {
        var trip = await _db.Trips
            .Include(t => t.Participants.Where(p => p.IsActive))
                .ThenInclude(p => p.Documents)
            .FirstOrDefaultAsync(t => t.Id == tripId);

        if (trip is null)
            throw new Exception("Viagem não encontrada.");

        foreach (var participant in trip.Participants.Where(p => p.IsActive))
        {
            if (participant.Documents.Any())
                continue;

            AddMissingDefaultDocuments(trip, participant.Id, []);
        }

        await _db.SaveChangesAsync();
    }

    private void AddMissingDefaultDocuments(Trip trip, Guid tripParticipantId, List<string> existingNames)
    {
        foreach (var document in GetDefaultDocumentsByTripType(trip.Type))
        {
            var normalizedName = document.Name.ToLower();

            if (existingNames.Contains(normalizedName))
                continue;

            _db.TripDocuments.Add(new TripDocument
            {
                TripParticipantId = tripParticipantId,
                Name = document.Name,
                Description = document.Description,
                Category = document.Category,
                IsRequired = document.IsRequired,
                IsDefault = true,
                TripType = trip.Type
            });

            existingNames.Add(normalizedName);
        }
    }

    private static List<DefaultDocumentTemplate> GetDefaultDocumentsByTripType(TripType tripType) =>
        tripType == TripType.National
            ? NationalDocuments()
            : InternationalDocuments();

    private static List<DefaultDocumentTemplate> NationalDocuments() =>
    [
        new("Documento de identidade", "Documento oficial com foto para identificação.", "Identificação", true),
        new("Passagens", "Comprovantes de ida e volta ou deslocamentos principais.", "Transporte", true),
        new("Reserva da hospedagem", "Comprovante ou confirmação da hospedagem.", "Hospedagem", true)
    ];

    private static List<DefaultDocumentTemplate> InternationalDocuments() =>
    [
        new("Passaporte", "Documento principal para entrada em outro país.", "Identificação", true),
        new("Passagens", "Comprovantes de ida e volta ou deslocamentos principais.", "Transporte", true),
        new("Reserva da hospedagem", "Comprovante ou confirmação da hospedagem.", "Hospedagem", true),
        new("Seguro viagem", "Apólice ou comprovante do seguro contratado.", "Saúde", true)
    ];

    private record DefaultDocumentTemplate(
        string Name,
        string Description,
        string Category,
        bool IsRequired);
}
