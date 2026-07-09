using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripSync.API.DTOs;
using TripSync.API.Services.Interfaces;

namespace TripSync.API.Controllers;

[ApiController]
[Authorize]
public class TripDecisionController : ControllerBase
{
    private readonly ITripDecisionService _service;

    public TripDecisionController(ITripDecisionService service)
    {
        _service = service;
    }

    [HttpGet("api/trips/{tripId:guid}/decisions")]
    public async Task<ActionResult<DecisionSummaryDto>> GetSummary(Guid tripId)
    {
        var result = await _service.GetSummaryAsync(tripId, GetUserId());
        return Ok(result);
    }

    private Guid GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (value is null)
            throw new Exception("Usuário não autenticado.");

        return Guid.Parse(value);
    }
}