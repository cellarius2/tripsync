using TripSync.API.Models;

namespace TripSync.API.DTOs;

public record CreateExpenseRequest(
    string Description,
    string Category,
    decimal Amount,
    Guid PaidByParticipantId,
    bool SplitEqually = true
);

public record UpdateExpenseRequest(
    string Description,
    string Category,
    decimal Amount,
    Guid PaidByParticipantId,
    bool SplitEqually
);

public record ExpenseDto(
    Guid Id,
    string Description,
    string Category,
    decimal Amount,
    ExpenseStatus Status,
    Guid PaidByParticipantId,
    string PaidByName,
    bool SplitEqually,
    DateTime CreatedAt,
    DateTime? PaidAt
);

/// <summary>Saldo entre dois participantes: quem deve pra quem, gerado a partir das despesas.</summary>
public record DebtDto(
    Guid FromParticipantId,
    string FromName,
    Guid ToParticipantId,
    string ToName,
    decimal Amount
);