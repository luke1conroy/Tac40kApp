using CombatProbabilityLab.Core;

var builder = WebApplication.CreateBuilder(args);
var allowedOrigins = builder.Configuration["CORS_ALLOWED_ORIGINS"]?
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    ?? ["http://localhost:5173", "http://127.0.0.1:5173"];
builder.Services.AddCors(options => options.AddPolicy("web", policy => policy
    .WithOrigins(allowedOrigins)
    .WithMethods("POST", "GET")
    .WithHeaders("Content-Type")));

var app = builder.Build();
app.UseCors("web");
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapPost("/api/analyse", (CombatRequest? request) =>
{
    if (request is null) return Results.BadRequest(new { error = "A combat request is required." });
    try
    {
        return Results.Ok(CombatCalculator.Analyse(request));
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
});
app.Run();
