namespace CombatProbabilityLab.Api.Contracts;

// ASP.NET Core's default camel-case JSON naming preserves the existing API shapes.
public sealed record ApiError(string Error);
public sealed record HealthResponse(string Status);
