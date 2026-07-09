using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripSync.API.DTOs;
using TripSync.API.Services;

namespace TripSync.API.Controllers;

[Authorize]
[Route("api/notifications")]
public class NotificationsController : BaseApiController
{
    private readonly NotificationService _notificationService;

    public NotificationsController(NotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<ActionResult<List<NotificationDto>>> GetMine()
    {
        return Ok(await _notificationService.GetForUserAsync(CurrentUserId));
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        await _notificationService.MarkAllAsReadAsync(CurrentUserId);
        return NoContent();
    }
}

[Authorize]
[Route("api/trips/{tripId:guid}/activity")]
public class TripActivityController : BaseApiController
{
    private readonly NotificationService _notificationService;

    public TripActivityController(NotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<ActionResult<List<TripActivityDto>>> Get(Guid tripId)
    {
        try
        {
            return Ok(await _notificationService.GetTripActivityAsync(tripId, CurrentUserId));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
    }
}

[Authorize]
[Route("api/trips/{tripId:guid}/tomatoes")]
public class TomatoesController : BaseApiController
{
    private readonly NotificationService _notificationService;

    public TomatoesController(NotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpPost]
    public async Task<ActionResult<NotificationDto>> Throw(Guid tripId, ThrowTomatoRequest request)
    {
        try
        {
            return Ok(await _notificationService.ThrowTomatoAsync(
                tripId,
                CurrentUserId,
                request.RecipientUserId));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
