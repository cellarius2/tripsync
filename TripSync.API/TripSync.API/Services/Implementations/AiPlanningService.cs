using Microsoft.EntityFrameworkCore;
using TripSync.API.Data;
using TripSync.API.DTOs;
using TripSync.API.Enums;
using TripSync.API.Services.Interfaces;

namespace TripSync.API.Services.Implementations;

public class AiPlanningService : IAiPlanningService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _configuration;

    public AiPlanningService(AppDbContext db, IConfiguration configuration)
    {
        _db = db;
        _configuration = configuration;
    }

    public async Task<AiPlanningResponse> GeneratePlanningSuggestionsAsync(
        Guid tripId,
        Guid userId,
        AiPlanningRequest request)
    {
        var trip = await _db.Trips
            .Include(x => x.Participants)
            .FirstOrDefaultAsync(x => x.Id == tripId);

        if (trip is null)
            throw new Exception("Viagem não encontrada.");

        var isParticipant = trip.Participants.Any(x => x.UserId == userId && x.IsActive);

        if (!isParticipant)
            throw new UnauthorizedAccessException("Você não participa desta viagem.");

        var provider = _configuration["AI:Provider"] ?? "Mock";
        var apiKey = _configuration["AI:ApiKey"] ?? string.Empty;

        var safePrompt = BuildSafePrompt(
            trip.Destination,
            trip.Origin,
            trip.StartDate,
            trip.EndDate,
            trip.Type,
            trip.Participants.Count(x => x.IsActive),
            request.EstimatedBudget,
            request.UserPrompt);

        if (provider.Equals("Mock", StringComparison.OrdinalIgnoreCase) ||
            string.IsNullOrWhiteSpace(apiKey))
        {
            return BuildMockResponse(
                trip.Destination,
                trip.Type,
                trip.StartDate,
                trip.EndDate,
                trip.Participants.Count(x => x.IsActive),
                request.EstimatedBudget,
                safePrompt);
        }

        var response = BuildMockResponse(
            trip.Destination,
            trip.Type,
            trip.StartDate,
            trip.EndDate,
            trip.Participants.Count(x => x.IsActive),
            request.EstimatedBudget,
            safePrompt);

        response.Warnings.Add("Integração real de IA ainda não está habilitada nesta sprint. Sugestões mockadas foram retornadas.");

        return response;
    }

    private static string BuildSafePrompt(
        string destination,
        string origin,
        DateOnly startDate,
        DateOnly endDate,
        TripType tripType,
        int participantsCount,
        decimal? estimatedBudget,
        string? userPrompt)
    {
        var cleanPrompt = string.IsNullOrWhiteSpace(userPrompt)
            ? "Gerar sugestões gerais para planejamento de viagem."
            : userPrompt.Trim();

        return string.Join(" | ", new[]
        {
            $"Origem: {origin}",
            $"Destino: {destination}",
            $"Período: {startDate:dd/MM/yyyy} a {endDate:dd/MM/yyyy}",
            $"Tipo: {(tripType == TripType.International ? "Internacional" : "Nacional")}",
            $"Participantes: {participantsCount}",
            $"Orçamento estimado informado: {(estimatedBudget.HasValue ? estimatedBudget.Value.ToString("0.00") : "não informado")}",
            $"Pedido do usuário: {cleanPrompt}"
        });
    }

    private static AiPlanningResponse BuildMockResponse(
        string destination,
        TripType tripType,
        DateOnly startDate,
        DateOnly endDate,
        int participantsCount,
        decimal? estimatedBudget,
        string safePrompt)
    {
        var days = Math.Max(1, endDate.DayNumber - startDate.DayNumber + 1);
        var people = Math.Max(1, participantsCount);
        var isInternational = tripType == TripType.International;
        var baseDailyCost = isInternational ? 520m : 280m;
        var suggestedBudget = estimatedBudget.GetValueOrDefault() > 0
            ? estimatedBudget!.Value
            : Math.Round(baseDailyCost * days * people, 2);
        var emergencyReserve = Math.Round(suggestedBudget * (isInternational ? 0.15m : 0.10m), 2);

        var checklist = new List<string>
        {
            "Confirmar hospedagem",
            "Separar documentos",
            "Verificar transporte",
            "Montar mala",
            "Confirmar horários"
        };

        if (isInternational)
        {
            checklist.AddRange(new[]
            {
                "Verificar passaporte",
                "Conferir visto",
                "Contratar seguro viagem",
                "Separar moeda ou cartão internacional"
            });
        }

        var itinerary = new List<string>
        {
            $"Dia 1: chegada em {destination} e adaptação",
            "Dia 2: passeio principal",
            days >= 3 ? "Dia 3: passeio livre ou descanso" : "Dia 3: revisar prioridades se a viagem for estendida",
            "Último dia: check-out e retorno"
        };

        var warnings = new List<string>
        {
            "Valores são estimativas e devem ser revisados pelo grupo.",
            "Confirme documentos e regras de entrada antes da viagem."
        };

        if (!string.IsNullOrWhiteSpace(safePrompt))
            warnings.Add("As sugestões são apoio ao planejamento e não substituem a decisão do grupo.");

        return new AiPlanningResponse(
            "Para essa viagem, o ideal é definir primeiro transporte, hospedagem e orçamento aproximado.",
            suggestedBudget,
            emergencyReserve,
            checklist,
            new List<string>
            {
                "Escolher hospedagem",
                "Escolher meio de transporte",
                "Definir primeiro passeio",
                "Definir restaurantes principais"
            },
            itinerary,
            warnings
        );
    }
}
