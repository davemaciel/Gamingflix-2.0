# GGFlix Bot - Backend

Backend robusto e escalável para automação de busca e entrega de códigos 2FA do Steam via email IMAP/POP3, com integração WhatsApp usando Baileys.

## Funcionalidades

- Busca automática de códigos 2FA do Steam em emails
- API RESTful para integração com frontend
- Envio de códigos via WhatsApp usando Baileys
- Sistema de autenticação e segurança
- Logging completo de operações
- Containerização com Docker

## Requisitos

- Node.js 18+
- Conta de email com acesso IMAP
- Acesso ao WhatsApp (para funcionalidade de envio)

## Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
cd backend
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

## Configuração

Edite o arquivo `.env` com suas configurações:

```
# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Configurações de Email
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=sua-senha-ou-app-password
EMAIL_HOST=imap.gmail.com
EMAIL_PORT=993
EMAIL_TLS=true
EMAIL_MAILBOX=INBOX

# Configurações do Steam
STEAM_EMAIL_SUBJECT=Steam Guard Code
STEAM_CODE_REGEX=([A-Z0-9]{5})
```

## Uso

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm start
```

### Docker

```bash
docker-compose up -d
```

## API Endpoints

### Steam

- `GET /api/steam/code` - Busca o código 2FA do Steam
- `GET /api/steam/history` - Obtém o histórico de códigos buscados

### WhatsApp

- `POST /api/whatsapp/send` - Envia uma mensagem com o código 2FA
- `GET /api/whatsapp/status` - Verifica o status da conexão com WhatsApp

## Segurança

O sistema implementa:

- Autenticação por API Key
- Rate limiting
- Logging de segurança
- TLS para conexões IMAP

## Escalabilidade

- Containerização com Docker
- Configuração para ambientes de produção
- Tratamento de erros e recuperação
- Monitoramento de saúde da aplicação