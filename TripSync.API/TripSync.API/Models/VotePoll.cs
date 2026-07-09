using TripSync.API.Enums;

namespace TripSync.API.Models;

public class VotePoll
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TripId { get; set; }
    public Trip? Trip { get; set; }

    public string Title { get; set; } = string.Empty;

    public VoteCategory Category { get; set; }

    public Guid CreatedById { get; set; }
    public User? CreatedBy { get; set; }

    public bool IsClosed { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<VoteOption> Options { get; set; } = new List<VoteOption>();
}