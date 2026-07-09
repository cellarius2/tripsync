using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripSync.API.DTOs;
using TripSync.API.Services.Interfaces;

namespace TripSync.API.Controllers;

[ApiController]
[Authorize]
public class VotesController : ControllerBase
{
    private readonly IVoteService _voteService;

    public VotesController(IVoteService voteService)
    {
        _voteService = voteService;
    }

    [HttpGet("api/trips/{tripId:guid}/polls")]
    public async Task<ActionResult<List<VotePollDto>>> GetPolls(Guid tripId)
    {
        var polls = await _voteService.GetPollsAsync(tripId, GetUserId());
        return Ok(polls);
    }

    [HttpPost("api/trips/{tripId:guid}/polls")]
    public async Task<ActionResult<VotePollDto>> CreatePoll(
        Guid tripId,
        CreateVotePollRequest request)
    {
        var poll = await _voteService.CreatePollAsync(
            tripId,
            GetUserId(),
            request
        );

        return Ok(poll);
    }

    [HttpPost("api/polls/{pollId:guid}/vote")]
    public async Task<ActionResult<VotePollDto>> Vote(
        Guid pollId,
        VoteRequest request)
    {
        var poll = await _voteService.CastVoteAsync(
            pollId,
            GetUserId(),
            request
        );

        return Ok(poll);
    }

    [HttpPost("api/polls/{pollId:guid}/close")]
    public async Task<ActionResult<VotePollDto>> ClosePoll(Guid pollId)
    {
        var poll = await _voteService.ClosePollAsync(
            pollId,
            GetUserId()
        );

        return Ok(poll);
    }

    [HttpDelete("api/polls/{pollId:guid}")]
    public async Task<IActionResult> DeletePoll(Guid pollId)
    {
        var deleted = await _voteService.DeletePollAsync(
            pollId,
            GetUserId()
        );

        if (!deleted)
            return NotFound(new { message = "Votação não encontrada." });

        return NoContent();
    }

    private Guid GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (value is null)
            throw new Exception("Usuário não autenticado.");

        return Guid.Parse(value);
    }
}
