# Inicia o backend HTTP utilizado pelo Nginx (porta 3000)
Write-Host "=== Iniciando Backend - GameFlix ===" -ForegroundColor Cyan
Write-Host ""

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $repoRoot 'backend'

if (-not (Test-Path $backendPath)) {
    Write-Error "Pasta do backend não encontrada em '$backendPath'."
    exit 1
}

Set-Location $backendPath

if (-not (Test-Path 'node_modules')) {
    Write-Host "Instalando dependências do backend (node_modules ausente)..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

if (-not (Test-Path '.env')) {
    Write-Warning "Arquivo .env não encontrado. O backend pode falhar sem as variáveis corretas."
}

Write-Host "Iniciando backend na porta 3000..." -ForegroundColor Green
Write-Host "Para encerrar use Ctrl+C nesta janela." -ForegroundColor Yellow
Write-Host ""

npm start
