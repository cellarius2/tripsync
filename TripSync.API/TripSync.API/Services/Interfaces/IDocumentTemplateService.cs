using TripSync.API.Models;

namespace TripSync.API.Services.Interfaces;

public interface IDocumentTemplateService
{
    Task CreateDefaultDocumentsAsync(Trip trip, Guid tripParticipantId);

    Task EnsureDefaultDocumentsAsync(Guid tripId);
}
