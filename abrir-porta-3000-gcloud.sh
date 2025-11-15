#!/bin/bash

# ================================================================
# Script para configurar Firewall do Google Cloud - Porta 3000
# Execute no Google Cloud Shell ou com gcloud CLI
# ================================================================

set -e

echo ""
echo "========================================"
echo " Configurando Firewall Google Cloud"
echo " Porta: 3000 (Backend API)"
echo " IP: 35.215.218.188"
echo "========================================"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Criar regra de firewall
echo -e "${YELLOW}[1/4] Criando regra de firewall allow-gameflix-backend-3000...${NC}"
if gcloud compute firewall-rules create allow-gameflix-backend-3000 \
  --direction=INGRESS \
  --priority=1000 \
  --network=default \
  --action=ALLOW \
  --rules=tcp:3000 \
  --source-ranges=0.0.0.0/0 \
  --description="Permitir acesso a porta 3000 para Backend Gameflix" 2>/dev/null; then
  echo -e "${GREEN}✓ Regra criada com sucesso${NC}"
else
  echo -e "${YELLOW}⚠ Regra já existe ou erro na criação. Tentando atualizar...${NC}"
  gcloud compute firewall-rules update allow-gameflix-backend-3000 \
    --allow tcp:3000 \
    --source-ranges=0.0.0.0/0 || echo -e "${RED}✗ Erro ao atualizar${NC}"
fi

echo ""
echo -e "${YELLOW}[2/4] Verificando regra criada...${NC}"
gcloud compute firewall-rules describe allow-gameflix-backend-3000

echo ""
echo -e "${YELLOW}[3/4] Listando todas as regras com porta 3000...${NC}"
gcloud compute firewall-rules list --filter="allowed[].ports:3000" --format="table(name,direction,sourceRanges,allowed)"

echo ""
echo -e "${YELLOW}[4/4] Testando conectividade...${NC}"
echo "Aguarde 10 segundos para o firewall aplicar..."
sleep 10

echo ""
echo "Testando acesso ao backend..."
if curl -s -o /dev/null -w "%{http_code}" http://35.215.218.188:3000/health | grep -q "200"; then
  echo -e "${GREEN}✓ Backend acessível externamente!${NC}"
else
  echo -e "${YELLOW}⚠ Backend não respondeu. Verifique se está rodando.${NC}"
fi

echo ""
echo -e "${GREEN}========================================"
echo " ✓ Configuração concluída!"
echo "========================================${NC}"
echo ""
echo -e "${GREEN}Teste o acesso em:"
echo "  - http://35.215.218.188:3000/health"
echo "  - http://ultimate.gamingflix.space:3000/health${NC}"
echo ""