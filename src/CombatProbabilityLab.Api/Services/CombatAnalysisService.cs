using CombatProbabilityLab.Core;

namespace CombatProbabilityLab.Api.Services;

// Keep the calculator in Core so the HTTP layer remains a thin adapter.
public sealed class CombatAnalysisService : ICombatAnalysisService
{
    public CombatResult Analyse(CombatRequest request) => CombatCalculator.Analyse(request);
}
