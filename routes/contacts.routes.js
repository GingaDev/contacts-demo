import express from 'express';
import { db } from '../db.js';
import { ensureAuth, flash } from '../auth.js';
import {
    isValidName,
    isValidBirthDate,
    isValidSex,
    isValidEmailOptional,
    isValidNotes,
    parseLinks,
    validateLinks,
} from '../validations.js';

const router = express.Router();
//if (!validateLinks(links)) {
 //   flash(req, 'error', 'Cada link deve começar com http:// ou https://');
 //   return res.redirect(`/contacts/${id}/edit`);
//}


const owner = db.prepare('SELECT id FROM contacts WHERE id = ? AND user_id = ?').get(id, req.session.user.id);
if (!owner) {
    flash(req, 'error', 'Contato não encontrado.');
    return res.redirect('/');
}


const tx = db.transaction(() => {
    db.prepare(`UPDATE contacts SET first_name=?, last_name=?, birth_date=?, sex=?, email=?, notes=? WHERE id=?`)
        .run(
            first_name.trim(),
            last_name.trim(),
            birth_date,
            sex,
            email?.trim() || null,
            notes?.trim() || null,
            id
        );
    db.prepare('DELETE FROM contact_links WHERE contact_id = ?').run(id);
    const ins = db.prepare('INSERT INTO contact_links (contact_id, url) VALUES (?, ?)');
    links.forEach(u => ins.run(id, u));
});
tx();


flash(req, 'success', 'Contato atualizado.');
    return res.redirect('/');


// Excluir
router.post('/:id/delete', (req, res) => {
    const id = Number(req.params.id);
    const owner = db.prepare('SELECT id FROM contacts WHERE id = ? AND user_id = ?').get(id, req.session.user.id);
    if (!owner) {
        flash(req, 'error', 'Contato não encontrado.');
        return res.redirect('/');
    }
    const tx = db.transaction(() => {
        db.prepare('DELETE FROM contact_links WHERE contact_id = ?').run(id);
        db.prepare('DELETE FROM contacts WHERE id = ?').run(id);
    });
    tx();
    flash(req, 'success', 'Contato removido.');
    return res.redirect('/');
});


// Like/Dislike
router.post('/:id/like', (req, res) => {
    const id = Number(req.params.id);
    const owner = db.prepare('SELECT id FROM contacts WHERE id = ? AND user_id = ?').get(id, req.session.user.id);
    if (!owner) {
        flash(req, 'error', 'Contato não encontrado.');
        return res.redirect('/');
    }
    db.prepare('UPDATE contacts SET likes = likes + 1 WHERE id = ?').run(id);
    return res.redirect('/');
});


router.post('/:id/dislike', (req, res) => {
    const id = Number(req.params.id);
    const owner = db.prepare('SELECT id FROM contacts WHERE id = ? AND user_id = ?').get(id, req.session.user.id);
    if (!owner) {
        flash(req, 'error', 'Contato não encontrado.');
        return res.redirect('/');
    }
    db.prepare('UPDATE contacts SET likes = likes - 1 WHERE id = ?').run(id);
    return res.redirect('/');
});


export default router;