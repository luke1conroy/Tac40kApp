#!/usr/bin/env python3
"""End-to-end smoke check for a running docker compose application.

Only Python's standard library is needed, on developer machines or Actions.
"""
import json
import math
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

API = "http://127.0.0.1:5080"
WEB = "http://127.0.0.1:5173"

def fetch(url: str, payload: dict | None = None) -> bytes:
    body = json.dumps(payload).encode("utf-8") if payload is not None else None
    headers = {"Content-Type": "application/json"} if body is not None else {}
    request = Request(url, data=body, headers=headers)
    with urlopen(request, timeout=5) as response:
        if response.status != 200:
            raise AssertionError(f"{url} returned HTTP {response.status}")
        return response.read()


def wait_for_api() -> None:
    for attempt in range(30):
        try:
            health = json.loads(fetch(API + "/health"))
            if health.get("status") == "ok":
                return
        except (URLError, HTTPError, TimeoutError, OSError, ValueError):
            pass
        time.sleep(2)
    raise RuntimeError("The API did not become healthy on localhost:5080")


def main() -> None:
    wait_for_api()
    assert b'id="root"' in fetch(WEB + "/"), "React index.html was not served"

    # The real API and Nginx proxy must agree on the same result.
    scenario = {
        "attack": {
            "attacks": 1, "hitOn": 4, "strength": 4,
            "armourPenetration": 0, "damage": 1
        },
        "defender": {
            "toughness": 4, "armourSave": 7, "invulnerableSave": None,
            "woundsPerModel": 1, "modelCount": 1
        }
    }

    direct = json.loads(fetch(API + "/api/analyse", scenario))
    proxied = json.loads(fetch(WEB + "/api/analyse", scenario))
    assert direct == proxied, "The Nginx /api proxy did not preserve API results"
    assert math.isclose(direct["expectedCasualties"], 0.25, abs_tol=1e-10), direct
    assert len(direct["casualtyDistribution"]) == 2, direct
    print("Container smoke check passed: API health, React page, proxy and analysis.")


if __name__ == "__main__":
    main()
