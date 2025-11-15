@echo off
chcp 65001 >nul
cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║   GAMEFLIX - INICIAR PROJETO (MongoDB + Backend + Frontend) ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo 🔍 Verificando pré-requisitos...
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado! Instale em: https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js encontrado

where mongosh >nul 2>&1
if errorlevel 1 (
    echo ⚠️  MongoDB CLI (mongosh) não encontrado
    echo    Certifique-se que o MongoDB está instalado
) else (
    echo ✅ MongoDB CLI encontrado
)

echo.
echo ═══════════════════════════════════════════════════════════
echo 📦 1/4: VERIFICANDO MONGODB
echo ═══════════════════════════════════════════════════════════
echo.

call npm run check:mongodb
if errorlevel 1 (
    echo.
    echo ❌ MongoDB não está rodando!
    echo.
    echo 💡 Para iniciar o MongoDB:
    echo    - net start MongoDB
    echo    - ou Docker: docker start mongodb
    echo.
    pause
    exit /b 1
)

echo.
echo ═══════════════════════════════════════════════════════════
echo 📦 2/4: VERIFICANDO DEPENDÊNCIAS
echo ═══════════════════════════════════════════════════════════
echo.

if not exist "node_modules\" (
    echo 📥 Instalando dependências do frontend...
    call npm install
    if errorlevel 1 (
        echo ❌ Erro ao instalar dependências do frontend
        pause
        exit /b 1
    )
)

if not exist "backend\node_modules\" (
    echo 📥 Instalando dependências do backend...
    cd backend
    call npm install
    cd ..
    if errorlevel 1 (
        echo ❌ Erro ao instalar dependências do backend
        pause
        exit /b 1
    )
)

echo ✅ Dependências instaladas

echo.
echo ═══════════════════════════════════════════════════════════
echo 🚀 3/4: INICIANDO BACKEND (porta 3000)
echo ═══════════════════════════════════════════════════════════
echo.

start "GameFlix Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

echo ✅ Backend iniciado em segundo plano

echo.
echo ═══════════════════════════════════════════════════════════
echo 🎨 4/4: INICIANDO FRONTEND (porta 5173)
echo ═══════════════════════════════════════════════════════════
echo.

echo ✅ Frontend será iniciado...
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                   PROJETO INICIADO!                         ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  🎮 Frontend: http://localhost:5173                        ║
echo ║  🔧 Backend:  http://localhost:3000                        ║
echo ║  📊 MongoDB:  mongodb://localhost:27017                    ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 💡 Para parar os serviços, feche as janelas do terminal
echo.

call npm run dev
