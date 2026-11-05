using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using CombatProbabilityLab.Core;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace CombatProbabilityLab.Tests;

public sealed class ApiIntegrationTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    private static CombatRequest Basic(int attacks = 1) =>
        new(new AttackInput(attacks, 4, 4, 0, 1),
            new DefenderInput(4, 7, null, 1, 1));

    [Fact]
    public async Task HealthEndpoint_PreservesRouteAndJsonContract()
    {
        using var client = factory.CreateClient();
        using var response = await client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal("ok", json.RootElement.GetProperty("status").GetString());
    }

    [Fact]
    public async Task AnalyseEndpoint_PreservesRouteAndResultJsonContract()
    {
        using var client = factory.CreateClient();
        using var response = await client.PostAsJsonAsync("/api/analyse", Basic());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal(0.25d, json.RootElement.GetProperty("expectedCasualties").GetDouble(), 10);
        Assert.Equal(0.25d, json.RootElement.GetProperty("wipeProbability").GetDouble(), 10);
        Assert.Equal(2, json.RootElement.GetProperty("casualtyDistribution").GetArrayLength());
    }

    [Fact]
    public async Task AnalyseEndpoint_RejectsNullBodyWithOriginalErrorContract()
    {
        using var client = factory.CreateClient();
        using var response = await client.PostAsJsonAsync("/api/analyse", (CombatRequest?)null);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal("A combat request is required.", json.RootElement.GetProperty("error").GetString());
    }

    [Fact]
    public async Task AnalyseEndpoint_RejectsInvalidInputWithOriginalErrorContract()
    {
        using var client = factory.CreateClient();
        using var response = await client.PostAsJsonAsync("/api/analyse", Basic(attacks: 201));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Contains("Attacks must be between", json.RootElement.GetProperty("error").GetString());
    }

    [Fact]
    public async Task DevelopmentOpenApi_DescribesBothControllerRoutes()
    {
        using var client = factory
            .WithWebHostBuilder(builder => builder.UseEnvironment("Development"))
            .CreateClient();

        using var response = await client.GetAsync("/openapi/v1.json");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var document = await response.Content.ReadAsStringAsync();
        Assert.Contains("/health", document);
        Assert.Contains("/api/analyse", document);
    }
}
