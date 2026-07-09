using TripSync.API.Enums;

namespace TripSync.API.Models;

public class TripDecision
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TripId { get; set; }
    public Trip? Trip { get; set; }

    public VoteCategory Category { get; set; }

    public string SelectedOptionTitle { get; set; } = string.Empty;

    public Guid? SourcePollId { get; set; }
    public VotePoll? SourcePoll { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}