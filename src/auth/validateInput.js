// Client-side validation + sanitization for login form inputs.
//
// This is a defense-in-depth layer. The backend MUST still escape parameters
// and use parameterized queries. These helpers ensure:
//  - required fields are non-empty
//  - emoji and non-printable characters are rejected (Unicode property escapes)
//  - characters commonly abused in SQL injection payloads are stripped
//
// We intentionally keep the allowed character set restrictive for usernames
// (letters, digits, dot, underscore, hyphen) and passwords (any printable
// ASCII except SQL meta-characters).

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 32;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

// Matches a single emoji or pictographic symbol.
// eslint-disable-next-line no-misleading-character-class
const EMOJI_REGEX = /[\p{Extended_Pictographic}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

// Control characters and zero-width characters often used to smuggle past
// naive validation. We reject these outright.
const CONTROL_REGEX = /[\u0000-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/;

// Disallow characters that are unusual in real usernames and frequently used
// in SQL injection payloads: quotes, backticks, semicolons, comment markers,
// and SQL operator punctuation. The backend should still use parameterized
// queries, but stripping these on the client makes attacks much harder.
const SQL_META_REGEX = /["'`;\\]|--|\/\*|\*\/|\b(?:OR|AND)\b\s*\d+\s*=\s*\d+/i;

export function validateUsername(raw) {
    const errors = [];
    if (raw == null || String(raw).length === 0) {
        return { ok: false, value: '', errors: ['Username is required.'] };
    }
    const value = String(raw).trim();

    if (value.length < USERNAME_MIN) {
        errors.push(`Username must be at least ${USERNAME_MIN} characters.`);
    }
    if (value.length > USERNAME_MAX) {
        errors.push(`Username must be at most ${USERNAME_MAX} characters.`);
    }
    if (CONTROL_REGEX.test(value)) {
        errors.push('Username contains invalid control characters.');
    }
    if (EMOJI_REGEX.test(value)) {
        errors.push('Emoji are not allowed in the username.');
    }
    if (SQL_META_REGEX.test(value)) {
        errors.push('Username contains characters that are not allowed.');
    }
    if (!/^[A-Za-z0-9._@-]+$/.test(value)) {
        errors.push('Username may only contain letters, digits, dot, underscore, hyphen, or @.');
    }
    return { ok: errors.length === 0, value, errors };
}

export function validatePassword(raw) {
    const errors = [];
    if (raw == null || String(raw).length === 0) {
        return { ok: false, value: '', errors: ['Password is required.'] };
    }
    const value = String(raw);
    if (value.length < PASSWORD_MIN) {
        errors.push(`Password must be at least ${PASSWORD_MIN} characters.`);
    }
    if (value.length > PASSWORD_MAX) {
        errors.push(`Password must be at most ${PASSWORD_MAX} characters.`);
    }
    if (CONTROL_REGEX.test(value)) {
        errors.push('Password contains invalid control characters.');
    }
    if (EMOJI_REGEX.test(value)) {
        errors.push('Emoji are not allowed in the password.');
    }
    if (SQL_META_REGEX.test(value)) {
        errors.push('Password contains characters that are not allowed.');
    }
    if (/[\r\n\t]/.test(value)) {
        errors.push('Password may not contain line breaks or tabs.');
    }
    return { ok: errors.length === 0, value, errors };
}

export function validateCredentials(username, password) {
    const u = validateUsername(username);
    const p = validatePassword(password);
    return {
        ok: u.ok && p.ok,
        username: u.value,
        password: p.value,
        errors: [...u.errors, ...p.errors],
    };
}