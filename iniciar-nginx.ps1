# Inicializa o Nginx responsável por servir o catálogo e proxyar o backend.
$ErrorActionPreference = 'Stop'

Write-Host ('=' * 80) -ForegroundColor Cyan
Write-Host '           INICIANDO NGINX - GAMEFLIX PROXY REVERSO' -ForegroundColor White
Write-Host ('=' * 80) -ForegroundColor Cyan
Write-Host ''

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Error 'Este script precisa ser executado com permissões de Administrador.'
    exit 1
}

$nginxPath = 'C:\nginx'
$nginxExe = Join-Path $nginxPath 'nginx.exe'
if (-not (Test-Path $nginxExe)) {
    Write-Error "Nginx não encontrado em '$nginxExe'. Execute .\arquivos-desnecessarios\instalar-nginx.ps1 para instalar."
    exit 1
}

Write-Host 'Verificando instância existente do Nginx...' -ForegroundColor Yellow
$existing = Get-Process -Name 'nginx' -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host 'Nginx já estava em execução. Reiniciando...' -ForegroundColor Yellow
    Set-Location $nginxPath
    & $nginxExe -s quit
    Start-Sleep -Seconds 2
    Stop-Process -Name 'nginx' -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

Write-Host 'Verificando porta 80...' -ForegroundColor Yellow
$port80 = Get-NetTCPConnection -LocalPort 80 -ErrorAction SilentlyContinue
if ($port80 -and $port80.OwningProcess -ne $PID) {
    $pidToStop = $port80.OwningProcess
    $processName = (Get-Process -Id $pidToStop -ErrorAction SilentlyContinue).ProcessName
    Write-Host "Porta 80 em uso por $processName (PID $pidToStop). Finalizando automaticamente..." -ForegroundColor Yellow
    Stop-Process -Id $pidToStop -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Write-Host 'Porta 80 disponível. Iniciando Nginx...' -ForegroundColor Green
Set-Location $nginxPath

try {
    Start-Process -FilePath $nginxExe -WindowStyle Hidden
    Start-Sleep -Seconds 2
    $nginxProcess = Get-Process -Name 'nginx' -ErrorAction SilentlyContinue
    if (-not $nginxProcess) {
        throw 'Falha ao iniciar o processo nginx.exe.'
    }

    Write-Host ''
    Write-Host 'Nginx iniciado com sucesso!' -ForegroundColor Green
    Write-Host ''
    Write-Host 'URLs úteis:' -ForegroundColor Cyan
    Write-Host '  - Frontend: http://localhost' -ForegroundColor Green
    Write-Host '  - API:      http://localhost/api/' -ForegroundColor Yellow
    Write-Host '  - Health:   http://localhost/health' -ForegroundColor Yellow
    Write-Host ''
    Write-Host 'Comandos auxiliares:' -ForegroundColor Cyan
    Write-Host '  - Parar:      .\parar-nginx.ps1' -ForegroundColor Green
    Write-Host '  - Recarregar: .\recarregar-nginx.ps1' -ForegroundColor Green
    Write-Host ''
}
catch {
    Write-Error "Erro ao iniciar Nginx: $_"
    exit 1
}
