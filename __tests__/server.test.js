/* eslint-disable jest/expect-expect */
const fs = require('fs');
const path = require('path');
const request = require('supertest');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(process.cwd(), 'database.sqlite');

function removeDbIfExists() {
  try {
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
  } catch (e) {
    // ignore
  }
}

// Wait until the default admin user exists (created by initDatabase in server.js)
// Replace waitForDefaultUser with this:
function waitForAppReady(timeoutMs = 10000) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const tick = () => {
      const db = new sqlite3.Database(DB_PATH);

      // 1) Ensure tables exist
      db.get(
        "SELECT COUNT(*) AS cnt FROM sqlite_master WHERE type='table' AND name IN ('users','contacts')",
        (err, row) => {
          if (err) {
            db.close();
            if (Date.now() - start > timeoutMs) return reject(err);
            return setTimeout(tick, 100);
          }

          if (!row || row.cnt < 2) {
            db.close();
            if (Date.now() - start > timeoutMs) return reject(new Error('Timed out waiting for tables'));
            return setTimeout(tick, 100);
          }

          // 2) Now wait for the default user
          db.get(
            'SELECT id FROM users WHERE email=?',
            ['admin@teste.com'],
            (err2, row2) => {
              db.close();
              if (err2) {
                if (Date.now() - start > timeoutMs) return reject(err2);
                return setTimeout(tick, 100);
              }
              if (row2) return resolve(true);

              if (Date.now() - start > timeoutMs) return reject(new Error('Timed out waiting for default user'));
              setTimeout(tick, 100);
            }
          );
        }
      );
    };

    tick();
  });
}

let app;          // the Express app (module.exports)
let agent;        // supertest agent (persists cookie/session)
let createdId;    // contact id to reuse across tests

beforeAll(async () => {
  removeDbIfExists();
  app = require('../server');
  await waitForAppReady();   // ⬅️ new
  agent = request.agent(app);
}, 20000); // optional: extend jest timeout

afterAll(() => {
  // Close app if it was started by tests (it isn’t listening here, so nothing to close)
  // Clean up DB file
  removeDbIfExists();
});

describe('Auth & session', () => {
  test('GET / without auth redirects to /login', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/login');
  });

  test('GET /login returns login page', async () => {
    const res = await request(app).get('/login');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/Sistema de Contatos/);
    expect(res.text).toMatch(/<form action="\/login" method="POST"/);
  });

  test('POST /login with wrong credentials shows alert', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'admin@teste.com', password: 'wrong' })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/E-mail ou senha incorretos/);
  });

  test('POST /login with correct credentials redirects to /', async () => {
    const res = await agent
      .post('/login')
      .send({ email: 'admin@teste.com', password: '123456' })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/');
  });

  test('GET / after login shows main page with user email', async () => {
    const res = await agent.get('/');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/Sistema de Contatos/);
    expect(res.text).toMatch(/Logado como: admin@teste\.com/);
  });
});

describe('Contacts API (requires auth)', () => {
  test('POST /api/contacts validates fields', async () => {
    const res = await agent
      .post('/api/contacts')
      .send({
        // nome missing or too short
        nome: 'abc',
        sobrenome: 'Silva',
        data_nascimento: '2000-01-01',
        sexo_biologico: 'Masculino',
      })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(200);
    expect(res.body.error).toMatch(/Nome deve ter entre 4 e 256/);
  });

  test('POST /api/contacts creates a contact', async () => {
    const res = await agent
      .post('/api/contacts')
      .send({
        nome: 'Rafael',
        sobrenome: 'Schneider',
        data_nascimento: '2000-01-01',
        sexo_biologico: 'Masculino',
        email: 'rafael@example.com',
        redes_sociais: ['https://linkedin.com/in/rafael'],
        observacoes: 'Contato de teste',
      })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.id).toBe('number');
    createdId = res.body.id;
  });

  test('PUT /api/contacts/:id updates a contact', async () => {
    const res = await agent
      .put(`/api/contacts/${createdId}`)
      .send({
        nome: 'Rafael',
        sobrenome: 'Souza',
        data_nascimento: '2000-01-01',
        sexo_biologico: 'Masculino',
        email: 'rafael+upd@example.com',
        redes_sociais: ['https://x.com/rafael'],
        observacoes: 'Atualizado',
      })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/contacts/:id/like increments likes', async () => {
    const res = await agent.post(`/api/contacts/${createdId}/like`).send({});
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/contacts/:id/dislike decrements likes', async () => {
    const res = await agent.post(`/api/contacts/${createdId}/dislike`).send({});
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('DELETE /api/contacts/:id deletes the contact', async () => {
    const res = await agent.delete(`/api/contacts/${createdId}`).send({});
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('DELETE /api/contacts/:id for missing contact returns error', async () => {
    const res = await agent.delete(`/api/contacts/999999`).send({});
    expect(res.status).toBe(200);
    expect(res.body.error).toMatch(/Contato não encontrado/);
  });
});

describe('Auth middleware protects endpoints', () => {
  test('API returns redirect when unauthenticated', async () => {
    const res = await request(app).post('/api/contacts').send({}); // not using agent here
    // requireAuth redirects to /login for HTML routes, but for API it still does redirect since it’s middleware
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/login');
  });
});