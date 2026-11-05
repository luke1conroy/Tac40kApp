# Running and publishing Combat Probability Lab containers

This repository builds two **Linux** images, one for the .NET 10 API and one for the React/Vite frontend. The frontend is compiled to static files, served by unprivileged Nginx, and proxies requests to the API over a private Docker Compose network. **GitHub Container Registry (GHCR) stores images; it does not run a public website.**

## 1. Local Docker Compose workflow

Install Docker Desktop (in Linux container mode on Windows) or Docker Engine with Docker Compose. From the repository root:

```bash
docker compose up --build -d
docker compose ps
```

- Browser UI: http://localhost:5173
- API health: http://localhost:5080/health
- API analysis: POST http://localhost:5080/api/analyse
- Same-origin frontend API: POST http://localhost:5173/api/analyse

`web/nginx.conf` proxies `/api/*` and `/health` to the Compose service named `api`. In this layout `VITE_API_BASE_URL` **must stay unset**: the built-in React client uses relative URLs and therefore avoids cross-origin browser requests. The Nginx proxy only resolves the name `api` when both containers share the Compose network.

```bash
docker compose logs -f                  # live logs
python3 scripts/smoke_containers.py     # health + HTML + real analysis through proxy
docker compose up --build -d            # rebuild after source changes
docker compose down                     # stop and remove containers
```

The containers listen internally on port 8080; Compose binds **host** ports 5173 and 5080 to `127.0.0.1` only (not the LAN). This is a production-style build, **not** a hot-reloading Vite/.NET development environment; the native development commands in README.md remain available.

## 2. What each Dockerfile does

| File | Builder | Runtime | Purpose |
| --- | --- | --- | --- |
| `src/CombatProbabilityLab.Api/Dockerfile` | .NET 10 SDK | .NET 10 ASP.NET runtime, unprivileged user | Restore, publish and run the MVC API |
| `web/Dockerfile` | Node 22 Alpine | Unprivileged Nginx Alpine | Install frontend dependencies in Linux, build React assets and serve them |
| `web/nginx.conf` | — | Nginx | Forward API requests and serve the SPA |
| `.dockerignore` | — | — | Exclude dependency caches, credentials and unrelated files from builds |
| `compose.yaml` | — | — | Build and run local images together |
| `compose.ghcr.yaml` | — | — | Pull and run published prebuilt images together |

No Windows `node_modules` folder is copied into Linux images; the frontend builder installs dependencies itself. This avoids host-specific native Rollup dependency problems.

## 3. CI checks and GHCR publishing

The existing `.github/workflows/ci.yml` now has a `containers` job that depends on successful xUnit, Vite and publication-boundary checks. It:

1. Builds both images from the current commit.
2. Starts the app with Compose. The CI build uses `--provenance=false` when creating Docker-local images to avoid pushing a local attestation-bearing image index to GHCR; it does not change application source or runtime behavior.
3. Runs `scripts/smoke_containers.py` against API health, React HTML, direct analysis and the Nginx reverse proxy.
4. Stops the containers even when checks fail.
5. **Only on successful pushes to `main`**, logs in to GHCR using the automatic `GITHUB_TOKEN` and pushes both images.

Pull requests build and smoke-test containers **without publishing**. The job grants `contents: read` and `packages: write` for publishing; there is no requirement to store a PAT or Docker password as a repository secret.

When the first successful main-branch run publishes packages, they will be available at:

- `ghcr.io/luke1conroy/tac40k-api:latest`
- `ghcr.io/luke1conroy/tac40k-web:latest`

The workflow also publishes a **commit-specific** image for each build, tagged `sha-<first-12-characters-of-commit-SHA>`. Use a matching pair of SHA tags instead of `latest` for repeatable deployments.

The Dockerfiles include an `org.opencontainers.image.source` label pointing to this public repository. If this project is forked, update the labels and published package names to match the fork.

### Package permissions and first-time publication

Visit your GitHub profile's **Packages** section after the first successful main-branch build. GitHub may create packages as **private**, even when the repository is public. Use the package settings to change visibility to public if anonymous pulls are desired. Organization/repository package access settings can also affect whether the workflow may publish a package of the same name.

If the workflow reports permission denied, confirm that Actions is allowed to create packages for this repository and that any pre-existing GHCR package grants the repository appropriate Actions access. Do not add personal access tokens to source control.

## 4. Run the published images on another computer

**After** they have been published, from a checkout containing `compose.ghcr.yaml`:

```bash
docker compose -f compose.ghcr.yaml pull
docker compose -f compose.ghcr.yaml up -d
```

Then open http://localhost:5173. To stop:

```bash
docker compose -f compose.ghcr.yaml down
```

For private packages, log in with a GitHub token that has `read:packages` permission, passed securely via `docker login ghcr.io --username YOUR_USERNAME --password-stdin`. A public GHCR package can be pulled anonymously. Never paste tokens into Compose files or commit them.

If you use SHA tags, edit **both** image tags in `compose.ghcr.yaml` to the same published commit tag before pulling. Merely pushing code to a branch does not publish those images.

## 5. Troubleshooting and deploying further

- **Port in use:** Stop the conflicting local process, or change the *host* port in Compose (left of `:8080`).
- **Frontend shows a gateway error:** Check `docker compose logs web api`; the Compose `api` service must be running and reachable from Nginx.
- **Docker daemon unavailable:** Start Docker Desktop, ensure Linux-container mode is selected and retry `docker compose version`.
- **Frontend changes not showing:** Rebuild with `docker compose up --build -d`. This is a static production build, so editing React source does not hot reload.
- **GHCR package not found or push denied:** It is not created until a successful `main` workflow run; private visibility also requires a login. If login succeeds but push is denied, check that the package is linked to this repository and grants it **Manage Actions access → Write**. The `packages: write` job permission alone cannot override another package's access controls.
- **Tests fail:** Inspect the failing GitHub Actions job and `docker compose logs`; CI deliberately never publishes untested images.

For a *publicly accessible* deployment, supply proper TLS/HTTPS, DNS, rate limiting and deployment secrets outside this repository. The Nginx configuration assumes the API container's hostname is `api` on the same Docker network; a separate managed hosting service needs an appropriate reverse-proxy upstream or separately configured API origin/CORS. An image in GHCR is **not** itself a hosted application.

This repository remains the independently licensed fictional demonstration described in README.md and NOTICE.md; do not introduce third-party game assets, licences or private-project infrastructure merely to make an image.
