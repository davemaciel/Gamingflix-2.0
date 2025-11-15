FROM node:18-alpine

WORKDIR /app

# Instala dependências necessárias
RUN apk add --no-cache tzdata

# Copia arquivos de dependências
COPY package*.json ./

# Instala dependências
RUN npm ci --only=production

# Copia o código da aplicação
COPY . .

# Cria diretório para logs
RUN mkdir -p logs

# Expõe a porta da aplicação
EXPOSE 3000

# Define variáveis de ambiente
ENV NODE_ENV=production
ENV TZ=America/Sao_Paulo

# Inicia a aplicação
CMD ["node", "src/index.js"]