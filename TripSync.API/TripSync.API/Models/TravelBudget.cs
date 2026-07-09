namespace TripSync.API.Models;

public class TravelBudget
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TripId { get; set; }
    public Trip? Trip { get; set; }

    public decimal TransportationAmount { get; set; }

    public decimal AccommodationAmount { get; set; }

    public decimal FoodAmount { get; set; }

    public decimal ActivitiesAmount { get; set; }

    public decimal EmergencyReserveAmount { get; set; }

    public decimal TotalAmount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
