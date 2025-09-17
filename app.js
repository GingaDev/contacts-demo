import express from 'express';
import session from 'express-session';
import path from 'path';
import methodOverride from 'method-override';
import { fileURLToPath } from 'url';


import authRoutes from './routes/auth.routes.js';
import contactRoutes from './routes/contacts.routes.js';
import { setLocals, ensureAuth } from './auth.js';
import './db.js'; // garante que o schema existe


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));


app.use(
    session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 1000 * 60 * 60 * 8 }
    })
);


app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(setLocals);


// Rotas
app.use(authRoutes);
app.use('/contacts', contactRoutes);


// Home -> lista de contatos (protegido)
app.get('/', ensureAuth, (req, res) => res.redirect('/contacts'));


// 404
app.use((req, res) => {
    res.status(404).render('layout', {
        title: 'Não encontrado',
        body: `<div class="container"><h2>404</h2><p>Página não encontrada.</p></div>`
    });
});


app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});