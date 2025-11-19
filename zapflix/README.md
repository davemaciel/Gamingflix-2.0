# 💬 ZapFlix - Sistema de Atendimento WhatsApp

Sistema completo de multi-atendimento via WhatsApp integrado ao GamingFlix.

## 📋 Status do Projeto

**Branch de Backup:** `backup/email-recovery-wip`
- Commit: `23be058` - Sistema de checkout com PIX e emails profissionais
- Pendente: Recuperação de senha por email (em debug)

## 🏗️ Arquitetura

```
zapflix/
├── backend/          # API Node.js + Socket.io
├── frontend/         # Interface React do chat
├── evolution/        # Configuração Evolution API
└── docs/            # Documentação
```

## 🚀 Tecnologias

- **Evolution API:** Conexão WhatsApp
- **Socket.io:** Tempo real
- **React + TypeScript:** Interface
- **MongoDB:** Armazenamento (mesmo do GamingFlix)
- **shadcn/ui:** Componentes

## 📦 Próximos Passos

1. ✅ Estrutura de pastas criada
2. ⏳ Setup Evolution API
3. ⏳ Backend com Socket.io
4. ⏳ Interface de atendimento
5. ⏳ Integração com GamingFlix

---

**Desenvolvido separadamente para não interferir no projeto principal**
