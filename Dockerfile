FROM cgr.dev/chainguard/node:latest

# Criar diretório da aplicação
WORKDIR /usr/src/app

# Copiar arquivos de dependência
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código da aplicação
COPY server.js .
COPY public ./public


# Criar diretório para o banco de dados
RUN mkdir -p /usr/src/app/data

# Expor porta
EXPOSE 3000

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar a aplicação
# O entrypoint da imagem base já é "node", então só precisamos passar o script.
CMD ["server.js"]