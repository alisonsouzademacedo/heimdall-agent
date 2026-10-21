@echo off
rem Abre o Docker Desktop FORA do app Claude e repara o engine.sock preso se precisar (LICOES.md, 2026-10-20). So ASCII.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0docker-fora.ps1" -SemPausa
if errorlevel 1 pause
