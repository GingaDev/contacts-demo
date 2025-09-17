export function ensureAuth(req, res, next) {
    if (req.session && req.session.user) return next();
    return res.redirect('/login');
}


export function setLocals(req, res, next) {
    res.locals.currentUser = req.session?.user || null;
    res.locals.flash = req.session?.flash || null;
    delete req.session?.flash;
    next();
}


export function flash(req, type, message) {
    req.session.flash = { type, message };
}