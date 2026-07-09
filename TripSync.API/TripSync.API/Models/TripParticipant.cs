using TripSync.API.Enums;

namespace TripSync.API.Models;

public class TripParticipant
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TripId { get; set; }
    public Trip? Trip { get; set; }

    public Guid UserId { get; set; }
    public User? User { get; set; }

    public ParticipantRole Role { get; set; } = ParticipantRole.Member;

    public decimal AmountSaved { get; set; }

    public string? AvatarKey { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    public ICollection<TripDocument> Documents { get; set; } = new List<TripDocument>();

    public ParticipantSaving? Saving { get; set; }
}
