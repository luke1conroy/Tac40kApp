using CombatProbabilityLab.Api.Services;

var builder = WebApplication.CreateBuilder(args);

var allowedOrigins = builder.Configuration["CORS_ALLOWED_ORIGINS"]?
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    ?? ["http://localhost:5173", "http://127.0.0.1:5173"];

builder.Services.AddCors(options => options.AddPolicy("web", policy => policy
    .WithOrigins(allowedOrigins)
    .WithMethods("POST", "GET")
    .WithHeaders("Content-Type")));

// MVC handles routing and JSON serialization; keep endpoint logic out of Program.cs.
// Retain our { "error": "..." } response contract for invalid analysis requests.
builder.Services.AddControllers().ConfigureApiBehaviorOptions(options =>
    options.SuppressModelStateInvalidFilter = true);
builder.Services.AddScoped<ICombatAnalysisService, CombatAnalysisService>();
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseCors("web");
app.MapControllers();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.Run();

// Allows HTTP integration tests to host the application.
public partial class Program { }
