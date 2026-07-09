using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripSync.API.DTOs.Checklists;
using TripSync.API.Services;

namespace TripSync.API.Controllers;

[ApiController]
[Authorize]
[Route("api/trips/{tripId:guid}/checklist")]
public class ChecklistController : ControllerBase
{
    private readonly ChecklistService _service;

    public ChecklistController(ChecklistService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<ChecklistItemDto>>> Get(Guid tripId)
    {
        return Ok(await _service.GetItemsAsync(tripId, GetUserId()));
    }

    [HttpPost]
    public async Task<ActionResult<ChecklistItemDto>> Create(Guid tripId, CreateChecklistItemRequest request)
    {
        var item = await _service.CreateAsync(tripId, GetUserId(), request);
        return Ok(item);
    }

    [HttpPatch("{itemId:guid}/toggle")]
    public async Task<ActionResult<ChecklistItemDto>> Toggle(Guid tripId, Guid itemId)
    {
        return Ok(await _service.ToggleAsync(tripId, GetUserId(), itemId));
    }

    [HttpPut("{itemId:guid}")]
    public async Task<ActionResult<ChecklistItemDto>> Update(
        Guid tripId,
        Guid itemId,
        UpdateChecklistItemRequest request)
    {
        return Ok(await _service.UpdateAsync(tripId, GetUserId(), itemId, request));
    }

    [HttpDelete("{itemId:guid}")]
    public async Task<IActionResult> Delete(Guid tripId, Guid itemId)
    {
        await _service.DeleteAsync(tripId, GetUserId(), itemId);
        return NoContent();
    }

    private Guid GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(value!);
    }
}
