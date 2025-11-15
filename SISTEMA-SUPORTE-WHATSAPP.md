# 📱 Sistema de Suporte WhatsApp Integrado

## 🎯 Visão Geral

Sistema completo de multi-atendimento WhatsApp integrado ao painel administrativo do GamingFlix, rodando em processos separados para não sobrecarregar o sistema principal.

---

## 🏗️ Arquitetura

```
GamingFlix (Sistema Principal)
├── Frontend Principal: http://localhost:8080
├── Backend Principal: http://localhost:3000
└── Painel Admin → Aba "Suporte"
         ↓
      Acessa Sistema de Suporte (Separado)
         ↓
    ┌──────────────────────────────┐
    │  Sistema de Suporte WhatsApp │
    ├──────────────────────────────┤
    │ Frontend: http://localhost:5174
    │ Backend:  http://localhost:3001
    └──────────────────────────────┘
```

**Benefícios da Arquitetura:**
- ✅ **Não sobrecarrega** o sistema principal
- ✅ **Processos independentes** - se um cair, o outro continua
- ✅ **Fácil manutenção** - cada sistema tem seu próprio código
- ✅ **Escalável** - pode rodar em servidores diferentes no futuro

---

## 🚀 Como Iniciar

### **Opção 1: Iniciar Tudo de Uma Vez (Recomendado)**

```bash
# Na raiz do projeto
npm install
npm run start:all
```

Isso inicia automaticamente:
1. 🔵 **MAIN** - Frontend principal (porta 8080)
2. 🟢 **ZAP-BE** - Backend do suporte (porta 3001)
3. 🟣 **ZAP-FE** - Frontend do suporte (porta 5174)

---

### **Opção 2: Iniciar Manualmente (3 Terminais)**

#### **Terminal 1: Frontend Principal**
```bash
npm run dev
```
Acesse: http://localhost:8080

#### **Terminal 2: Backend do Suporte**
```bash
cd zap/backend
npm install
npm run dev
```
Backend rodando em: http://localhost:3001

#### **Terminal 3: Frontend do Suporte**
```bash
cd zap/frontend
npm install
npm run dev
```
Frontend do suporte em: http://localhost:5174

---

## 📱 Como Usar

### **Passo 1: Acessar o Painel Admin**

1. Abra o GamingFlix: http://localhost:8080
2. Faça login como **admin**
3. Clique em "Admin" no header
4. Selecione a aba **"Suporte"**

---

### **Passo 2: Iniciar o Sistema de Suporte**

Na aba "Suporte", você verá:

```
┌─────────────────────────────────────┐
│ Sistema de Suporte WhatsApp         │
├─────────────────────────────────────┤
│ Status: ● Aguardando inicialização  │
│                                     │
│ Frontend Suporte: localhost:5174    │
│ Backend Suporte:  localhost:3001    │
│                                     │
│ Iniciar Sistema:                    │
│  npm run start:all                  │
│                                     │
│ [Abrir Painel de Suporte]          │
└─────────────────────────────────────┘
```

**Opções:**

1. **Se ainda não iniciou os processos:**
   - Abra um novo terminal
   - Execute: `npm run start:all`
   - Aguarde os 3 processos iniciarem

2. **Se já iniciou:**
   - Clique em **"Abrir Painel de Suporte"**
   - Uma nova aba abrirá com http://localhost:5174

---

### **Passo 3: Conectar WhatsApp**

