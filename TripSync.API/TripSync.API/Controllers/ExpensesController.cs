using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TripSync.API.Data;
using TripSync.API.DTOs;
using TripSync.API.Hubs;
using TripSync.API.Models;
using TripSync.API.Services;

namespace TripSync.API.Controllers;

[Route("api/trips/{tripId:guid}/expenses")]
public class ExpensesController : BaseApiController
{
    private readonly AppDbContext _db;
    private readonly IHubContext<TripHub> _hub;
    private readonly NotificationService _notificationService;

    public ExpensesController(
        AppDbContext db,
        IHubContext<TripHub> hub,
        NotificationService notificationService)
    {
        _db = db;
        _hub = hub;
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ExpenseDto>>> GetExpenses(Guid tripId)
    {
        if (!await IsParticipant(tripId)) return Forbid();

        var expenses = await _db.Expenses
            .Where(e => e.TripId == tripId)
            .Include(e => e.PaidByParticipant).ThenInclude(p => p!.User)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();

        return Ok(expenses.Select(MapToDto).ToList());
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseDto>> CreateExpense(Guid tripId, CreateExpenseRequest request)
    {
        if (!await IsParticipant(tripId)) return Forbid();

        if (string.IsNullOrWhiteSpace(request.Description) || request.Amount <= 0)
            return BadRequest(new { message = "Descrição e valor válido são obrigatórios." });

        var payerValid = await _db.TripParticipants
            .AnyAsync(p => p.Id == request.PaidByParticipantId && p.TripId == tripId);
        if (!payerValid) return BadRequest(new { message = "Participante pagador inválido." });

        var expense = new Expense
        {
            TripId = tripId,
            Description = request.Description.Trim(),
            Category = request.Category,
            Amount = request.Amount,
            PaidByParticipantId = request.PaidByParticipantId,
            SplitEqually = request.SplitEqually
        };

        _db.Expenses.Add(expense);
        await _db.SaveChangesAsync();
        await NotifyAndSync(tripId, "expense_added", $"Nova despesa adicionada: {expense.Description}.");

        var full = await _db.Expenses
            .Include(e => e.PaidByParticipant).ThenInclude(p => p!.User)
            .FirstAsync(e => e.Id == expense.Id);

        return CreatedAtAction(nameof(GetExpenses), new { tripId }, MapToDto(full));
    }

    [HttpPut("{expenseId:guid}")]
    public async Task<ActionResult<ExpenseDto>> UpdateExpense(Guid tripId, Guid expenseId, UpdateExpenseRequest request)
    {
        if (!await IsParticipant(tripId)) return Forbid();

        var expense = await _db.Expenses
            .Include(e => e.PaidByParticipant).ThenInclude(p => p!.User)
            .FirstOrDefaultAsync(e => e.Id == expenseId && e.TripId == tripId);

        if (expense is null) return NotFound();
        if (request.Amount <= 0) return BadRequest(new { message = "Valor deve ser maior que zero." });

        expense.Description = request.Description.Trim();
        expense.Category = request.Category;
        expense.Amount = request.Amount;
        expense.PaidByParticipantId = request.PaidByParticipantId;
        expense.SplitEqually = request.SplitEqually;

        await _db.SaveChangesAsync();
        await NotifyAndSync(tripId, "expense_updated", $"Despesa atualizada: {expense.Description}.");

        return Ok(MapToDto(expense));
    }

    [HttpDelete("{expenseId:guid}")]
    public async Task<IActionResult> DeleteExpense(Guid tripId, Guid expenseId)
    {
        if (!await IsParticipant(tripId)) return Forbid();

        var expense = await _db.Expenses.FirstOrDefaultAsync(e => e.Id == expenseId && e.TripId == tripId);
        if (expense is null) return NotFound();

        _db.Expenses.Remove(expense);
        await _db.SaveChangesAsync();
        await NotifyAndSync(tripId, "expense_removed", $"Despesa removida: {expense.Description}.");

        return NoContent();
    }

    [HttpPatch("{expenseId:guid}/pay")]
    public async Task<ActionResult<ExpenseDto>> MarkAsPaid(Guid tripId, Guid expenseId)
    {
        if (!await IsParticipant(tripId)) return Forbid();

        var expense = await _db.Expenses
            .Include(e => e.PaidByParticipant).ThenInclude(p => p!.User)
            .FirstOrDefaultAsync(e => e.Id == expenseId && e.TripId == tripId);

        if (expense is null) return NotFound();

        expense.Status = ExpenseStatus.Paga;
        expense.PaidAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await NotifyAndSync(tripId, "expense_paid", $"Despesa paga: {expense.Description}.");

        return Ok(MapToDto(expense));
    }

    // GET /api/trips/{tripId}/expenses/debts — quem deve pra quem, já simplificado
    [HttpGet("debts")]
    public async Task<ActionResult<List<DebtDto>>> GetDebts(Guid tripId)
    {
        if (!await IsParticipant(tripId)) return Forbid();

        var participants = await _db.TripParticipants
            .Where(p => p.TripId == tripId)
            .Include(p => p.User)
            .ToListAsync();

        var paidExpenses = await _db.Expenses
            .Where(e => e.TripId == tripId && e.Status == ExpenseStatus.Paga && e.SplitEqually)
            .ToListAsync();

        if (participants.Count == 0 || paidExpenses.Count == 0)
            return Ok(new List<DebtDto>());

        var totalPaid = paidExpenses.Sum(e => e.Amount);
        var fairShare = totalPaid / participants.Count;

        // saldo positivo = participante tem crédito (pagou mais do que devia)
        var balances = participants.ToDictionary(
            p => p.Id,
            p => paidExpenses.Where(e => e.PaidByParticipantId == p.Id).Sum(e => e.Amount) - fairShare
        );

        var debts = SimplifyDebts(balances, participants.ToDictionary(p => p.Id, p => p.User!.Name));
        return Ok(debts);
    }

    // ---------- helpers ----------

    private static List<DebtDto> SimplifyDebts(Dictionary<Guid, decimal> balances, Dictionary<Guid, string> names)
    {
        var creditors = balances.Where(b => b.Value > 0.01m)
            .Select(b => (Id: b.Key, Amount: b.Value)).OrderByDescending(b => b.Amount).ToList();
        var debtors = balances.Where(b => b.Value < -0.01m)
            .Select(b => (Id: b.Key, Amount: -b.Value)).OrderByDescending(b => b.Amount).ToList();

        var result = new List<DebtDto>();
        int ci = 0, di = 0;

        while (ci < creditors.Count && di < debtors.Count)
        {
            var creditor = creditors[ci];
            var debtor = debtors[di];
            var amount = Math.Min(creditor.Amount, debtor.Amount);

            result.Add(new DebtDto(debtor.Id, names[debtor.Id], creditor.Id, names[creditor.Id],
                Math.Round(amount, 2)));

            creditors[ci] = (creditor.Id, creditor.Amount - amount);
            debtors[di] = (debtor.Id, debtor.Amount - amount);

            if (creditors[ci].Amount <= 0.01m) ci++;
            if (debtors[di].Amount <= 0.01m) di++;
        }

        return result;
    }

    private async Task<bool> IsParticipant(Guid tripId) =>
        await _db.TripParticipants.AnyAsync(p => p.TripId == tripId && p.UserId == CurrentUserId);

    private async Task NotifyAndSync(Guid tripId, string type, string message)
    {
        await _notificationService.NotifyTripAsync(tripId, CurrentUserId, type, message);
        await _hub.Clients.Group(tripId.ToString()).SendAsync("dashboardUpdated", tripId);
    }

    private static ExpenseDto MapToDto(Expense e) => new(
        e.Id, e.Description, e.Category, e.Amount, e.Status,
        e.PaidByParticipantId, e.PaidByParticipant?.User?.Name ?? "—",
        e.SplitEqually, e.CreatedAt, e.PaidAt);
}
