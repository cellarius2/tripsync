namespace TripSync.API.Models;

public enum ExpenseStatus
{
    Prevista = 0, // despesa prevista/orçada, ainda não paga
    Paga = 1      // despesa já paga
}

public class Expense
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TripId { get; set; }
    public Trip? Trip { get; set; }

    public string Description { get; set; } = string.Empty;

    /// <summary>Categoria da despesa (ex: "Transporte", "Hospedagem", "Visto"), lista varia por tipo de viagem.</summary>
    public string Category { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public ExpenseStatus Status { get; set; } = ExpenseStatus.Prevista;

    /// <summary>Participante que pagou (ou vai pagar) a despesa.</summary>
    public Guid PaidByParticipantId { get; set; }
    public TripParticipant? PaidByParticipant { get; set; }

    /// <summary>Se true, o valor é dividido igualmente entre todos os participantes da viagem.</summary>
    public bool SplitEqually { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PaidAt { get; set; }
}