No painel de suporte (http://localhost:5174):

1. **Primeira tela: Dashboard**
   - Clique em "Configurações" ou "Conectar WhatsApp"

2. **Aparecerá um QR Code**
   - Abra o WhatsApp no celular
   - Vá em **Menu → Aparelhos Conectados**
   - Clique em **"Conectar um aparelho"**
   - Escaneie o QR Code

3. **Status muda para "Conectado" ✅**
   - Agora você pode receber mensagens!

---

### **Passo 4: Atender Clientes**

Quando uma mensagem chegar:

1. **Dashboard mostra notificação**
   - Aparece na lista de conversas

2. **Clique na conversa**
   - Abre o chat completo

3. **Responda normalmente**
   - Digite e pressione Enter
   - Mensagem é enviada via WhatsApp

4. **Recursos disponíveis:**
   - ✅ Enviar mensagens de texto
   - ✅ Ver histórico
   - ✅ Marcar como lida/não lida
   - ✅ Múltiplas conversas simultâneas

---

## 📊 Funcionalidades

### **✅ Já Implementado**
- ✅ Conexão WhatsApp Web via QR Code
- ✅ Receber mensagens em tempo real
- ✅ Enviar mensagens
- ✅ Interface de chat moderna
- ✅ Dashboard com métricas
- ✅ WebSocket para tempo real
- ✅ Sistema de logs
- ✅ Múltiplas conversas

### **🔄 Em Desenvolvimento**
- ⏳ Sistema de filas de atendimento
- ⏳ Atribuição automática de conversas
- ⏳ Suporte a mídias (imagens, áudios, vídeos)
- ⏳ Histórico de mensagens no banco
- ⏳ Respostas rápidas

### **📋 Futuras**
- 📌 Chatbot básico
- 📌 Notificações push
- 📌 Relatórios detalhados
- 📌 Exportação de conversas
- 📌 Tags e categorização
- 📌 Transferência entre atendentes

---

## 🔌 API Endpoints

### **WhatsApp**
```
POST   /api/whatsapp/session/create
       - Criar nova sessão WhatsApp

GET    /api/whatsapp/session/:sessionId/status
       - Status da sessão (conectado/desconectado)

DELETE /api/whatsapp/session/:sessionId
       - Desconectar sessão

GET    /api/whatsapp/sessions
       - Listar todas as sessões
```

### **Mensagens**
```
POST   /api/whatsapp/message/send
       - Enviar mensagem
       Body: { sessionId, to, message }

GET    /api/messages/:sessionId
       - Buscar mensagens de uma sessão

POST   /api/messages/:messageId/read
       - Marcar mensagem como lida
```

---

## 🔄 WebSocket Events

### **Client → Server**
- `join-session` - Entrar em uma sessão
- `leave-session` - Sair de uma sessão
- `typing` - Indicar que está digitando

### **Server → Client**
- `qr-code` - QR Code gerado (escanear no WhatsApp)
- `connection-update` - Status de conexão mudou
- `new-message` - Nova mensagem recebida
- `user-typing` - Usuário está digitando

---

## 📁 Estrutura de Arquivos

```
atendimentozapflix/
├── src/                          # Frontend principal
├── backend/                      # Backend principal
└── zap/                          # Sistema de Suporte
    ├── frontend/                 # Interface do suporte
    │   ├── src/
    │   │   ├── components/      # Componentes UI
    │   │   ├── pages/           # Páginas
    │   │   ├── stores/          # State management
    │   │   └── services/        # API calls
    │   ├── package.json
    │   └── vite.config.ts
    ├── backend/                  # API do suporte
    │   ├── src/
    │   │   ├── controllers/     # Controladores
    │   │   ├── services/        # Serviços (Baileys)
    │   │   ├── routes/          # Rotas
    │   │   └── socket/          # WebSocket
    │   ├── .baileys_sessions/   # Sessões WhatsApp
    │   ├── logs/                # Logs do sistema
    │   └── package.json
    └── README.md                 # Documentação do Zap
```

---

## ⚙️ Configuração

### **Backend do Suporte**

Arquivo: `zap/backend/.env`

```env
# Porta do backend
PORT=3001

# URL do frontend (CORS)
FRONTEND_URL=http://localhost:5174

# Supabase (opcional - para histórico)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-aqui

# Log level
LOG_LEVEL=info
```

### **Frontend do Suporte**

Arquivo: `zap/frontend/.env`

```env
# URL do backend
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

---

## 🧪 Testes

### **Teste 1: Conexão WhatsApp**

1. Inicie os 3 processos: `npm run start:all`
2. Acesse http://localhost:5174
3. Vá em "Configurações" → "Conectar WhatsApp"
4. Escaneie o QR Code
5. Status deve mudar para "Conectado" ✅

---

### **Teste 2: Receber Mensagem**

1. Com WhatsApp conectado
2. Envie uma mensagem para o número conectado
3. Mensagem deve aparecer no dashboard
4. Clique na conversa
5. Veja o histórico completo

---

### **Teste 3: Enviar Mensagem**

1. Abra uma conversa no painel
2. Digite uma mensagem
3. Pressione Enter
4. Mensagem deve ser enviada
5. Cliente recebe no WhatsApp ✅

---

## 📊 Monitoramento

### **Logs do Backend**

```bash
# Ver logs em tempo real
cd zap/backend
tail -f logs/combined.log

# Ver apenas erros
tail -f logs/error.log
```

### **Status da Conexão**

```bash
# Verificar se backend está rodando
curl http://localhost:3001/health

# Resposta esperada:
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### **Verificar Sessões Ativas**

```bash
curl http://localhost:3001/api/whatsapp/sessions

# Resposta:
{
  "sessions": [
    {
      "id": "main",
      "status": "connected",
      "connectedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 🐛 Troubleshooting

### **Problema: QR Code não aparece**

**Causa:** Backend não está rodando ou WebSocket não conectou

**Solução:**
```bash
# Verificar se backend está rodando
curl http://localhost:3001/health

# Se não responder, reiniciar:
cd zap/backend
npm run dev
```

---

### **Problema: "Cannot connect to backend"**

**Causa:** Backend não iniciou ou porta ocupada

**Solução:**
```bash
# Ver se porta 3001 está ocupada
netstat -ano | findstr :3001

# Matar processo se necessário (Windows)
taskkill /PID <PID> /F

# Reiniciar backend
cd zap/backend
npm run dev
```

---

### **Problema: Mensagens não chegam**

**Causa:** Sessão desconectada

**Solução:**
1. Verifique status no dashboard
2. Se "Desconectado", gere novo QR Code
3. Escaneie novamente no WhatsApp
4. Aguarde reconexão

---

### **Problema: "Baileys error"**

**Causa:** Sessão corrompida

**Solução:**
```bash
# Limpar sessões antigas
cd zap/backend
rm -rf .baileys_sessions/*

# Reiniciar backend
npm run dev

# Conectar novamente com QR Code
```

---

## 🔒 Segurança

### **Proteção de Dados**

- ✅ Sessões salvas localmente (não no banco)
- ✅ Apenas admins podem acessar o painel
- ✅ CORS configurado para domínios específicos
- ✅ Logs não contêm dados sensíveis

### **Recomendações:**

1. **Não commitar** `.baileys_sessions/` no Git
2. **Usar HTTPS** em produção
3. **Autenticação** obrigatória para acessar painel
4. **Limitar IPs** que podem acessar o backend

---

## 📈 Performance

### **Recursos Utilizados**

| Processo | RAM | CPU | Porta |
|----------|-----|-----|-------|
| Frontend Principal | ~50MB | 1-5% | 8080 |
| Backend Suporte | ~100MB | 5-10% | 3001 |
| Frontend Suporte | ~50MB | 1-5% | 5174 |
| **TOTAL** | **~200MB** | **7-20%** | - |

**Conclusão:** Sistema leve e eficiente! ✅

---

## 🚀 Deploy em Produção

### **Backend do Suporte**

```bash
# Build
cd zap/backend
npm install --production
npm run build

# PM2 (recomendado)
pm2 start src/index.js --name "zap-backend"
pm2 save
```

### **Frontend do Suporte**

```bash
# Build
cd zap/frontend
npm run build

# Servir com nginx/apache
# ou
npx serve -s dist -p 5174
```

### **Variáveis de Ambiente (Produção)**

```env
# Backend
PORT=3001
FRONTEND_URL=https://suporte.seudominio.com
NODE_ENV=production

# Frontend
VITE_API_URL=https://api-suporte.seudominio.com
VITE_WS_URL=wss://api-suporte.seudominio.com
```

---

## 📝 Notas Importantes

1. **Sessões WhatsApp**
   - Salvas em `.baileys_sessions/`
   - Não versionar no Git (já está no .gitignore)
   - Fazer backup regularmente

2. **Logs**
   - Salvos em `zap/backend/logs/`
   - Rotação automática (max 5 arquivos)
   - Limpar periodicamente

3. **Desenvolvimento**
   - Use `npm run start:all` para iniciar tudo
   - Cada processo pode ser reiniciado independentemente
   - Hot reload ativo em todos os frontends

4. **Produção**
   - Use PM2 ou similar para backend
   - Nginx/Apache para servir frontends
   - Configure SSL/TLS
   - Monitoring recomendado

---

## 🎯 Próximos Passos

1. ✅ **Instalar dependências:**
   ```bash
   npm install
   cd zap/backend && npm install
   cd ../frontend && npm install
   ```

2. ✅ **Configurar .env:**
   ```bash
   cp zap/backend/.env.example zap/backend/.env
   cp zap/frontend/.env.example zap/frontend/.env
   ```

3. ✅ **Iniciar sistema:**
   ```bash
   npm run start:all
   ```

4. ✅ **Acessar admin:**
   - http://localhost:8080/admin
   - Aba "Suporte"

5. ✅ **Conectar WhatsApp:**
   - Clicar "Abrir Painel de Suporte"
   - Escanear QR Code

---

## 🤝 Suporte

**Problemas ou dúvidas?**

1. Verifique os logs: `zap/backend/logs/combined.log`
2. Consulte esta documentação
3. Veja os exemplos de troubleshooting
4. Entre em contato com o time de desenvolvimento

---

**✨ Sistema desenvolvido com a mesma identidade visual do GamingFlix!**

**Desenvolvido com ❤️ para facilitar o atendimento ao cliente** 🚀📱
