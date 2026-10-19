@echo off
rem Duplo clique aqui. Abre o instalador do Heimdall (instalar\instalar.ps1) sem precisar digitar comando.
rem Se o Windows avisar "Windows protegeu o computador", clique em "Mais informacoes" e depois "Executar assim mesmo".
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0instalar\instalar.ps1"
echo.
pause
