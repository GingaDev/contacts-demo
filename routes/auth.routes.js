import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { flash } from '../auth.js';


const router = express.Router();


router.get('/login', (req, res) => {
    res.render('login', { title: 'Entrar' });
});


router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email?.trim());
    if (!user) {
        flash(req, 'error', 'Credenciais inválidas.');
        return res.redirect('/login');
    }
    const ok = bcrypt.compareSync(String(password || ''), user.password_hash);
    if (!ok) {
        flash(req, 'error', 'Credenciais inválidas.');
        return res.redirect('/login');
    }
    req.session.user = { id: user.id, email: user.email };
    return res.redirect('/');
});


router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});


router.get('/register', (req, res) => {
    res.render('register', { title: 'Registar' });
});


router.post('/register', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password || password.length < 6) {
        flash(req, 'error', 'Forneça e-mail válido e palavra‑passe (mín. 6).');
        return res.redirect('/register');
    }
    const hash = bcrypt.hashSync(String(password), 10);
    try {
        const info = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
            .run(email.trim().toLowerCase(), hash);
        req.session.user = { id: info.lastInsertRowid, email: email.trim().toLowerCase() };
        return res.redirect('/');
    } catch (e) {
        flash(req, 'error', 'E-mail já registado.');
        return res.redirect('/register');
    }
});


export default router;