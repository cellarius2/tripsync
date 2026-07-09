using Microsoft.EntityFrameworkCore;
using TripSync.API.Models;

namespace TripSync.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Trip> Trips => Set<Trip>();
    public DbSet<TripParticipant> TripParticipants => Set<TripParticipant>();

    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<ChecklistItem> ChecklistItems => Set<ChecklistItem>();
    public DbSet<TripDocument> TripDocuments => Set<TripDocument>();

    public DbSet<VotePoll> VotePolls => Set<VotePoll>();
    public DbSet<VoteOption> VoteOptions => Set<VoteOption>();
    public DbSet<Vote> Votes => Set<Vote>();

    public DbSet<TripDecision> TripDecisions => Set<TripDecision>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<TripActivity> TripActivities => Set<TripActivity>();

    public DbSet<TravelBudget> TravelBudgets => Set<TravelBudget>();
    public DbSet<ParticipantSaving> ParticipantSavings => Set<ParticipantSaving>();
    public DbSet<SavingHistory> SavingHistories => Set<SavingHistory>();

}
