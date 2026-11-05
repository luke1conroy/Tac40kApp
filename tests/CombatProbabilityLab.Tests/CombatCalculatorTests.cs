using CombatProbabilityLab.Core;
using Xunit;

namespace CombatProbabilityLab.Tests;

public sealed class CombatCalculatorTests
{
    private static CombatRequest Basic(int attacks = 1, int damage = 1, int models = 1, int wounds = 1) =>
        new(new AttackInput(attacks, 4, 4, 0, damage),
            new DefenderInput(4, 7, null, wounds, models));

    [Fact]
    public void SingleAttack_ProducesExactQuarterChanceOfCasualty()
    {
        var result = CombatCalculator.Analyse(Basic());
        Assert.Equal(4, result.WoundOn);
        Assert.Equal(7, result.EffectiveSaveOn);
        Assert.Equal(0.25d, result.UnsavedHitProbability, 10);
        Assert.Equal(0.25d, result.ExpectedCasualties, 10);
        Assert.Equal(0.25d, result.WipeProbability, 10);
        Assert.Equal(0.75d, result.CasualtyDistribution[0].Probability, 10);
        Assert.Equal(0.25d, result.CasualtyDistribution[1].Probability, 10);
        Assert.Equal(0, result.MostLikelyCasualties);
        Assert.Equal(0.25d, result.AtLeastOneCasualtyProbability, 10);
        Assert.Equal(0.75d, result.ExpectedSurvivors, 10);
        Assert.Equal(0d, result.ExpectedWastedDamage, 10);
    }

    [Fact]
    public void OverkillDoesNotSpillToAnotherModel()
    {
        var result = CombatCalculator.Analyse(Basic(damage: 10, models: 3));
        Assert.Equal(0.25d, result.ExpectedCasualties, 10);
        Assert.Equal(0d, result.WipeProbability);
        Assert.Equal(0.25d, result.ExpectedAllocatedDamage, 10);
        Assert.Equal(2.5d, result.ExpectedRawDamage, 10);
        Assert.Equal(2.25d, result.ExpectedWastedDamage, 10);
        Assert.Equal(2.75d, result.ExpectedSurvivors, 10);
    }

    [Fact]
    public void MultipleHitsAccumulateWoundsOnSameModel()
    {
        var result = CombatCalculator.Analyse(Basic(attacks: 2, wounds: 2));
        // Both unsaved hits required; P = (1/4)^2.
        Assert.Equal(0.0625d, result.WipeProbability, 10);
        // An unsaved hit wounds the model, but does not necessarily kill it.
        Assert.Equal(0.0625d, result.AtLeastOneCasualtyProbability, 10);
    }

    [Fact]
    public void NoAttacksGiveAllProbabilityToZeroCasualties()
    {
        var result = CombatCalculator.Analyse(Basic(attacks: 0));
        Assert.Equal(1d, result.CasualtyDistribution[0].Probability);
        Assert.Equal(0d, result.ExpectedRawDamage);
        Assert.Equal(0, result.MostLikelyCasualties);
        Assert.Equal(0d, result.AtLeastOneCasualtyProbability);
        Assert.Equal(1d, result.ExpectedSurvivors);
        Assert.Equal(0d, result.ExpectedWastedDamage);
    }

    [Fact]
    public void HighVolumeDistributionRemainsNormalized()
    {
        var result = CombatCalculator.Analyse(Basic(attacks: 200, models: 50, wounds: 2));
        Assert.Equal(1d, result.CasualtyDistribution.Sum(x => x.Probability), 8);
        Assert.All(result.CasualtyDistribution, x => Assert.InRange(x.Probability, 0d, 1d));
    }

    [Fact]
    public void MostLikelyCasualtiesCanBeNonzeroAndNeedNotEqualRoundedMean()
    {
        var result = CombatCalculator.Analyse(new CombatRequest(
            new AttackInput(1, 2, 10, 0, 1),
            new DefenderInput(2, 7, null, 1, 3)));

        Assert.Equal(1, result.MostLikelyCasualties);
        Assert.Equal(25d / 36d, result.AtLeastOneCasualtyProbability, 10);
        Assert.Equal(3d - 25d / 36d, result.ExpectedSurvivors, 10);
    }

    [Fact]
    public void ExcessAttacksAfterWipeCountAsWastedDamage()
    {
        var result = CombatCalculator.Analyse(Basic(attacks: 2));

        Assert.Equal(0.5d, result.ExpectedRawDamage, 10);
        Assert.Equal(0.4375d, result.ExpectedAllocatedDamage, 10);
        Assert.Equal(0.0625d, result.ExpectedWastedDamage, 10);
        Assert.Equal(result.WipeProbability, result.AtLeastOneCasualtyProbability, 10);
    }

    [Fact]
    public void InvulnerableSaveCanImproveEffectiveSave()
    {
        var result = CombatCalculator.Analyse(new CombatRequest(
            new AttackInput(1, 4, 4, -3, 1),
            new DefenderInput(4, 3, 4, 1, 1)));
        Assert.Equal(4, result.EffectiveSaveOn);
    }

    [Theory]
    [InlineData(8, 4, 2)]
    [InlineData(5, 4, 3)]
    [InlineData(4, 4, 4)]
    [InlineData(3, 4, 5)]
    [InlineData(2, 4, 6)]
    public void StrengthComparisonDeterminesWoundThreshold(int strength, int toughness, int expected)
    {
        var result = CombatCalculator.Analyse(new CombatRequest(
            new AttackInput(1, 4, strength, 0, 1),
            new DefenderInput(toughness, 7, null, 1, 1)));
        Assert.Equal(expected, result.WoundOn);
    }

    [Fact]
    public void InvalidInputsAreRejected()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => CombatCalculator.Analyse(Basic(attacks: 201)));
    }
}
