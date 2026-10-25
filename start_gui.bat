@echo off
title Mumbai UHI AI Platform
echo =================================================================
echo   MUMBAI URBAN HEAT ISLAND (UHI) AI CLIMATE PLATFORM
echo   AI-Driven 30m Downscaling and Real-Time Intervention Simulator
echo =================================================================
echo.
if exist .venv\Scripts\python.exe (
    .venv\Scripts\python.exe run_platform.py
) else (
    python run_platform.py
)
pause
