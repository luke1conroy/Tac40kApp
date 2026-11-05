using CombatProbabilityLab.Api.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace CombatProbabilityLab.Api.Controllers;

[ApiController]
[Route("health")]
public sealed class HealthController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(HealthResponse), StatusCodes.Status200OK)]
    public ActionResult<HealthResponse> Get() => Ok(new HealthResponse("ok"));
}
