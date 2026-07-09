namespace TripSync.API.Models;

public class Vote
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid VotePollId { get; set; }
    public VotePoll? VotePoll { get; set; }

    public Guid VoteOptionId { get; set; }
    public VoteOption? VoteOption { get; set; }

    public Guid UserId { get; set; }
    public User? User { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
