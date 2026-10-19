#!/usr/bin/env python
"""Unified Platform Runner for Mumbai UHI Platform.

Starts both the FastAPI REST engine (port 8000) and the React Geospatial UI (port 5173).
"""

import os
import sys
import subprocess
import time

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")

def run_all():
    print("=" * 65)
    print("  MUMBAI URBAN HEAT ISLAND (UHI) AI CLIMATE PLATFORM")
    print("  AI-Driven 30m Downscaling & Real-Time Intervention Simulator")
    print("=" * 65)
    
    # 1. Start FastAPI server
    print("\n[1/2] Starting FastAPI Backend on http://localhost:8000 ...")
    api_proc = subprocess.Popen(
        [sys.executable, "run_api.py"],
        cwd=PROJECT_ROOT
    )
    time.sleep(2)
    
    # 2. Start Vite Frontend
    print("\n[2/2] Starting Vite Frontend on http://localhost:5173 ...")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    try:
        frontend_proc = subprocess.Popen(
            [npm_cmd, "run", "dev"],
            cwd=FRONTEND_DIR
        )
        print("\n[OK] Platform services initiated successfully!")
        print("  -> Web GUI Dashboard: http://localhost:5173")
        print("  -> REST API Docs:     http://localhost:8000/docs")
        print("  -> Health Endpoint:   http://localhost:8000/api/health")
        print("\nPress Ctrl+C to terminate both servers.")
        
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down platform servers...")
    finally:
        api_proc.terminate()

if __name__ == "__main__":
    run_all()
