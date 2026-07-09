using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripSync.API.DTOs;
using TripSync.API.Services.Interfaces;

namespace TripSync.API.Controllers;

[ApiController]
[Authorize]
[Route("api/trips/{tripId:guid}/ai")]
public class AiPlanningController : ControllerBase
{
    private readonly IAiPlanningService _service;

    public AiPlanningController(IAiPlanningService service)
    {
        _service = service;
    }

    [HttpPost("planning-suggestions")]
    public async Task<ActionResult<AiPlanningResponse>> GeneratePlanningSuggestions(
        Guid tripId,
        AiPlanningRequest request)
    {
        return Ok(await _service.GeneratePlanningSuggestionsAsync(tripId, GetUserId(), request));
    }

    private Guid GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (value is null)
            throw new Exception("Usuário não autenticado.");

        return Guid.Parse(value);
    }
}
