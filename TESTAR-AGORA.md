# ⚡ Teste Rápido - Verificar se está Funcionando

## 🚀 Início Rápido (5 minutos)

### 1. Inicie Tudo

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend (em outra janela)
cd ..
npm run dev
```

### 2. Teste o Update do Admin

1. Acesse: http://localhost:5173
2. Faça login como admin
3. Clique em **"Admin"** no menu
4. Escolha qualquer jogo e clique em **"Editar"**
5. Mude a **senha** para: `TESTE_123456`
6. Clique em **"Atualizar"**
7. Veja o toast verde: ✅ "Jogo atualizado!"

### 3. Verifique no Frontend

1. Volte ao **Catálogo**
2. Clique no **mesmo jogo** que você editou
3. Olhe as **"Informações de Acesso"**
4. **A senha deve ser:** `TESTE_123456`

### ✅ Se a senha mudou = FUNCIONOU! 🎉

---

## 🔍 Se NÃO Funcionar

### Verifique os Logs do Backend

Os logs vão mostrar o que aconteceu:

```bash
cd backend
cat logs/combined.log | tail -20
```

Procure por:
- ✅ `Game updated successfully` = Funcionou!
- ❌ `Game not found` = ID errado
- ❌ `Error updating game` = Erro no MongoDB

### Teste a API Diretamente

```bash
# 1. Obtenha o token
# No navegador (F12 > Console):
localStorage.getItem('auth_token')

# 2. Teste buscar jogos
curl http://localhost:3000/api/games \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# 3. Se listar jogos = API está OK!
```

---

## 📧 Teste o Email (Opcional)

### Configure SMTP Rápido (Gmail)

1. **Edite:** `backend/.env`
2. **Adicione:**
   ```env
   SMTP_USER=seu@gmail.com
   SMTP_PASS=sua_senha_de_app
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   ```
3. **Reinicie o backend**

### Teste

1. Página de login
2. "Esqueci minha senha"
3. Digite seu email
4. Verifique a caixa de entrada

**Veja o guia completo em:** `backend/CONFIGURAR-EMAIL-RECUPERACAO.md`

---

## 🎯 Checklist Rápido

- [ ] Backend rodando (porta 3000)
- [ ] Frontend rodando (porta 5173)
- [ ] Login como admin funciona
- [ ] Editar jogo no admin funciona
- [ ] Mudanças aparecem no jogo
- [ ] (Opcional) Email configurado

---

## 🆘 Ainda com Problema?

1. **Limpe o cache do navegador** (Ctrl+Shift+Del)
2. **Reinicie tudo:**
   ```bash
   # Pare backend e frontend (Ctrl+C)
   # Inicie novamente
   cd backend
   npm start
   # Nova janela
   npm run dev
   ```

3. **Verifique MongoDB:**
   ```bash
   npm run check:mongodb
   ```

4. **Leia o guia completo:**
   - `CORRECOES-REALIZADAS.md` - Explicação detalhada
   - `backend/CONFIGURAR-EMAIL-RECUPERACAO.md` - Setup de email

---

## 📊 Logs Úteis

### Backend funcionando corretamente:
```
✅ MongoDB conectado com sucesso
✅ Servidor rodando em http://0.0.0.0:3000
```

### Update funcionando:
```
✅ Attempting to update game with ID: xxx
✅ Game updated successfully: xxx - Cuphead
```

### Email funcionando:
```
✅ Password reset email sent to usuario@email.com
```

---

## 🎉 Pronto!

Se o teste rápido funcionou, está tudo OK! 

**O que foi corrigido:**
1. ✅ Admin edita → Frontend atualiza
2. ✅ Email de recuperação configurável

Continue usando normalmente! 🚀
