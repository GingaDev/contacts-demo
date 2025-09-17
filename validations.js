// Regras do documento: nomes 4..256, notes <=512, birth_date AAAA-MM-DD e >=18 anos, email opcional válido, sex enum


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i; // simples (RFC 5322 simplificado)
const URL_REGEX = /^https?:\/\//i;


export function isValidName(s) {
    return typeof s === 'string' && s.trim().length >= 4 && s.trim().length <= 256;
}


export function isValidBirthDate(birth) {
    if (typeof birth !== 'string') return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birth)) return false;
    const d = new Date(birth + 'T00:00:00Z');
    if (Number.isNaN(d.getTime())) return false;
    // >= 18 anos
    const now = new Date();
    const eighteen = new Date(
        now.getUTCFullYear() - 18,
        now.getUTCMonth(),
        now.getUTCDate()
    );
    return d <= eighteen;
}


export function isValidSex(v) {
    return v === 'Masculino' || v === 'Feminino';
}


export function isValidEmailOptional(v) {
    if (!v) return true; // opcional
    return EMAIL_REGEX.test(String(v).trim());
}


export function isValidNotes(v) {
    return !v || String(v).length <= 512;
}


export function parseLinks(multiline) {
    if (!multiline) return [];
    return String(multiline)
        .split(/\r?\n/)
        .map(s => s.trim())
        .filter(Boolean);
}


export function validateLinks(list) {
    return list.every(u => URL_REGEX.test(u));
}