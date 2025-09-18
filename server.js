// ================================
// server.js - Servidor Principal
// ================================
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'sistema-contatos-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

// Configuração do banco de dados
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Erro ao conectar com o banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco SQLite');
    initDatabase();
  }
});

// Inicialização das tabelas
function initDatabase() {
  // Tabela de usuários
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela de contatos
  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    sobrenome TEXT NOT NULL,
    data_nascimento DATE NOT NULL,
    sexo_biologico TEXT NOT NULL,
    email TEXT,
    redes_sociais TEXT,
    observacoes TEXT,
    likes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Criar usuário padrão para teste
  const defaultEmail = 'admin@teste.com';
  const defaultPassword = bcrypt.hashSync('123456', 10);
  
  db.get('SELECT id FROM users WHERE email = ?', [defaultEmail], (err, row) => {
    if (!row) {
      db.run('INSERT INTO users (email, password) VALUES (?, ?)', 
        [defaultEmail, defaultPassword], (err) => {
          if (!err) {
            console.log('Usuário padrão criado: admin@teste.com / 123456');
          }
      });
    }
  });
}

// Middleware de autenticação
function requireAuth(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
}

// ================================
// ROTAS DE AUTENTICAÇÃO
// ================================

// Página de login
app.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/');
  }
  
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login - Sistema de Contatos</title>
        <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
        <div class="auth-container">
            <div class="auth-card">
                <h1>Sistema de Contatos</h1>
                <form action="/login" method="POST" class="auth-form">
                    <div class="form-group">
                        <label for="email">E-mail:</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Senha:</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit" class="btn-primary">Entrar</button>
                </form>
                <div class="auth-info">
                    <p><strong>Usuário de teste:</strong></p>
                    <p>E-mail: admin@teste.com</p>
                    <p>Senha: 123456</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `);
});

// Processar login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.send(`
        <script>
          alert('E-mail ou senha incorretos!');
          window.location.href = '/login';
        </script>
      `);
    }
    
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    res.redirect('/');
  });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao fazer logout' });
    }
    res.redirect('/login');
  });
});

// ================================
// ROTAS PRINCIPAIS
// ================================

// Página inicial - Lista de contatos
app.get('/', requireAuth, (req, res) => {
  db.all('SELECT * FROM contacts WHERE user_id = ? ORDER BY created_at DESC', 
    [req.session.userId], (err, contacts) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar contatos' });
      }
      
      res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sistema de Contatos</title>
            <link rel="stylesheet" href="/styles.css">
        </head>
        <body>
            <div class="container">
                <header class="header">
                    <h1>Sistema de Contatos</h1>
                    <div class="header-actions">
                        <span>Logado como: ${req.session.userEmail}</span>
                        <a href="/novo-contato" class="btn-primary">Novo Contato</a>
                        <a href="/logout" class="btn-secondary">Sair</a>
                    </div>
                </header>
                
                <main class="main-content">
                    ${contacts.length === 0 ? 
                      '<div class="empty-state">Nenhum contato cadastrado. <a href="/novo-contato">Criar primeiro contato</a></div>' :
                      contacts.map(contact => `
                        <div class="contact-card">
                            <div class="contact-info">
                                <h3>${contact.nome} ${contact.sobrenome}</h3>
                                <p><strong>Data de Nascimento:</strong> ${new Date(contact.data_nascimento).toLocaleDateString('pt-BR')}</p>
                                <p><strong>Sexo:</strong> ${contact.sexo_biologico}</p>
                                ${contact.email ? `<p><strong>E-mail:</strong> ${contact.email}</p>` : ''}
                                ${contact.redes_sociais ? `
                                    <p><strong>Redes Sociais:</strong></p>
                                    <div class="social-links">
                                        ${JSON.parse(contact.redes_sociais || '[]').map(url => `
                                            <a href="${url}" target="_blank" class="social-link">${url}</a>
                                        `).join('')}
                                    </div>
                                ` : ''}
                                ${contact.observacoes ? `<p><strong>Observações:</strong> ${contact.observacoes}</p>` : ''}
                            </div>
                            <div class="contact-actions">
                                <div class="likes-section">
                                    <button onclick="likeContact(${contact.id})" class="btn-like">👍 ${contact.likes}</button>
                                    <button onclick="dislikeContact(${contact.id})" class="btn-dislike">👎</button>
                                </div>
                                <div class="action-buttons">
                                    <a href="/editar-contato/${contact.id}" class="btn-edit">Editar</a>
                                    <button onclick="deleteContact(${contact.id})" class="btn-delete">Excluir</button>
                                </div>
                            </div>
                        </div>
                      `).join('')
                    }
                </main>
            </div>
            
            <script>
                function likeContact(id) {
                    fetch(\`/api/contacts/\${id}/like\`, { method: 'POST' })
                        .then(response => response.json())
                        .then(() => location.reload());
                }
                
                function dislikeContact(id) {
                    fetch(\`/api/contacts/\${id}/dislike\`, { method: 'POST' })
                        .then(response => response.json())
                        .then(() => location.reload());
                }
                
                function deleteContact(id) {
                    if (confirm('Tem certeza que deseja excluir este contato?')) {
                        fetch(\`/api/contacts/\${id}\`, { method: 'DELETE' })
                            .then(response => response.json())
                            .then(() => location.reload());
                    }
                }
            </script>
        </body>
        </html>
      `);
    });
});

