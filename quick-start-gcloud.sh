#!/bin/bash

# 🚀 Quick Start Script para Google Cloud - Gameflix Catalog
# Execute este script na sua VPS do Google Cloud

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🎮  GAMEFLIX CATALOG - DEPLOY GOOGLE CLOUD 🎮   ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Função para imprimir mensagens
print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Arquivo package.json não encontrado!"
    print_info "Execute este script dentro do diretório do projeto"
    exit 1
fi

# 1. Atualizar sistema
print_info "Atualizando sistema..."
sudo apt update -y
print_success "Sistema atualizado"

# 2. Verificar/Instalar Node.js
print_info "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_warning "Node.js não encontrado. Instalando..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_success "Node.js instalado: $(node -v)"
else
    print_success "Node.js já instalado: $(node -v)"
fi

# 3. Verificar npm
print_info "Verificando npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm não encontrado!"
    exit 1
fi
print_success "npm instalado: $(npm -v)"

# 4. Verificar arquivo .env
print_info "Verificando arquivo .env..."
if [ ! -f ".env" ]; then
    print_warning "Arquivo .env não encontrado!"
    print_info "Criando arquivo .env de exemplo..."
    cat > .env << 'ENVEOF'
VITE_SUPABASE_PROJECT_ID="rtyrmkniabujabcwbcnh"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0eXJta25pYWJ1amFiY3diY25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzcwMzgsImV4cCI6MjA3NTYxMzAzOH0.aoZb-FjO4UJIxtiDQ9VqgJvtTLb3bZm4GmE68f9WiG4"
VITE_SUPABASE_URL="https://rtyrmkniabujabcwbcnh.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0eXJta25pYWJ1amFiY3diY25oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAzNzAzOCwiZXhwIjoyMDc1NjEzMDM4fQ.NDb-fAVVQCEav6vSHhLLEUt5vm7QCj3HSgHMPc8L28A"
VITE_STEAM_GUARD_API_URL="http://localhost:3000"
ENVEOF
    print_success "Arquivo .env criado"
else
    print_success "Arquivo .env encontrado"
fi

# 5. Instalar dependências
print_info "Instalando dependências..."
npm install
print_success "Dependências instaladas"

# 6. Build da aplicação
print_info "Compilando aplicação para produção..."
npm run build
print_success "Build concluído"

# 7. Verificar/Instalar PM2
print_info "Verificando PM2..."
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 não encontrado. Instalando..."
    sudo npm install -g pm2
    print_success "PM2 instalado"
else
    print_success "PM2 já instalado"
fi

# 8. Criar diretório de logs
mkdir -p logs

# 9. Parar aplicação anterior (se existir)
print_info "Parando aplicação anterior..."
pm2 stop gameflix-catalog 2>/dev/null || true
pm2 delete gameflix-catalog 2>/dev/null || true

# 10. Iniciar aplicação
print_info "Iniciando aplicação..."
if [ -f "ecosystem.config.js" ]; then
    pm2 start ecosystem.config.js
else
    pm2 start npm --name "gameflix-catalog" -- run start
fi
print_success "Aplicação iniciada"

# 11. Salvar configuração
print_info "Salvando configuração PM2..."
pm2 save
print_success "Configuração salva"

# 12. Configurar PM2 startup
print_info "Configurando PM2 para iniciar no boot..."
pm2 startup | grep "sudo" | bash || print_warning "Execute manualmente: sudo env PATH=\$PATH:\$(which node) \$(which pm2) startup systemd -u $USER --hp $HOME"

# 13. Verificar firewall local
print_info "Verificando firewall local..."
if command -v ufw &> /dev/null; then
    if sudo ufw status | grep -q "Status: active"; then
        print_warning "UFW está ativo. Liberando porta 8080..."
        sudo ufw allow 8080/tcp
        print_success "Porta 8080 liberada no UFW"
    else
        print_info "UFW não está ativo"
    fi
fi

# 14. Obter IP externo
print_info "Obtendo IP externo..."
EXTERNAL_IP=$(curl -s ifconfig.me)
print_success "IP externo: $EXTERNAL_IP"

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                   ║${NC}"
echo -e "${GREEN}║            ✅  DEPLOY CONCLUÍDO COM SUCESSO! ✅     ║${NC}"
echo -e "${GREEN}║                                                   ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

print_success "Aplicação rodando!"
echo ""
print_info "📊 Status da aplicação:"
pm2 status
echo ""

print_info "🌐 URLs de acesso:"
echo "   • Local: http://localhost:8080"
echo "   • Externo: http://$EXTERNAL_IP:8080"
echo ""

print_info "📋 Comandos úteis:"
echo "   • Ver logs:      pm2 logs gameflix-catalog"
echo "   • Ver status:    pm2 status"
echo "   • Reiniciar:     pm2 restart gameflix-catalog"
echo "   • Parar:         pm2 stop gameflix-catalog"
echo "   • Monitor:       pm2 monit"
echo ""

print_warning "⚠️  IMPORTANTE:"
echo "   1. Certifique-se de que a porta 8080 está aberta no Google Cloud Firewall"
echo "   2. Para criar regra no firewall, execute:"
echo ""
echo "      gcloud compute firewall-rules create allow-gameflix-8080 \\"
echo "        --direction=INGRESS \\"
echo "        --priority=1000 \\"
echo "        --network=default \\"
echo "        --action=ALLOW \\"
echo "        --rules=tcp:8080 \\"
echo "        --source-ranges=0.0.0.0/0"
echo ""

print_info "📚 Para mais informações, consulte: GOOGLE_CLOUD_SETUP.md"