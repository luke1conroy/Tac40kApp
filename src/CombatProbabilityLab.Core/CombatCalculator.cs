namespace CombatProbabilityLab.Core;

/// <summary>Generic independent six-sided-dice combat profiles. All example data is fictional.</summary>
public sealed record AttackInput(int Attacks, int HitOn, int Strength, int ArmourPenetration, int Damage);
public sealed record DefenderInput(int Toughness, int ArmourSave, int? InvulnerableSave, int WoundsPerModel, int ModelCount);
public sealed record CombatRequest(AttackInput Attack, DefenderInput Defender);
public sealed record ProbabilityPoint(int Count, double Probability);
public sealed record CombatResult(
    int WoundOn,
    int EffectiveSaveOn,
    double UnsavedHitProbability,
    double ExpectedUnsavedHits,
    double ExpectedRawDamage,
    double ExpectedAllocatedDamage,
    double ExpectedCasualties,
    double WipeProbability,
    IReadOnlyList<ProbabilityPoint> CasualtyDistribution,
    // A modal casualty count is an integer, unlike the average number of casualties.
    int MostLikelyCasualties,
    double AtLeastOneCasualtyProbability,
    double ExpectedSurvivors,
    double ExpectedWastedDamage);

/// <summary>
/// Exact probability model for identical, independent attacks against identical defenders.
/// A successful unsaved attack deals fixed damage to one model; excess damage does not spill.
/// This is a generic teaching example, not a full rules-engine implementation.
/// </summary>
public static class CombatCalculator
{
    public const int MaxAttacks = 200;
    public const int MaxModels = 100;

    public static CombatResult Analyse(CombatRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);
        ArgumentNullException.ThrowIfNull(request.Attack);
        ArgumentNullException.ThrowIfNull(request.Defender);
        var attack = request.Attack;
        var defender = request.Defender;
        Validate(attack, defender);

        var woundOn = attack.Strength >= 2L * defender.Toughness ? 2
            : attack.Strength > defender.Toughness ? 3
            : attack.Strength == defender.Toughness ? 4
            : 2L * attack.Strength <= defender.Toughness ? 6 : 5;
        var armourAfterPenetration = (int)Math.Min(7L, (long)defender.ArmourSave - attack.ArmourPenetration);
        var effectiveSaveOn = Math.Min(armourAfterPenetration, defender.InvulnerableSave ?? 7);

        var chanceToHit = (7d - attack.HitOn) / 6d;
        var chanceToWound = (7d - woundOn) / 6d;
        var chanceToFailSave = effectiveSaveOn == 7 ? 1d : (effectiveSaveOn - 1d) / 6d;
        var unsavedProbability = chanceToHit * chanceToWound * chanceToFailSave;

        var successes = Binomial(attack.Attacks, unsavedProbability);
        var casualties = new double[defender.ModelCount + 1];
        var allocatedExpectation = 0d;
        for (var unsaved = 0; unsaved < successes.Length; unsaved++)
        {
            var (modelsLost, allocated) = ApplyUnsavedAttacks(unsaved, attack.Damage, defender);
            casualties[modelsLost] += successes[unsaved];
            allocatedExpectation += successes[unsaved] * allocated;
        }

        var expectedCasualties = casualties.Select((probability, count) => count * probability).Sum();
        var expectedRawDamage = attack.Attacks * unsavedProbability * attack.Damage;
        // Array.IndexOf chooses the lower casualty count when multiple outcomes tie.
        var mostLikelyCasualties = Array.IndexOf(casualties, casualties.Max());

        return new CombatResult(
            woundOn,
            effectiveSaveOn,
            unsavedProbability,
            attack.Attacks * unsavedProbability,
            expectedRawDamage,
            allocatedExpectation,
            expectedCasualties,
            casualties[^1],
            casualties.Select((probability, count) => new ProbabilityPoint(count, probability)).ToArray(),
            mostLikelyCasualties,
            1d - casualties[0],
            defender.ModelCount - expectedCasualties,
            Math.Max(0d, expectedRawDamage - allocatedExpectation));
    }

    private static void Validate(AttackInput attack, DefenderInput defender)
    {
        if (attack.Attacks is < 0 or > MaxAttacks)
            throw new ArgumentOutOfRangeException(nameof(attack.Attacks), $"Attacks must be between 0 and {MaxAttacks}.");
        if (attack.HitOn is < 2 or > 6) throw new ArgumentOutOfRangeException(nameof(attack.HitOn));
        if (attack.Strength is < 1 or > 1000) throw new ArgumentOutOfRangeException(nameof(attack.Strength));
        if (attack.ArmourPenetration is < -20 or > 0) throw new ArgumentOutOfRangeException(nameof(attack.ArmourPenetration));
        if (attack.Damage is < 1 or > 1000) throw new ArgumentOutOfRangeException(nameof(attack.Damage));
        if (defender.Toughness is < 1 or > 1000) throw new ArgumentOutOfRangeException(nameof(defender.Toughness));
        if (defender.ArmourSave is < 2 or > 7) throw new ArgumentOutOfRangeException(nameof(defender.ArmourSave));
        if (defender.InvulnerableSave is not null and (< 2 or > 6))
            throw new ArgumentOutOfRangeException(nameof(defender.InvulnerableSave));
        if (defender.WoundsPerModel is < 1 or > 1000)
            throw new ArgumentOutOfRangeException(nameof(defender.WoundsPerModel));
        if (defender.ModelCount is < 1 or > MaxModels)
            throw new ArgumentOutOfRangeException(nameof(defender.ModelCount), $"Model count must be between 1 and {MaxModels}.");
    }

    private static (int modelsLost, double allocated) ApplyUnsavedAttacks(int count, int damage, DefenderInput defender)
    {
        var remaining = defender.WoundsPerModel;
        var modelsLost = 0;
        double allocated = 0;
        for (var i = 0; i < count && modelsLost < defender.ModelCount; i++)
        {
            allocated += Math.Min(damage, remaining);
            remaining -= damage;
            if (remaining <= 0)
            {
                modelsLost++;
                remaining = defender.WoundsPerModel;
            }
        }
        return (modelsLost, allocated);
    }

    // Mode-centred recurrence avoids P(0) underflow for larger attack pools.
    private static double[] Binomial(int n, double p)
    {
        var probabilities = new double[n + 1];
        if (n == 0 || p == 0d) { probabilities[0] = 1d; return probabilities; }
        if (p == 1d) { probabilities[n] = 1d; return probabilities; }
        var mode = Math.Min(n, (int)Math.Floor((n + 1d) * p));
        probabilities[mode] = 1d;
        for (var k = mode; k > 0; k--)
            probabilities[k - 1] = probabilities[k] * k / (n - k + 1d) * (1d - p) / p;
        for (var k = mode; k < n; k++)
            probabilities[k + 1] = probabilities[k] * (n - k) / (k + 1d) * p / (1d - p);
        var total = probabilities.Sum();
        for (var k = 0; k <= n; k++) probabilities[k] /= total;
        return probabilities;
    }
}
