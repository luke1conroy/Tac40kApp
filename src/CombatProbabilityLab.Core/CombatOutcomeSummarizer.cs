namespace CombatProbabilityLab.Core;

/// <summary>
/// Derived statistics from an exact casualty distribution. Separate from the attack
/// probability engine so new presentation metrics do not expand its responsibilities.
/// </summary>
internal static class CombatOutcomeSummarizer
{
    internal static CombatOutcomeSummary Summarize(
        double[] casualties,
        int modelCount,
        double expectedRawDamage,
        double expectedAllocatedDamage)
    {
        var expectedCasualties = casualties
            .Select((probability, count) => count * probability)
            .Sum();
        // Array.IndexOf chooses the lower casualty count in a tie.
        var mostLikelyCasualties = Array.IndexOf(casualties, casualties.Max());
        var wipeProbability = casualties[^1];
        var chanceOfAtLeastOneCasualty = 1d - casualties[0];
        var expectedSurvivors = modelCount - expectedCasualties;
        var wastedDamage = Math.Max(0d, expectedRawDamage - expectedAllocatedDamage);
        var distribution = casualties
            .Select((probability, count) => new ProbabilityPoint(count, probability))
            .ToArray();

        return new CombatOutcomeSummary(
            expectedCasualties,
            wipeProbability,
            distribution,
            mostLikelyCasualties,
            chanceOfAtLeastOneCasualty,
            expectedSurvivors,
            wastedDamage);
    }
}

internal sealed record CombatOutcomeSummary(
    double ExpectedCasualties,
    double WipeProbability,
    IReadOnlyList<ProbabilityPoint> CasualtyDistribution,
    int MostLikelyCasualties,
    double AtLeastOneCasualtyProbability,
    double ExpectedSurvivors,
    double ExpectedWastedDamage);
