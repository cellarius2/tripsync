namespace TripSync.API.Models;

public class VoteOption
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid VotePollId { get; set; }
    public VotePoll? VotePoll { get; set; }

    public string Title { get; set; } = string.Empty;

    public ICollection<Vote> Votes { get; set; } = new List<Vote>();
}