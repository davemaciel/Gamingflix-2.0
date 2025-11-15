#!/bin/bash
# Script para configurar NGINX como proxy reverso para o backend

echo "🔧 Configurando NGINX para Backend API..."

# Verificar se NGINX está instalado
if ! command -v nginx &> /dev/null; then
    echo "📦 NGINX não encontrado. Instalando..."
    sudo apt update
    sudo apt install -y nginx
fi

# Copiar arquivo de configuração
echo "📝 Copiando configuração do NGINX..."
sudo cp nginx-backend.conf /etc/nginx/sites-available/backend-api

# Criar symlink para sites-enabled
echo "🔗 Ativando site..."
sudo ln -sf /etc/nginx/sites-available/backend-api /etc/nginx/sites-enabled/

# Testar configuração
echo "✅ Testando configuração do NGINX..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuração válida!"
    echo "🔄 Recarregando NGINX..."
    sudo systemctl reload nginx
    echo ""
    echo "✅ NGINX configurado com sucesso!"
    echo ""
    echo "📋 Próximos passos:"
    echo "1. Configure o DNS para api.gamingflix.space apontar para: 35.215.218.188"
    echo "2. Atualize o arquivo .env com: VITE_STEAM_GUARD_API_URL=\"https://api.gamingflix.space\""
    echo "3. Rebuild o frontend: npm run build"
    echo ""
    echo "🔍 Verificar status: sudo systemctl status nginx"
    echo "📄 Ver logs: sudo tail -f /var/log/nginx/error.log"
else
    echo "❌ Erro na configuração do NGINX!"
    echo "Execute: sudo nginx -t para ver os erros"
    exit 1
fi