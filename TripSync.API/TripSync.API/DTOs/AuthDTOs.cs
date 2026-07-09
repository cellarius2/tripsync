namespace TripSync.API.DTOs;

public record RegisterRequest(string Name, string Email, string Password, string? ConfirmPassword);

public record LoginRequest(string Email, string Password);

public record AuthResponse(string Token, UserDto User);

public record UserDto(Guid Id, string Name, string Email, string? AvatarUrl, string? AvatarColor);