// ================================
// ROTAS DE CONTATOS
// ================================

// Página de novo contato
app.get('/novo-contato', requireAuth, (req, res) => {
  res.send(getContactFormHTML('Novo Contato', '/api/contacts', 'POST'));
});

// Página de editar contato
app.get('/editar-contato/:id', requireAuth, (req, res) => {
  const contactId = req.params.id;
  
  db.get('SELECT * FROM contacts WHERE id = ? AND user_id = ?', 
    [contactId, req.session.userId], (err, contact) => {
      if (err || !contact) {
        return res.redirect('/');
      }
      
      res.send(getContactFormHTML('Editar Contato', `/api/contacts/${contactId}`, 'PUT', contact));
    });
});

// Função helper para gerar formulário
function getContactFormHTML(title, action, method, contact = {}) {
  const redesSociais = contact.redes_sociais ? JSON.parse(contact.redes_sociais) : [''];
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - Sistema de Contatos</title>
        <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
        <div class="container">
            <header class="header">
                <h1>${title}</h1>
                <a href="/" class="btn-secondary">Voltar</a>
            </header>
            
            <form class="contact-form" onsubmit="submitForm(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label for="nome">Nome *</label>
                        <input type="text" id="nome" name="nome" required 
                               minlength="4" maxlength="256" value="${contact.nome || ''}">
                    </div>
                    <div class="form-group">
                        <label for="sobrenome">Sobrenome *</label>
                        <input type="text" id="sobrenome" name="sobrenome" required 
                               minlength="4" maxlength="256" value="${contact.sobrenome || ''}">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="data_nascimento">Data de Nascimento *</label>
                        <input type="date" id="data_nascimento" name="data_nascimento" required 
                               value="${contact.data_nascimento || ''}">
                    </div>
                    <div class="form-group">
                        <label for="sexo_biologico">Sexo Biológico *</label>
                        <select id="sexo_biologico" name="sexo_biologico" required>
                            <option value="">Selecione</option>
                            <option value="Masculino" ${contact.sexo_biologico === 'Masculino' ? 'selected' : ''}>Masculino</option>
                            <option value="Feminino" ${contact.sexo_biologico === 'Feminino' ? 'selected' : ''}>Feminino</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="email">E-mail</label>
                    <input type="email" id="email" name="email" value="${contact.email || ''}">
                </div>
                
                <div class="form-group">
                    <label>Redes Sociais/Links</label>
                    <div id="social-links">
                        ${redesSociais.map((link, index) => `
                            <div class="social-input-group">
                                <input type="url" name="redes_sociais[]" placeholder="https://..." value="${link}">
                                <button type="button" onclick="removeSocialLink(this)">Remover</button>
                            </div>
                        `).join('')}
                    </div>
                    <button type="button" onclick="addSocialLink()">Adicionar Link</button>
                </div>
                
                <div class="form-group">
                    <label for="observacoes">Observações</label>
                    <textarea id="observacoes" name="observacoes" maxlength="512" 
                              rows="4">${contact.observacoes || ''}</textarea>
                    <small>Máximo 512 caracteres</small>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Salvar</button>
                    <a href="/" class="btn-secondary">Cancelar</a>
                </div>
            </form>
        </div>
        
        <script>
            function addSocialLink() {
                const container = document.getElementById('social-links');
                const div = document.createElement('div');
                div.className = 'social-input-group';
                div.innerHTML = \`
                    <input type="url" name="redes_sociais[]" placeholder="https://...">
                    <button type="button" onclick="removeSocialLink(this)">Remover</button>
                \`;
                container.appendChild(div);
            }
            
            function removeSocialLink(button) {
                button.parentElement.remove();
            }
            
            function submitForm(event) {
                event.preventDefault();
                
                // Validar idade mínima
                const dataNascimento = new Date(document.getElementById('data_nascimento').value);
                const hoje = new Date();
                const idade = hoje.getFullYear() - dataNascimento.getFullYear();
                const mesAtual = hoje.getMonth() - dataNascimento.getMonth();
                
                if (idade < 18 || (idade === 18 && mesAtual < 0)) {
                    alert('A idade mínima é de 18 anos.');
                    return;
                }
                
                // Coletar dados do formulário
                const formData = new FormData(event.target);
                const data = {};
                
                for (let [key, value] of formData.entries()) {
                    if (key === 'redes_sociais[]') {
                        if (!data.redes_sociais) data.redes_sociais = [];
                        if (value) data.redes_sociais.push(value);
                    } else {
                        data[key] = value;
                    }
                }
                
                fetch('${action}', {
                    method: '${method}',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        window.location.href = '/';
                    } else {
                        alert(result.error || 'Erro ao salvar contato');
                    }
                })
                .catch(error => {
                    alert('Erro ao processar solicitação');
                });
            }
        </script>
    </body>
    </html>
  `;
}

// ================================
// API ENDPOINTS
// ================================

// Criar contato
app.post('/api/contacts', requireAuth, (req, res) => {
  const { nome, sobrenome, data_nascimento, sexo_biologico, email, redes_sociais, observacoes } = req.body;
  
  // Validações
  if (!nome || nome.length < 4 || nome.length > 256) {
    return res.json({ error: 'Nome deve ter entre 4 e 256 caracteres' });
  }
  
  if (!sobrenome || sobrenome.length < 4 || sobrenome.length > 256) {
    return res.json({ error: 'Sobrenome deve ter entre 4 e 256 caracteres' });
  }
  
  if (!data_nascimento) {
    return res.json({ error: 'Data de nascimento é obrigatória' });
  }
  
  if (!sexo_biologico || !['Masculino', 'Feminino'].includes(sexo_biologico)) {
    return res.json({ error: 'Sexo biológico deve ser Masculino ou Feminino' });
  }
  
  if (observacoes && observacoes.length > 512) {
    return res.json({ error: 'Observações não podem exceder 512 caracteres' });
  }
  
  const redesSociaisJson = JSON.stringify(redes_sociais || []);
  
  db.run(
    'INSERT INTO contacts (user_id, nome, sobrenome, data_nascimento, sexo_biologico, email, redes_sociais, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [req.session.userId, nome, sobrenome, data_nascimento, sexo_biologico, email, redesSociaisJson, observacoes],
    function(err) {
      if (err) {
        return res.json({ error: 'Erro ao criar contato' });
      }
      res.json({ success: true, id: this.lastID });
    }
  );
});

// Atualizar contato
app.put('/api/contacts/:id', requireAuth, (req, res) => {
  const contactId = req.params.id;
  const { nome, sobrenome, data_nascimento, sexo_biologico, email, redes_sociais, observacoes } = req.body;
  
  // Mesmas validações do POST
  if (!nome || nome.length < 4 || nome.length > 256) {
    return res.json({ error: 'Nome deve ter entre 4 e 256 caracteres' });
  }
  
  if (!sobrenome || sobrenome.length < 4 || sobrenome.length > 256) {
    return res.json({ error: 'Sobrenome deve ter entre 4 e 256 caracteres' });
  }
  
  if (!data_nascimento) {
    return res.json({ error: 'Data de nascimento é obrigatória' });
  }
  
  if (!sexo_biologico || !['Masculino', 'Feminino'].includes(sexo_biologico)) {
    return res.json({ error: 'Sexo biológico deve ser Masculino ou Feminino' });
  }
  
  if (observacoes && observacoes.length > 512) {
    return res.json({ error: 'Observações não podem exceder 512 caracteres' });
  }
  
  const redesSociaisJson = JSON.stringify(redes_sociais || []);
  
  db.run(
    'UPDATE contacts SET nome=?, sobrenome=?, data_nascimento=?, sexo_biologico=?, email=?, redes_sociais=?, observacoes=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?',
    [nome, sobrenome, data_nascimento, sexo_biologico, email, redesSociaisJson, observacoes, contactId, req.session.userId],
    function(err) {
      if (err) {
        return res.json({ error: 'Erro ao atualizar contato' });
      }
      if (this.changes === 0) {
        return res.json({ error: 'Contato não encontrado' });
      }
      res.json({ success: true });
    }
  );
});

// Excluir contato
app.delete('/api/contacts/:id', requireAuth, (req, res) => {
  const contactId = req.params.id;
  
  db.run('DELETE FROM contacts WHERE id = ? AND user_id = ?', 
    [contactId, req.session.userId], function(err) {
      if (err) {
        return res.json({ error: 'Erro ao excluir contato' });
      }
      if (this.changes === 0) {
        return res.json({ error: 'Contato não encontrado' });
      }
      res.json({ success: true });
    });
});

// Like contato
app.post('/api/contacts/:id/like', requireAuth, (req, res) => {
  const contactId = req.params.id;
  
  db.run('UPDATE contacts SET likes = likes + 1 WHERE id = ? AND user_id = ?', 
    [contactId, req.session.userId], function(err) {
      if (err) {
        return res.json({ error: 'Erro ao dar like' });
      }
      res.json({ success: true });
    });
});

// Dislike contato
app.post('/api/contacts/:id/dislike', requireAuth, (req, res) => {
  const contactId = req.params.id;
  
  db.run('UPDATE contacts SET likes = likes - 1 WHERE id = ? AND user_id = ?', 
    [contactId, req.session.userId], function(err) {
      if (err) {
        return res.json({ error: 'Erro ao dar dislike' });
      }
      res.json({ success: true });
    });
});

// Iniciar servidor
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
  });

  const gracefulShutdown = (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed.');
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database connection closed.');
        }
        process.exit(0);
      });
    });
  };

  // Listen for termination signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

module.exports = app;

