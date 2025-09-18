# Sistema de Contatos

Sistema completo de cadastro de contatos desenvolvido em Node.js com SQLite, incluindo autenticação e operações CRUD.

## Funcionalidades

- ✅ Autenticação de usuários (login/logout)
- ✅ CRUD completo de contatos
- ✅ Sistema de likes/dislikes
- ✅ Validações de dados conforme especificação
- ✅ Interface responsiva e intuitiva
- ✅ Banco de dados SQLite embarcado

## Tecnologias

- **Backend**: Node.js + Express
- **Frontend**: HTML, CSS, JavaScript (integrado)
- **Banco de Dados**: SQLite
- **Autenticação**: Express Session + bcrypt
- **Containerização**: Docker

## Estrutura do Projeto

```
sistema-contatos/
├── server.js           # Servidor principal
├── package.json        # Dependências
├── Dockerfile         # Configuração Docker
├── docker-compose.yml # Orquestração Docker
├── .dockerignore     # Arquivos ignorados pelo Docker
├── README.md         # Este arquivo
├── public/
│   └── styles.css    # Estilos CSS
└── data/             # Diretório para o banco (criado automaticamente)
```

## Deploy com Docker

### Pré-requisitos
- Docker
- Docker Compose

### Passos para Deploy

1. **Clone ou extraia os arquivos do projeto**
2. **Construa e execute o container:**

```bash
# Usando docker-compose (recomendado)
docker-compose up -d

# Ou usando Docker diretamente
docker build -t sistema-contatos .
docker run -d -p 3000:3000 -v $(pwd)/data:/usr/src/app/data sistema-contatos
```

3. **Acesse a aplicação:**
   - URL: http://localhost:3000
   - Login padrão:
     - E-mail: admin@teste.com
     - Senha: 123456

### Comandos Úteis

```bash
# Ver logs da aplicação
docker-compose logs -f

# Parar a aplicação
docker-compose down

# Rebuild e restart
docker-compose up -d --build

# Acessar o container
docker-compose exec app sh
```

## Deploy sem Docker

### Pré-requisitos
- Node.js 18+
- npm

### Passos

1. **Instale as dependências:**
```bash
npm install
```

2. **Execute a aplicação:**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

3. **Acesse:** http://localhost:3000

## Configuração de Produção

### Variáveis de Ambiente

Você pode configurar as seguintes variáveis:

```bash
NODE_ENV=production
PORT=3000
```

### Proxy Reverso (Nginx)

Para produção, recomenda-se usar um proxy reverso:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Backup do Banco de Dados

O banco SQLite fica em:
- **Desenvolvimento**: `./database.sqlite`
- **Docker**: `./data/database.sqlite`

Para backup:
```bash
# Copiar arquivo do banco
cp ./data/database.sqlite ./backup-$(date +%Y%m%d).sqlite
```

## Monitoramento

A aplicação inclui um healthcheck que verifica:
- Status HTTP 200 na rota `/login`
- Intervalo: 30 segundos
- Timeout: 10 segundos
- Tentativas: 3

## Solução de Problemas

### Porta já em uso
```bash
# Verificar processos na porta 3000
lsof -i :3000

# Mudar porta via variável de ambiente
PORT=8080 npm start
```

### Problemas de permissão (Docker)
```bash
# Ajustar permissões do diretório data
sudo chown -R $(id -u):$(id -g) ./data
```

### Reset do banco de dados
```bash
# Parar aplicação
docker-compose down

# Remover banco
rm -f ./data/database.sqlite

# Reiniciar
docker-compose up -d
```

## Funcionalidades do Sistema

### Autenticação
- Login com e-mail e senha
- Sessões seguras
- Logout automático

### Gestão de Contatos
- **Campos obrigatórios**: Nome, Sobrenome, Data de Nascimento, Sexo
- **Campos opcionais**: E-mail, Redes Sociais, Observações
- **Validações**: Idade mínima 18 anos, formatos válidos
- **Ações**: Criar, Editar, Excluir, Like/Dislike

### Interface
- Design responsivo
- Formulários validados
- Confirmações de ação
- Feedback visual

## Suporte

Para problemas ou dúvidas:
1. Verifique os logs: `docker-compose logs -f`
2. Confirme que todas as dependências estão instaladas
3. Verifique se a porta 3000 está disponível

---

**Versão**: 1.0.0  
**Desenvolvido**: Sistema monolítico Node.js  
**Licença**: MIT
