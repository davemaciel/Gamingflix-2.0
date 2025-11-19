# 🚀 ZapFlix - Guia de Início Rápido

## 📦 Instalação

### 1. Instalar Dependências

```bash
cd zapflix/backend
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp ../.env.example ../.env

# Editar .env com suas configurações
```

### 3. Iniciar Evolution API

```bash
# Na pasta zapflix
docker-compose -f docker-compose.evolution.yml up -d
```

**Aguarde 30 segundos** para a Evolution API inicializar.

### 4. Conectar WhatsApp

Acesse no navegador:
```
http://localhost:8081/instance/connect/gamingflix?apikey=zapflix-secret-key-change-me
```

**Escaneie o QR Code** com seu WhatsApp.

### 5. Iniciar Backend

```bash
cd backend
npm run dev
```

Backend estará rodando em: `http://localhost:3001`

---

## ✅ Testar

### 1. Health Check

```bash
curl http://localhost:3001/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "service": "ZapFlix Backend",
  "timestamp": "2025-11-18T18:00:00.000Z"
}
```

### 2. Status da Evolution API

```bash
curl http://localhost:3001/api/evolution/status
```

Deve mostrar `"state": "open"` se conectado.

### 3. Enviar Mensagem de Teste

Envie uma mensagem para o WhatsApp conectado e veja os logs no backend.

---

## 📋 Checklist

- [ ] Evolution API rodando (`docker ps`)
- [ ] Backend rodando (`npm run dev`)
- [ ] WhatsApp conectado (QR Code escaneado)
- [ ] MongoDB conectado (veja nos logs)
- [ ] Health check funcionando

---

## 🐛 Troubleshooting

### Evolution API não inicia

```bash
# Ver logs
docker logs zapflix-evolution

# Restart
docker-compose -f docker-compose.evolution.yml restart
```

### Erro de conexão MongoDB

Verifique se a connection string está correta no `.env`:
```env
MONGODB_URI=mongodb+srv://gameflix:GamingFlix2025@ggflix.m5lpb1z.mongodb.net/gameflix
```

### WhatsApp desconecta

1. Acesse novamente: `http://localhost:8081/instance/connect/gamingflix?apikey=...`
2. Escaneie o QR Code novamente

---

## 🎯 Próximos Passos

1. ✅ Backend funcionando
2. ⏳ Criar interface React (frontend/)
3. ⏳ Testar envio/recebimento de mensagens
4. ⏳ Deploy no Render

---

**Status Atual:** ✅ Backend completo e funcional!
