@echo off
chcp 65001 >nul
echo ╔══════════════════════════════════════════════════════╗
echo ║   MIGRAÇÃO: SUPABASE → MONGODB LOCAL                ║
echo ╚══════════════════════════════════════════════════════╝
echo.
echo 🔍 Verificando instalação do Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado! Instale em: https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js encontrado
echo.

echo 🔍 Verificando MongoDB...
echo.
call npm run check:mongodb
if errorlevel 1 (
    echo.
    echo ❌ MongoDB não está rodando ou não está instalado!
    echo.
    echo 💡 Para instalar o MongoDB:
    echo    1. Baixe em: https://www.mongodb.com/try/download/community
    echo    2. Ou use Docker: docker run -d -p 27017:27017 --name mongodb mongo
    echo.
    echo Para iniciar o MongoDB (se já instalado):
    echo    - net start MongoDB
    echo.
    pause
    exit /b 1
)

echo.
echo ═══════════════════════════════════════════════════════
echo 🚀 Iniciando migração dos dados...
echo ═══════════════════════════════════════════════════════
echo.

call npm run migrate:supabase-to-mongo

echo.
echo ═══════════════════════════════════════════════════════
echo ✅ Processo concluído!
echo ═══════════════════════════════════════════════════════
echo.
pause
