# Contributing

This project is **not actively maintained**. The author may not respond to issues or pull requests. You are welcome to fork and develop your own version under the MIT licence. See [PROJECT_STATUS.md](PROJECT_STATUS.md).

Please use a small PR for one specific improvement. Keep the probability engine deterministic, add tests for changes to maths, run the test suite before submitting, and explain any changed assumptions. UI improvements should remain usable on mobile.

**Rights and safety:** do not propose adding game-publisher artwork, proprietary game text, copied data tables, hidden credentials, private source code or material from a repository you do not have rights to redistribute. Use fictional examples unless you can demonstrate appropriate permissions.

Opening a PR does not guarantee that it will be reviewed or merged.

For changes to containerization, use `docker compose up --build -d` and run `python3 scripts/smoke_containers.py` before opening a PR. The CI workflow also verifies the real composed API/React application on every PR and only publishes GHCR images from successful `main` runs. See [docs/CONTAINERS.md](docs/CONTAINERS.md).
