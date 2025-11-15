@echo off
chcp 65001 >nul
title GAMEFLIX - INICIAR SISTEMA COMPLETO
color 0A
cls
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║         🎯 GAMEFLIX - INICIAR SISTEMA COMPLETO                ║
echo ║            Com Nginx Proxy Reverso                            ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo  Este script vai iniciar:
echo.
echo   [1] Backend na porta 3000
echo   [2] Nginx na porta 80 (proxy reverso)
echo.
echo  ⚠️  Execute como ADMINISTRADOR!
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
pause

REM Verificar Admin
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo ⚠️  Solicitando permissões de Administrador...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit
)

cd /d "%~dp0"

echo.
echo ───────────────────────────────────────────────────────────────
echo  [1/2] Iniciando BACKEND (porta 3000)...
echo ───────────────────────────────────────────────────────────────
echo.

start "GAMEFLIX - BACKEND (Porta 3000)" powershell -ExecutionPolicy Bypass -NoExit -File "%~dp0iniciar-backend.ps1"

echo  ✅ Backend iniciando...
echo  ⏳ Aguardando 5 segundos para o backend inicializar...
timeout /t 5 /nobreak >nul

echo.
echo ───────────────────────────────────────────────────────────────
echo  [2/2] Iniciando NGINX (porta 80)...
echo ───────────────────────────────────────────────────────────────
echo.

cd C:\nginx
start "GAMEFLIX - NGINX (Porta 80)" cmd /k "nginx.exe && echo ✅ Nginx iniciado! && echo 🌐 Acesse: http://localhost && echo. && echo ⚠️  NÃO FECHE esta janela! && echo."

timeout /t 3 /nobreak >nul

echo  ✅ Nginx iniciado!
echo.
echo ═══════════════════════════════════════════════════════════════
echo  🎉 SISTEMA INICIADO COM SUCESSO!
echo ═══════════════════════════════════════════════════════════════
echo.
echo  🌐 Acesse agora:
echo.
echo     http://localhost
echo     http://localhost/catalogo
echo.
echo  📊 Endpoints disponíveis:
echo.
echo     Frontend:   http://localhost/
echo     API:        http://localhost/api/*
echo     Health:     http://localhost/health
echo.
echo  ✅ 2 janelas foram abertas:
echo     - Backend (porta 3000)
echo     - Nginx (porta 80)
echo.
echo  ⚠️  NÃO FECHE essas janelas!
echo  🛑 Para parar: Feche as janelas ou pressione Ctrl+C
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
timeout /t 10 /nobreak
exit