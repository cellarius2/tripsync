namespace TripSync.API.Models;

public class SavingHistory
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ParticipantSavingId { get; set; }
    public ParticipantSaving? ParticipantSaving { get; set; }

    public decimal PreviousAmount { get; set; }

    public decimal NewAmount { get; set; }

    public decimal Difference { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
