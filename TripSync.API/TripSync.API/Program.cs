using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using TripSync.API.Data;
using TripSync.API.Hubs;
using TripSync.API.Services;
using TripSync.API.Services.Implementations;
using TripSync.API.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

const string CorsPolicyName = "TripSyncFrontend";

// ---- Configuração JWT ----
// Aceita tanto Jwt:Key quanto JwtKey, porque no Railway você está usando JwtKey.
var jwtSettings = new JwtSettings();
builder.Configuration.GetSection("Jwt").Bind(jwtSettings);

jwtSettings.Key = builder.Configuration["JwtKey"]
    ?? builder.Configuration["Jwt:Key"]
    ?? jwtSettings.Key;

jwtSettings.Issuer = builder.Configuration["Jwt:Issuer"]
    ?? jwtSettings.Issuer;

jwtSettings.Audience = builder.Configuration["Jwt:Audience"]
    ?? jwtSettings.Audience;

if (string.IsNullOrWhiteSpace(jwtSettings.Key))
{
    throw new InvalidOperationException("JWT Key não configurada. Configure Jwt__Key ou JwtKey nas variáveis de ambiente.");
}

builder.Services.Configure<JwtSettings>(options =>
{
    builder.Configuration.GetSection("Jwt").Bind(options);

    options.Key = builder.Configuration["JwtKey"]
        ?? builder.Configuration["Jwt:Key"]
        ?? options.Key;

    options.Issuer = builder.Configuration["Jwt:Issuer"]
        ?? options.Issuer;

    options.Audience = builder.Configuration["Jwt:Audience"]
        ?? options.Audience;
});

// ---- Banco de dados ----
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("ConnectionStrings__DefaultConnection não configurada.");
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// ---- Serviços ----
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<TripService>();
builder.Services.AddScoped<ChecklistService>();
builder.Services.AddScoped<ExpenseService>();
builder.Services.AddScoped<NotificationService>();

builder.Services.AddScoped<ITripDocumentService, TripDocumentService>();
builder.Services.AddScoped<IDocumentTemplateService, DocumentTemplateService>();

builder.Services.AddScoped<ITripDecisionService, TripDecisionService>();
builder.Services.AddScoped<IVoteService, VoteService>();

builder.Services.AddScoped<IFinancialPlanningService, FinancialPlanningService>();
builder.Services.AddScoped<IAiPlanningService, AiPlanningService>();

// ---- CORS ----
// Continua lendo Cors:AllowedOrigins, mas também aceita qualquer domínio vercel.app.
// Isso resolve os previews da Vercel e evita quebrar por causa de barra final.
var configuredOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>()?
    .Select(origin => origin.TrimEnd('/'))
    .ToArray() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicyName, policy =>
    {
        policy
            .SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrWhiteSpace(origin))
                    return false;

                origin = origin.TrimEnd('/');

                if (configuredOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase))
                    return true;

                if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                    return false;

                return uri.Host.Equals("trip-sync-cellarius.vercel.app", StringComparison.OrdinalIgnoreCase)
                    || uri.Host.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase)
                    || uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase);
            })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ---- Autenticação JWT ----
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key))
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/trip"))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// ---- Controllers, Swagger, SignalR ----
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "TripSync.API",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Digite: Bearer {seu token}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddSignalR();

var app = builder.Build();

// ---- Pipeline ----
app.UseSwagger();
app.UseSwaggerUI();

// Em Railway/Vercel, o HTTPS já fica na borda/proxy.
// Isso evita problemas de redirect no preflight CORS.
// app.UseHttpsRedirection();

app.UseRouting();

app.UseCors(CorsPolicyName);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<TripHub>("/hubs/trip");

app.MapGet("/", () => Results.Ok(new
{
    name = "TripSync API",
    status = "online",
    environment = app.Environment.EnvironmentName
}));

app.MapGet("/health", () => Results.Ok("healthy"));

app.Run();