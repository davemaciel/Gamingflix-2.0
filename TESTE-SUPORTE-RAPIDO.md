# ⚡ Teste Rápido - Sistema de Suporte

## ✅ O Que Foi Corrigido

1. ✅ Removido `makeInMemoryStore` que não existe no Baileys
2. ✅ Criado `.env` do backend (porta 3001)
3. ✅ Criado `.env` do frontend (API + WebSocket)
4. ✅ Dependências instaladas em ambos

---

## 🚀 Como Testar AGORA

### **1. Iniciar Todos os Processos**

```bash
# Na raiz do projeto (atendimentozapflix)
npm run start:all
```

Isso inicia:
- 🔵 **MAIN** - Frontend principal (8080)
- 🔷 **BACKEND** - Backend principal (3000)
- 🟢 **ZAP-BE** - Backend suporte (3001)
- 🟣 **ZAP-FE** - Frontend suporte (5174)

---

### **2. Acessar o Sistema de Suporte**

**Opção A: Via Painel Admin**
1. Abra: http://localhost:8080/admin
2. Clique na aba **"Suporte"**
3. Clique em **"Abrir Painel de Suporte"**

**Opção B: Direto**
1. Abra: http://localhost:5174

---

### **3. Fazer Login**

Na página de login do suporte:

- **Email:** qualquer (ex: admin@teste.com)
- **Senha:** qualquer (ex: 123456)
- Clique **"Entrar"**

> ⚠️ **Nota:** O login é fake por enquanto (apenas demonstração)

---

### **4. Dashboard**

Você verá:
- 📊 Métricas em tempo real
- 📱 Botão "Conectar WhatsApp"
- 💬 Lista de conversas

---

### **5. Conectar WhatsApp**

1. Clique em **"Settings"** (ou ⚙️)
2. Clique em **"Conectar WhatsApp"**
3. **QR Code aparece** na tela
4. Abra WhatsApp no celular
5. Vá em **Menu → Aparelhos Conectados**
6. Clique **"Conectar um aparelho"**
7. **Escaneie o QR Code**
8. Status muda para **"Conectado"** ✅

---

### **6. Testar Atendimento**

1. Envie uma mensagem para o número conectado
2. Mensagem aparece no dashboard
3. Clique na conversa
4. Digite uma resposta
5. Pressione Enter
6. ✅ Mensagem enviada!

---

## 🔧 Se a Tela Continuar Preta

### **Solução 1: Limpar Cache do Navegador**
```
Ctrl + Shift + R (ou Ctrl + F5)
```

### **Solução 2: Reiniciar Frontend**
```bash
# Parar tudo (Ctrl+C)
# Iniciar novamente
npm run start:all
```

### **Solução 3: Verificar Console do Navegador**
```
F12 → Console
```
- Se houver erro em vermelho, me envie print

---

## 📊 Verificar se Está Funcionando

### **Backend do Suporte (3001)**
```bash
curl http://localhost:3001/health

# Resposta esperada:
{
  "status": "ok",
  "timestamp": "2025-..."
}
```

### **Frontend do Suporte (5174)**
```bash
curl http://localhost:5174

# Resposta: HTML da página
```

---

## 🐛 Troubleshooting

### **Porta 3001 ocupada**
```powershell
# Ver quem está usando
netstat -ano | findstr :3001

# Matar processo
taskkill /PID <PID> /F

# Reiniciar
cd zap\backend
npm run dev
```

### **Porta 5174 ocupada**
```powershell
# Ver quem está usando
netstat -ano | findstr :5174

# Matar processo
taskkill /PID <PID> /F

# Reiniciar
cd zap\frontend
npm run dev
```

### **Erro "Cannot find module"**
```bash
# Reinstalar dependências
cd zap\backend
npm install

cd ..\frontend
npm install
```

---

## ✅ Checklist de Funcionamento

- [ ] `npm run start:all` inicia sem erros
- [ ] http://localhost:3001/health responde
- [ ] http://localhost:5174 abre página de login
- [ ] Login redireciona para dashboard
- [ ] Dashboard mostra métricas
- [ ] Settings mostra opção "Conectar WhatsApp"
- [ ] QR Code é gerado
- [ ] WhatsApp conecta com sucesso

---

## 📝 Logs para Debugar

```bash
# Backend do suporte
cd zap\backend
tail -f logs\combined.log

# Ou no Windows
Get-Content logs\combined.log -Wait -Tail 50
```

---

## 🎯 Próximos Passos

Após tudo funcionando:

1. ✅ Conectar WhatsApp
2. ✅ Testar envio/recebimento de mensagens
3. ✅ Explorar interface
4. ✅ Ver métricas em tempo real

---

**Qualquer problema, me envie:**
1. Print da tela preta (F12 → Console)
2. Logs do backend (`zap\backend\logs\combined.log`)
3. Comando que você executou

---

**🚀 Agora sim vai funcionar!** ✨
