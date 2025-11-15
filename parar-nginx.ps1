# ==============================================================================
#                     GAMEFLIX - PARAR NGINX
# ==============================================================================

Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "           PARANDO NGINX - GAMEFLIX" -ForegroundColor White
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""

$nginxPath = "C:\nginx"

# Verificar se Nginx está rodando
$nginxProcess = Get-Process -Name "nginx" -ErrorAction SilentlyContinue
if (-not $nginxProcess) {
    Write-Host "⚠️  Nginx não está em execução!" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 0
}

Write-Host "🛑 Parando Nginx..." -ForegroundColor Yellow
Write-Host ""

Set-Location $nginxPath

# Tentar parada graceful primeiro
try {
    & ".\nginx.exe" -s quit
    Start-Sleep -Seconds 3
} catch {
    Write-Host "⚠️  Erro ao parar gracefully, forçando..." -ForegroundColor Yellow
}

# Verificar se parou
$nginxStillRunning = Get-Process -Name "nginx" -ErrorAction SilentlyContinue
if ($nginxStillRunning) {
    Write-Host "⚠️  Forçando parada..." -ForegroundColor Yellow
    Stop-Process -Name "nginx" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

# Verificar novamente
$nginxFinal = Get-Process -Name "nginx" -ErrorAction SilentlyContinue
if (-not $nginxFinal) {
    Write-Host "✅ Nginx parado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao parar Nginx!" -ForegroundColor Red
    Write-Host "   Tente parar manualmente via Task Manager" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Pressione Enter para sair"