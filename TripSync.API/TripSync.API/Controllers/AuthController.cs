using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TripSync.API.Data;
using TripSync.API.DTOs;
using TripSync.API.Models;
using TripSync.API.Services;

namespace TripSync.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TokenService _tokenService;

    private static readonly string[] AvatarPalette =
    {
        "#7A102A", "#520B1B", "#B85C9E", "#5B7FDB", "#3FA9A0", "#E8B94D"
    };

    public AuthController(AppDbContext db, TokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Nome, e-mail e senha são obrigatórios." });
        }

        if (request.Password.Length < 6)
            return BadRequest(new { message = "A senha deve ter no mínimo 6 caracteres." });

        if (!string.IsNullOrWhiteSpace(request.ConfirmPassword) && request.Password != request.ConfirmPassword)
            return BadRequest(new { message = "A confirmação de senha não confere." });

        var email = request.Email.Trim().ToLowerInvariant();
        var exists = await _db.Users.AnyAsync(u => u.Email == email);

        if (exists)
            return Conflict(new { message = "Já existe uma conta com esse e-mail." });

        var now = DateTime.UtcNow;

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            AvatarColor = AvatarPalette[Random.Shared.Next(AvatarPalette.Length)],
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = _tokenService.GenerateToken(user);

        return Ok(new AuthResponse(token, MapUser(user)));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "E-mail e senha são obrigatórios." });

        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "E-mail ou senha inválidos." });

        var token = _tokenService.GenerateToken(user);

        return Ok(new AuthResponse(token, MapUser(user)));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> Me()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdValue, out var userId))
            return Unauthorized(new { message = "Token inválido." });

        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user is null)
            return Unauthorized(new { message = "Usuário não encontrado." });

        return Ok(MapUser(user));
    }

    [Authorize]
    [HttpPatch("me/avatar")]
    public async Task<ActionResult<UserDto>> UpdateAvatar(UpdateAvatarRequest request)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdValue, out var userId))
            return Unauthorized(new { message = "Token inválido." });

        if (string.IsNullOrWhiteSpace(request.AvatarUrl))
            return BadRequest(new { message = "AvatarUrl é obrigatório." });

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);

        if (user is null)
            return Unauthorized(new { message = "Usuário não encontrado." });

        user.AvatarUrl = request.AvatarUrl.Trim();

        if (!string.IsNullOrWhiteSpace(request.AvatarColor))
            user.AvatarColor = request.AvatarColor.Trim();

        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(MapUser(user));
    }

    private static UserDto MapUser(User user) =>
        new(user.Id, user.Name, user.Email, user.AvatarUrl, user.AvatarColor);
}

public class UpdateAvatarRequest
{
    public string AvatarUrl { get; set; } = string.Empty;
    public string? AvatarColor { get; set; }
}