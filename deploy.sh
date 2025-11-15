#!/bin/bash

# 🚀 Script de Deploy - Gameflix Catalog
# Este script automatiza o processo de deploy na VPS

set -e

echo "🚀 Iniciando deploy do Gameflix Catalog..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# 1. Verificar Node.js
print_info "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js não está instalado!"
    exit 1
fi
print_success "Node.js $(node -v) instalado"

# 2. Verificar npm
print_info "Verificando npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm não está instalado!"
    exit 1
fi
print_success "npm $(npm -v) instalado"

# 3. Instalar dependências
print_info "Instalando dependências..."
npm install
print_success "Dependências instaladas"

# 4. Build da aplicação
print_info "Compilando aplicação para produção..."
npm run build
print_success "Build concluído"

# 5. Verificar PM2
print_info "Verificando PM2..."
if ! command -v pm2 &> /dev/null; then
    print_info "PM2 não encontrado. Instalando..."
    npm install -g pm2
    print_success "PM2 instalado"
else
    print_success "PM2 já instalado"
fi

# 6. Parar aplicação se estiver rodando
print_info "Parando aplicação anterior (se existir)..."
pm2 stop gameflix-catalog 2>/dev/null || true
pm2 delete gameflix-catalog 2>/dev/null || true

# 7. Iniciar aplicação
print_info "Iniciando aplicação..."
pm2 start ecosystem.config.js
print_success "Aplicação iniciada"

# 8. Salvar configuração PM2
print_info "Salvando configuração PM2..."
pm2 save
print_success "Configuração salva"

# 9. Configurar PM2 para iniciar no boot (primeira vez)
print_info "Configurando PM2 startup..."
pm2 startup || print_info "PM2 startup já configurado ou requer sudo"

# 10. Mostrar status
print_success "Deploy concluído!"
echo ""
print_info "Status da aplicação:"
pm2 status

echo ""
print_info "Para ver os logs, execute:"
echo "  pm2 logs gameflix-catalog"
echo ""
print_success "Aplicação disponível em: http://35.215.218.188:8080"