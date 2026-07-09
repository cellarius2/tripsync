namespace TripSync.API.Models;

public class TripActivity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TripId { get; set; }
    public Trip? Trip { get; set; }

    public string Type { get; set; } = string.Empty;

    public Guid? ActorUserId { get; set; }
    public User? ActorUser { get; set; }

    public string? ActorName { get; set; }

    public Guid? TargetUserId { get; set; }
    public User? TargetUser { get; set; }

    public string? TargetUserName { get; set; }

    public string Message { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
