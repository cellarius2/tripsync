using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripSync.API.DTOs;
using TripSync.API.Services.Interfaces;

namespace TripSync.API.Controllers;

[ApiController]
[Authorize]
public class TripDocumentController : ControllerBase
{
    private readonly ITripDocumentService _service;

    public TripDocumentController(ITripDocumentService service)
    {
        _service = service;
    }

    [HttpGet("api/trips/{tripId:guid}/documents")]
    public async Task<ActionResult<List<ParticipantDocumentsDto>>> GetDocuments(Guid tripId)
    {
        var documents = await _service.GetDocumentsAsync(tripId, GetUserId());
        return Ok(documents);
    }

    [HttpGet("api/trips/{tripId:guid}/documents/summary")]
    public async Task<ActionResult<DocumentSummaryDto>> GetSummary(Guid tripId)
    {
        var summary = await _service.GetSummaryAsync(tripId, GetUserId());
        return Ok(summary);
    }

    [HttpPost("api/trips/{tripId:guid}/documents")]
    public async Task<ActionResult<List<ParticipantDocumentsDto>>> Create(Guid tripId, CreateTripDocumentRequest request)
    {
        var documents = await _service.CreateCustomDocumentAsync(tripId, GetUserId(), request);
        return Ok(documents);
    }

    [HttpPatch("api/trips/{tripId:guid}/documents/{documentId:guid}/toggle")]
    public async Task<ActionResult<TripDocumentDto>> Toggle(Guid tripId, Guid documentId)
    {
        var document = await _service.ToggleStatusAsync(tripId, documentId, GetUserId());
        return Ok(document);
    }

    [HttpDelete("api/trips/{tripId:guid}/documents/{documentId:guid}")]
    public async Task<IActionResult> Delete(Guid tripId, Guid documentId)
    {
        try
        {
            await _service.DeleteDocumentAsync(tripId, documentId, GetUserId());
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    private Guid GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (value is null)
            throw new Exception("Usuário não autenticado.");

        return Guid.Parse(value);
    }
}
