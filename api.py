"""FastAPI implementation for CTF Orchestrator."""

import os
from typing import Optional
from fastapi import FastAPI, Header, HTTPException, Depends, status
from fastapi.security import APIKeyHeader
from pydantic import BaseModel

from src.scripts.cli.base import get_services
from src.scripts.cli.lifecycle import _stop_challenge_completely, _start_with_fallback

app = FastAPI(title="ctfc API", description="API for CTF Challenge Orchestration")

# Security setup
API_KEY_NAME = "X-CTFC-Token"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

def get_api_token():
    # Load from environment variable CTFC_API_TOKEN
    return os.getenv("CTFC_API_TOKEN", "default_secret_token_change_me")

async def verify_token(api_key: str = Depends(api_key_header)):
    expected_token = get_api_token()
    if not api_key or api_key != expected_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API Token",
        )
    return api_key

@app.get("/")
async def root():
    return {"message": "ctfc API is running", "status": "ok"}

@app.get("/challenges", dependencies=[Depends(verify_token)])
async def list_challenges():
    _, challenge_service, _, _ = get_services()
    challenges = challenge_service.list_challenges()
    return [
        {
            "name": c.name,
            "type": c.service_type,
            "port": c.service_port,
            "path": c.path,
            "enabled": c.enabled
        } for c in challenges
    ]

@app.get("/status", dependencies=[Depends(verify_token)])
async def get_all_status():
    config, challenge_service, runtime_service, export_manager = get_services()
    challenges = challenge_service.list_challenges()

    results = []
    for c in challenges:
        runtime = runtime_service.status(c.name)
        exports = export_manager.list_exports(c.name)
        cooldown = runtime_service.check_restart_cooldown(c.name)

        results.append({
            "name": c.name,
            "status": runtime.status,
            "container_id": runtime.container_id,
            "expires_at": runtime.expires_at.isoformat() if runtime.expires_at else None,
            "restart_cooldown": cooldown or 0,
            "exports": [
                {
                    "provider": e["provider"],
                    "endpoint": e["endpoint"],
                    "status": e["status"],
                    "pid": e["pid"]
                } for e in exports
            ]
        })
    return results

@app.get("/inspect/{name}", dependencies=[Depends(verify_token)])
async def inspect_challenge(name: str):
    config, challenge_service, runtime_service, export_manager = get_services()
    challenge = challenge_service.get_challenge(name)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    runtime = runtime_service.status(name)
    exports = export_manager.list_exports(name, check_health=True)

    return {
        "challenge": {
            "name": challenge.name,
            "path": challenge.path,
            "port": challenge.service_port,
            "type": challenge.service_type,
            "enabled": challenge.enabled,
            "created_at": challenge.created_at.isoformat() if challenge.created_at else None
        },
        "runtime": {
            "status": runtime.status,
            "container_id": runtime.container_id,
            "started_at": runtime.started_at.isoformat() if runtime.started_at else None,
            "expires_at": runtime.expires_at.isoformat() if runtime.expires_at else None,
            "restart_cooldown": runtime_service.check_restart_cooldown(name) or 0
        },
        "exports": exports
    }

@app.post("/up/{name}", dependencies=[Depends(verify_token)])
async def up_challenge(name: str):
    try:
        config, challenge_service, runtime_service, export_manager = get_services()
        challenge = challenge_service.get_challenge(name)
        if not challenge:
            raise HTTPException(status_code=404, detail="Challenge not found")

        runtime_service.start(name)
        # Re-fetch challenge for updated data
        challenge = challenge_service.get_challenge(name)
        provider, endpoint = _start_with_fallback(export_manager, name, challenge)

        return {
            "message": f"Challenge {name} is up",
            "provider": provider,
            "endpoint": endpoint
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/down/{name}", dependencies=[Depends(verify_token)])
async def down_challenge(name: str):
    try:
        config, challenge_service, runtime_service, export_manager = get_services()
        _stop_challenge_completely(name, challenge_service, runtime_service, export_manager)
        return {"message": f"Challenge {name} stopped"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/restart/{name}", dependencies=[Depends(verify_token)])
async def restart_challenge(name: str, container: bool = False, provider: bool = False):
    try:
        config, challenge_service, runtime_service, export_manager = get_services()

        # Cooldown check
        remaining = runtime_service.check_restart_cooldown(name)
        if remaining:
            raise HTTPException(status_code=429, detail=f"Restart cooldown active. Wait {remaining}s")

        # Determine logic
        restart_all = not (container or provider)
        do_container = restart_all or container
        do_provider = restart_all or provider

        challenge = challenge_service.get_challenge(name)
        if not challenge:
            raise HTTPException(status_code=404, detail="Challenge not found")

        # Stop Provider
        if do_provider:
            exports = export_manager.list_exports(name)
            for export in exports:
                export_manager.stop_export(name, export["provider"], challenge.service_port)

        # Restart Container
        if do_container:
            runtime_service.stop(name)
            runtime_service.start(name)
            challenge = challenge_service.get_challenge(name)

        # Start Provider
        if do_provider:
            _start_with_fallback(export_manager, name, challenge)

        # Update cooldown
        runtime_service.update_restart_time(name)

        return {
            "message": f"Challenge {name} restarted",
            "scope": "all" if restart_all else ("container" if container else "provider")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extend/{name}", dependencies=[Depends(verify_token)])
async def extend_challenge(name: str):
    try:
        _, _, runtime_service, _ = get_services()
        runtime = runtime_service.extend_time(name)
        return {
            "message": f"Challenge {name} extended",
            "expires_at": runtime.expires_at.isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
