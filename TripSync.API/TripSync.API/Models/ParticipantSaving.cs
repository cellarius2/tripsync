namespace TripSync.API.Models;

public class ParticipantSaving
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TripParticipantId { get; set; }
    public TripParticipant? TripParticipant { get; set; }

    public decimal AmountSaved { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<SavingHistory> History { get; set; } = new List<SavingHistory>();
}
