#!/bin/bash
# Script COMPLETO para configurar HTTPS na VPS
# Execute: bash comandos-vps.sh

set -e

echo "🚀 Configurando HTTPS para Backend API..."
echo ""

# 1. Instalar NGINX
echo "📦 Instalando NGINX..."
sudo apt update
sudo apt install -y nginx

# 2. Criar configuração NGINX (temporária sem SSL)
echo "📝 Criando configuração do NGINX..."
sudo tee /etc/nginx/sites-available/backend-api > /dev/null <<'EOF'
server {
    listen 80;
    server_name api.gamingflix.space;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
        
        add_header Access-Control-Allow-Origin "https://ultimate.gamingflix.space" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Credentials "true" always;
    }
}
EOF

# 3. Ativar site
echo "🔗 Ativando site..."
sudo ln -sf /etc/nginx/sites-available/backend-api /etc/nginx/sites-enabled/

# 4. Testar configuração
echo "✅ Testando configuração..."
sudo nginx -t

# 5. Recarregar NGINX
echo "🔄 Recarregando NGINX..."
sudo systemctl reload nginx

echo ""
echo "✅ NGINX configurado com sucesso!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo ""
echo "1. Configure o DNS:"
echo "   Tipo: A"
echo "   Nome: api"
echo "   Valor: 35.215.218.188"
echo ""
echo "2. Aguarde 2-5 minutos para DNS propagar"
echo ""
echo "3. Teste: nslookup api.gamingflix.space"
echo ""
echo "4. Instale SSL com certbot:"
echo "   sudo apt install -y certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d api.gamingflix.space"
echo ""
echo "5. Verifique firewall (Google Cloud):"
echo "   gcloud compute firewall-rules list"
echo "   Certifique-se que portas 80 e 443 estão abertas"
echo ""
echo "6. Verifique se backend está rodando:"
echo "   curl http://127.0.0.1:3000/health"
echo ""
echo "7. Teste final:"
echo "   curl https://api.gamingflix.space/health"
echo ""