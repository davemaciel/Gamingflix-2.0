# ==============================================================================
#                     GAMEFLIX - RECARREGAR NGINX
#                  (Aplicar mudanças de configuração)
# ==============================================================================

Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "           RECARREGANDO NGINX - GAMEFLIX" -ForegroundColor White
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""

$nginxPath = "C:\nginx"

# Verificar se Nginx está instalado
if (-not (Test-Path "$nginxPath\nginx.exe")) {
    Write-Host "❌ Nginx não está instalado!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar se está rodando
$nginxProcess = Get-Process -Name "nginx" -ErrorAction SilentlyContinue
if (-not $nginxProcess) {
    Write-Host "⚠️  Nginx não está em execução!" -ForegroundColor Yellow
    Write-Host "   Use .\iniciar-nginx.ps1 para iniciar" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 1
}

Set-Location $nginxPath

Write-Host "🔍 Testando configuração..." -ForegroundColor Yellow
Write-Host ""

# Testar configuração
$testResult = & ".\nginx.exe" -t 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Configuração válida!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "🔄 Recarregando Nginx..." -ForegroundColor Cyan
    & ".\nginx.exe" -s reload
    Start-Sleep -Seconds 2
    
    Write-Host "✅ Nginx recarregado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "   As novas configurações foram aplicadas!" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "❌ Erro na configuração!" -ForegroundColor Red
    Write-Host ""
    Write-Host $testResult -ForegroundColor Yellow
    Write-Host ""
    Write-Host "⚠️  Nginx NÃO foi recarregado (configuração inválida)" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Pressione Enter para sair"