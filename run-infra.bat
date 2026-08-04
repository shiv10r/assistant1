@echo off
cd /d "%~dp0LuxInfra"
dotnet build -t:Run -f net10.0-windows10.0.19041.0
