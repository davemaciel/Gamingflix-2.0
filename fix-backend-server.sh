#!/bin/bash
# Script para executar NO SERVIDOR (35.215.218.188)
# Corrige e reinicia o backend do GameFlix

echo "=========================================="
echo "  GameFlix - Correção Backend no Servidor"
echo "=========================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar se está na pasta correta
echo -e "${YELLOW}[1/5] Verificando estrutura...${NC}"
if [ ! -d "v2-1-ggflixbot/backend" ]; then
    echo -e "${RED}❌ Pasta v2-1-ggflixbot/backend não encontrada!${NC}"
    echo "Execute este script na pasta raiz do projeto"
    exit 1
fi
echo -e "${GREEN}✅ Estrutura OK${NC}"
echo ""

# 2. Ir para a pasta do backend
cd v2-1-ggflixbot/backend

# 3. Verificar dependências
echo -e "${YELLOW}[2/5] Instalando dependências...${NC}"
npm install
echo -e "${GREEN}✅ Dependências instaladas${NC}"
echo ""

# 4. Parar processos antigos
echo -e "${YELLOW}[3/5] Parando processos antigos...${NC}"
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
echo -e "${GREEN}✅ Processos parados${NC}"
echo ""

# 5. Iniciar backend
echo -e "${YELLOW}[4/5] Iniciando backend...${NC}"
pm2 start npm --name "gameflix-backend" -- start
pm2 save
echo -e "${GREEN}✅ Backend iniciado!${NC}"
echo ""

# 6. Testar
echo -e "${YELLOW}[5/5] Testando backend...${NC}"
sleep 3
curl -s http://localhost:3000/health || echo -e "${RED}❌ Backend não responde em localhost:3000${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}  Processo Concluído!${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}Próximos passos:${NC}"
echo "1. Teste local no servidor:"
echo "   curl http://localhost:3000/health"
echo ""
echo "2. Teste externo (do seu computador):"
echo "   curl http://35.215.218.188:3000/health"
echo ""
echo "3. Se o teste externo falhar, configure o firewall:"
echo "   gcloud compute firewall-rules create allow-backend --allow tcp:3000 --source-ranges 0.0.0.0/0"
echo ""
echo "4. Veja os logs com:"
echo "   pm2 logs gameflix-backend"