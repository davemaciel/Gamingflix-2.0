#!/bin/bash

# ================================================================
# Script para configurar Firewall do Google Cloud - Portas 80 e 3000
# Execute no Google Cloud Shell ou com gcloud CLI
# ================================================================

set -e

echo ""
echo "========================================"
echo " Configurando Firewall Google Cloud"
echo " Portas: 80 (Frontend) e 3000 (Backend)"
echo " IP: 35.215.218.188"
echo "========================================"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# ===== PORTA 80 (Frontend) =====
echo -e "${YELLOW}[1/6] Criando regra de firewall allow-gameflix-80...${NC}"
if gcloud compute firewall-rules create allow-gameflix-80 \
  --direction=INGRESS \
  --priority=1000 \
  --network=default \
  --action=ALLOW \
  --rules=tcp:80 \
  --source-ranges=0.0.0.0/0 \
  --description="Permitir acesso a porta 80 para Gameflix Frontend" 2>/dev/null; then
  echo -e "${GREEN}✓ Regra porta 80 criada com sucesso${NC}"
else
  echo -e "${YELLOW}⚠ Regra porta 80 já existe ou erro. Tentando atualizar...${NC}"
  gcloud compute firewall-rules update allow-gameflix-80 \
    --allow tcp:80 \
    --source-ranges=0.0.0.0/0 || echo -e "${RED}✗ Erro ao atualizar porta 80${NC}"
fi

# ===== PORTA 3000 (Backend) =====
echo ""
echo -e "${YELLOW}[2/6] Criando regra de firewall allow-gameflix-3000...${NC}"
if gcloud compute firewall-rules create allow-gameflix-3000 \
  --direction=INGRESS \
  --priority=1000 \
  --network=default \
  --action=ALLOW \
  --rules=tcp:3000 \
  --source-ranges=0.0.0.0/0 \
  --description="Permitir acesso a porta 3000 para Gameflix Backend" 2>/dev/null; then
  echo -e "${GREEN}✓ Regra porta 3000 criada com sucesso${NC}"
else
  echo -e "${YELLOW}⚠ Regra porta 3000 já existe ou erro. Tentando atualizar...${NC}"
  gcloud compute firewall-rules update allow-gameflix-3000 \
    --allow tcp:3000 \
    --source-ranges=0.0.0.0/0 || echo -e "${RED}✗ Erro ao atualizar porta 3000${NC}"
fi

echo ""
echo -e "${YELLOW}[3/6] Verificando regra porta 80...${NC}"
gcloud compute firewall-rules describe allow-gameflix-80

echo ""
echo -e "${YELLOW}[4/6] Verificando regra porta 3000...${NC}"
gcloud compute firewall-rules describe allow-gameflix-3000

echo ""
echo -e "${YELLOW}[5/6] Listando todas as regras Gameflix...${NC}"
gcloud compute firewall-rules list --filter="name:allow-gameflix" --format="table(name,direction,sourceRanges,allowed)"

echo ""
echo -e "${YELLOW}[6/6] Obtendo informações da VM...${NC}"
echo "Procurando VMs no projeto..."
gcloud compute instances list --format="table(name,zone,networkInterfaces[0].accessConfigs[0].natIP,status)"

echo ""
echo -e "${GREEN}========================================"
echo " ✓ Configuração concluída!"
echo "========================================${NC}"
echo ""
echo -e "${GREEN}Teste o acesso em:"
echo "  - Frontend: http://35.215.218.188"
echo "  - Backend:  http://35.215.218.188:3000/health${NC}"
echo ""