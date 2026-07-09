using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripSync.API.DTOs;
using TripSync.API.Services.Interfaces;

namespace TripSync.API.Controllers;

[ApiController]
[Authorize]
[Route("api/trips/{tripId:guid}/financial")]
public class FinancialPlanningController : ControllerBase
{
    private readonly IFinancialPlanningService _service;

    public FinancialPlanningController(IFinancialPlanningService service)
    {
        _service = service;
    }

    [HttpGet("budget")]
    public async Task<ActionResult<TravelBudgetDto>> GetBudget(Guid tripId)
    {
        return Ok(await _service.GetBudgetAsync(tripId, GetUserId()));
    }

    [HttpPut("budget")]
    public async Task<ActionResult<TravelBudgetDto>> UpdateBudget(
        Guid tripId,
        UpdateTravelBudgetRequest request)
    {
        return Ok(await _service.UpdateBudgetAsync(tripId, GetUserId(), request));
    }

    [HttpGet("summary")]
    public async Task<ActionResult<FinancialSummaryDto>> GetSummary(Guid tripId)
    {
        return Ok(await _service.GetSummaryAsync(tripId, GetUserId()));
    }

    [HttpPut("savings")]
    public async Task<ActionResult<ParticipantSavingProgressDto>> UpdateSavings(
        Guid tripId,
        UpdateParticipantSavingRequest request)
    {
        return Ok(await _service.UpdateParticipantSavingAsync(tripId, GetUserId(), request));
    }

    [HttpGet("progress")]
    public async Task<ActionResult<List<ParticipantSavingProgressDto>>> GetProgress(Guid tripId)
    {
        return Ok(await _service.GetParticipantsProgressAsync(tripId, GetUserId()));
    }

    private Guid GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (value is null)
            throw new Exception("Usuário não autenticado.");

        return Guid.Parse(value);
    }
}
