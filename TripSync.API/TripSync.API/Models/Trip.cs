using System.ComponentModel.DataAnnotations.Schema;
using TripSync.API.Enums;

namespace TripSync.API.Models;

public class Trip
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;

    public string Origin { get; set; } = string.Empty;

    public string Destination { get; set; } = string.Empty;

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public TripType Type { get; set; }

    public TripStatus Status { get; set; } = TripStatus.Planning;

    public decimal EstimatedTotalCost { get; set; }

    public string InviteCode { get; set; } = string.Empty;

    public Guid CreatedById { get; set; }

    public User? CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [NotMapped]
    public int Progress { get; set; }

    [NotMapped]
    public string HealthStatus { get; set; } = string.Empty;

    public ICollection<TripParticipant> Participants { get; set; } = new List<TripParticipant>();

    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();

    public ICollection<ChecklistItem> ChecklistItems { get; set; } = new List<ChecklistItem>();

    public ICollection<VotePoll> VotePolls { get; set; } = new List<VotePoll>();

    public ICollection<TripActivity> Activities { get; set; } = new List<TripActivity>();

    public TravelBudget? TravelBudget { get; set; }
}
