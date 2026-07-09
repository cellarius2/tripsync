using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripSync.API.DTOs.Trips;
using TripSync.API.Services;

namespace TripSync.API.Controllers;

[ApiController]
[Authorize]
[Route("api/trips")]
public class TripsController : ControllerBase
{
    private readonly TripService _tripService;

    public TripsController(TripService tripService)
    {
        _tripService = tripService;
    }

    private Guid GetUserId()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (id is null)
            throw new Exception("Usuário não autenticado.");

        return Guid.Parse(id);
    }

    // =====================================================
    // GET api/trips
    // =====================================================
    [HttpGet]
    public async Task<ActionResult<List<TripSummaryDto>>> GetMyTrips()
    {
        var trips = await _tripService.GetUserTripsAsync(GetUserId());

        return Ok(trips);
    }

    // =====================================================
    // GET api/trips/{id}
    // =====================================================
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TripDetailsDto>> Get(Guid id)
    {
        var trip = await _tripService.GetTripAsync(id);

        return Ok(trip);
    }

    // =====================================================
    // POST api/trips
    // =====================================================
    [HttpPost]
    public async Task<ActionResult<TripSummaryDto>> Create(CreateTripRequest request)
    {
        var trip = await _tripService.CreateTripAsync(
            GetUserId(),
            request);

        return Ok(trip);
    }

    // =====================================================
    // POST api/trips/join
    // =====================================================
    [HttpPost("join")]
    public async Task<IActionResult> Join(JoinTripRequest request)
    {
        await _tripService.JoinTripAsync(
            GetUserId(),
            request);

        return Ok();
    }

    // =====================================================
    // GET api/trips/{id}/dashboard
    // =====================================================
    [HttpGet("{id:guid}/dashboard")]
    public async Task<ActionResult<TripSummaryDto>> Dashboard(Guid id)
    {
        var dashboard = await _tripService.GetDashboardAsync(id);

        return Ok(dashboard);
    }

    // =====================================================
    // PATCH api/trips/{id}/participants/me/avatar
    // =====================================================
    [HttpPatch("{id:guid}/participants/me/avatar")]
    public async Task<ActionResult<TripParticipantDto>> UpdateMyAvatar(
        Guid id,
        UpdateParticipantAvatarRequest request)
    {
        try
        {
            var participant = await _tripService.UpdateParticipantAvatarAsync(
                id,
                GetUserId(),
                request);

            return Ok(participant);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
