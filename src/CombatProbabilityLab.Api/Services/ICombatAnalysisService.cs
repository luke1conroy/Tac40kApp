using CombatProbabilityLab.Core;

namespace CombatProbabilityLab.Api.Services;

public interface ICombatAnalysisService
{
    CombatResult Analyse(CombatRequest request);
}
