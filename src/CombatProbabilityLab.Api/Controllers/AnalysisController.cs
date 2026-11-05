using CombatProbabilityLab.Api.Contracts;
using CombatProbabilityLab.Api.Services;
using CombatProbabilityLab.Core;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace CombatProbabilityLab.Api.Controllers;

[ApiController]
[Route("api/analyse")]
public sealed class AnalysisController(ICombatAnalysisService analysisService) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(CombatResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiError), StatusCodes.Status400BadRequest)]
    public ActionResult<CombatResult> Analyse(
        [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] CombatRequest? request)
    {
        if (request is null)
        {
            return BadRequest(new ApiError("A combat request is required."));
        }

        try
        {
            return Ok(analysisService.Analyse(request));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ApiError(ex.Message));
        }
    }
}
