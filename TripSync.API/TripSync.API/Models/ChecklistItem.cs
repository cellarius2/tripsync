namespace TripSync.API.Models;

public class ChecklistItem
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TripId { get; set; }
    public Trip? Trip { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Category { get; set; }

    public bool IsDone { get; set; }

    public Guid? AssignedToParticipantId { get; set; }
    public TripParticipant? AssignedToParticipant { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}
