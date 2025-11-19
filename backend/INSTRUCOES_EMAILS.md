# 📧 Padronização de Emails com Logo

## ✅ O que precisa ser feito:

### 1. **Hospedar a Logo**
A logo precisa estar acessível publicamente via URL. Opções:

**Opção A: Usar CDN (Recomendado)**
- Upload para Imgur: https://imgur.com/upload
- Ou usar Cloudinary: https://cloudinary.com/
- Copiar URL pública da imagem

**Opção B: Usar o próprio frontend**
- Colocar logo em `public/logo.png` no frontend
- URL será: `https://ultimate.gamingflix.space/logo.png`

### 2. **Atualizar .env**
```bash
# Já adicionado:
LOGO_URL=https://ultimate.gamingflix.space/logo.png
```

Substituir pela URL real da logo hospedada.

### 3. **Emails que serão padronizados**:

✅ **Recuperação de Senha** - Com logo e tema dark
✅ **Senha Alterada** - Com logo e tema dark  
✅ **Bem-vindo** - Com logo
✅ **Assinatura Ativada** - Com logo
✅ **Assinatura Expirando** - Com logo

## 🎨 Padrão de Branding:

- **Header**: Logo centralizada + título do email
- **Tema**: Dark mode (#1a1a1a fundo, #ef4444 vermelho)
- **Footer**: Logo menor + texto automático
- **Consistência**: Todos emails com mesmo visual

## 🚀 Próximos Passos:

1. Hospedar logo (ver opções acima)
2. Atualizar `LOGO_URL` no `.env` com URL real
3. Eu farei as alterações no código

## 📝 Alternativa Rápida:

Se quiser, posso usar a logo em Base64 inline (sem precisar hospedar), mas o email ficará um pouco maior.
