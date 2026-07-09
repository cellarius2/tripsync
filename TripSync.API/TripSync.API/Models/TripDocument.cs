using TripSync.API.Enums;

namespace TripSync.API.Models;

public enum DocumentStatus
{
    Pending = 0,
    Submitted = 1,
    Approved = 2
}

public class TripDocument
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TripParticipantId { get; set; }
    public TripParticipant? TripParticipant { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? Category { get; set; }

    public bool IsRequired { get; set; } = true;

    public bool IsDefault { get; set; } = true;

    public TripType TripType { get; set; }

    public DocumentStatus Status { get; set; } = DocumentStatus.Pending;

    public DateTime? SubmittedAt { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
