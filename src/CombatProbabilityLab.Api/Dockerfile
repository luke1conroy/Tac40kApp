# Build from the repository root so the API can reference its Core project.
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore separately so source-only changes can reuse the dependency layer.
COPY src/CombatProbabilityLab.Core/CombatProbabilityLab.Core.csproj src/CombatProbabilityLab.Core/
COPY src/CombatProbabilityLab.Api/CombatProbabilityLab.Api.csproj src/CombatProbabilityLab.Api/
RUN dotnet restore src/CombatProbabilityLab.Api/CombatProbabilityLab.Api.csproj

COPY src/CombatProbabilityLab.Core/ src/CombatProbabilityLab.Core/
COPY src/CombatProbabilityLab.Api/ src/CombatProbabilityLab.Api/
RUN dotnet publish src/CombatProbabilityLab.Api/CombatProbabilityLab.Api.csproj \
    --configuration Release --output /app/publish --no-restore /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

LABEL org.opencontainers.image.source="https://github.com/luke1conroy/Tac40kApp"
LABEL org.opencontainers.image.description="Combat Probability Lab ASP.NET Core API"

COPY --from=build /app/publish .
# The official ASP.NET runtime provides an unprivileged APP_UID.
USER $APP_UID
ENTRYPOINT ["dotnet", "CombatProbabilityLab.Api.dll"]
