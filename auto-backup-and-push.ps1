# Script PowerShell para fazer backup automático e push para GitHub
# USO: .\auto-backup-and-push.ps1 "mensagem do commit"

param(
    [string]$CommitMessage = "Auto backup - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  BACKUP AUTOMÁTICO + GIT PUSH" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 1. Fazer backup do MongoDB
Write-Host "📦 Passo 1: Fazendo backup do MongoDB..." -ForegroundColor Yellow
node backup-mongo.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no backup do MongoDB!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Adicionar arquivos ao Git
Write-Host "📁 Passo 2: Adicionando arquivos ao Git..." -ForegroundColor Yellow
git add .

Write-Host ""

# 3. Verificar se há mudanças
$status = git status --short
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "ℹ️  Nenhuma mudança detectada. Nada para commitar." -ForegroundColor Cyan
    exit 0
}

Write-Host "📝 Mudanças detectadas:" -ForegroundColor Green
git status --short

Write-Host ""

# 4. Fazer commit
Write-Host "💾 Passo 3: Fazendo commit..." -ForegroundColor Yellow
git commit -m "$CommitMessage"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao fazer commit!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 5. Push para GitHub
Write-Host "🚀 Passo 4: Enviando para GitHub..." -ForegroundColor Yellow
git push

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao fazer push!" -ForegroundColor Red
    Write-Host "ℹ️  Dica: Verifique suas credenciais do GitHub" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "  ✅ BACKUP E PUSH CONCLUÍDOS!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Resumo:" -ForegroundColor Cyan
Write-Host "  • Backup MongoDB: ✅" -ForegroundColor Green
Write-Host "  • Git Commit: ✅" -ForegroundColor Green
Write-Host "  • Git Push: ✅" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Seus dados estão seguros no GitHub!" -ForegroundColor Yellow
Write-Host ""
