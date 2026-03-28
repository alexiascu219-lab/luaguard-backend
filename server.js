const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./database');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'luaguard_default_secret_321';
const JWT_SECRET = process.env.JWT_SECRET || 'luaguard_jwt_super_secret_key';

app.use(cors());
app.use(bodyParser.json());

// Apply Health route for Railway
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'LuaGuard Multi-Tenant API' }));

// ─── AUTHENTICATION MIDDLEWARE ──────────────────────────────
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"
    
    if (token == null) return res.status(401).json({ success: false, message: "Token required." });
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: "Invalid or expired token." });
        req.user = user;
        next();
    });
}

// ─── ADMIN ENDPOINTS ──────────────────────────────────────────
// Generate a Sellix Key (Invite Code) for new developers
app.post('/api/admin/invite', async (req, res) => {
    // Basic master password protecting invite generation
    if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ success: false, message: "Unauthorized admin." });
    }
    const invite_code = `LGINV-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    await db.run("INSERT INTO invites (invite_code) VALUES (?)", [invite_code]);
    res.json({ success: true, invite_code });
});

// ─── PUBLIC ENDPOINTS (AUTH & VALIDATION) ───────────────────

// Register Developer (Customer)
app.post('/api/auth/register', async (req, res) => {
    const { username, password, invite_code } = req.body;
    if (!username || !password || !invite_code) return res.status(400).json({ success: false, message: "Username, password, and Invite Code required." });

    try {
        // Validate invite code
        const invite = await db.get("SELECT * FROM invites WHERE invite_code = ? AND is_used = 0", [invite_code]);
        if (!invite) return res.status(400).json({ success: false, message: "Invalid or already used Invite Code." });

        const password_hash = await bcrypt.hash(password, 10);
        const api_key = 'LG_API_' + crypto.randomBytes(16).toString('hex');

        // Insert user and mark invite as used
        await db.run("INSERT INTO users (username, password_hash, api_key) VALUES (?, ?, ?)", [username, password_hash, api_key]);
        await db.run("UPDATE invites SET is_used = 1 WHERE id = ?", [invite.id]);

        res.json({ success: true, message: "Account created! Save your API key.", api_key });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, message: "Username already exists or database error." });
    }
});

// Login Developer
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);
        if (!user) return res.status(400).json({ success: false, message: "Invalid credentials." });

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(400).json({ success: false, message: "Invalid credentials." });

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ success: true, token, api_key: user.api_key });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error." });
    }
});

// Validate Key (Used by Lua Loaders in Roblox)
app.post('/validate-key', async (req, res) => {
    const { key, hwid } = req.body;
    if (!key || !hwid) return res.status(400).json({ success: false, message: "Key and HWID required." });

    try {
        const keyData = await db.get(`
            SELECT k.*, s.script_body 
            FROM keys k
            JOIN scripts s ON k.script_id = s.id
            WHERE k.key_value = ?
        `, [key]);

        if (!keyData) return res.status(404).json({ success: false, message: "Invalid key." });
        
        // Expiration Logic
        if (keyData.expires_at) {
            const now = new Date();
            const expires = new Date(keyData.expires_at);
            if (now > expires) {
                await db.run("UPDATE keys SET status = 'expired' WHERE id = ?", [keyData.id]);
                return res.status(403).json({ success: false, message: "Key expired. Please generate a new one via the Gateway." });
            }
        }
        
        if (keyData.status !== "active") return res.status(403).json({ success: false, message: "Key is inactive." });

        // HWID Locking
        if (keyData.hwid === null) {
            await db.run("UPDATE keys SET hwid = ? WHERE id = ?", [hwid, keyData.id]);
            console.log(`[AUTH] Key ${key} bound to HWID ${hwid}`);
        } else if (keyData.hwid !== hwid) {
            return res.status(403).json({ success: false, message: "HWID mismatch. Locked to another device." });
        }

        await db.run("INSERT INTO analytics (key_id, event_type) VALUES (?, ?)", [keyData.id, 'validation_success']);
        
        // Base64 encode the script for the loader (easier for V1 testing in Roblox than AES)
        const encodedScript = Buffer.from(keyData.script_body).toString('base64');

        res.json({ success: true, message: "Access granted.", payload: encodedScript, isEncrypted: false });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

// End-User Gateway Complete (Simulates returning from Work.ink)
app.post('/api/gateway/complete', async (req, res) => {
    const { script_id, hwid } = req.body;
    if (!script_id || !hwid) return res.status(400).json({ success: false, message: "Script ID and HWID required." });

    try {
        const script = await db.get("SELECT * FROM scripts WHERE id = ?", [script_id]);
        if (!script) return res.status(404).json({ success: false, message: "Script not found." });

        // Generate Expiration Time
        const durationHours = script.key_duration_hours || 24;
        const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();
        const keyValue = `LGPUB-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        await db.run("INSERT INTO keys (script_id, key_value, hwid, expires_at) VALUES (?, ?, ?, ?)", [script.id, keyValue, hwid, expiresAt]);
        res.json({ success: true, message: "Key generated successfully.", key: keyValue, expires_at: expiresAt });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to generate key." });
    }
});

// Sellix Webhook (Multi-Tenant)
app.post('/sellix-webhook', async (req, res) => {
    const { event, data } = req.body;
    
    // Developer should pass their LG_API_KEY inside the Sellix product custom fields or webhook arguments
    // For this MVP, we assume it's passed in data.custom_fields.luaguard_api_key or data.product_id mapping
    const developerApiKey = data?.custom_fields?.luaguard_api_key || req.query.api_key;
    const targetScriptId = data?.custom_fields?.script_id || req.query.script_id;

    if (!developerApiKey || !targetScriptId) {
        return res.status(400).send("Missing api_key or script_id mapping.");
    }

    if (event === 'order:paid') {
        const orderId = data.uniqid;
        const newKey = `LG-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        try {
            // Verify developer exists
            const developer = await db.get("SELECT id FROM users WHERE api_key = ?", [developerApiKey]);
            if (!developer) return res.status(403).send("Invalid developer api_key.");

            // Verify script belongs to developer
            const script = await db.get("SELECT id FROM scripts WHERE id = ? AND user_id = ?", [targetScriptId, developer.id]);
            if (!script) return res.status(403).send("Script not found or unauthorized.");

            // Generate Key
            await db.run("INSERT INTO keys (script_id, key_value) VALUES (?, ?)", [script.id, newKey]);
            console.log(`[MONETIZATION] Key ${newKey} auto-generated for Developer ID: ${developer.id}`);
            res.json({ success: true, key: newKey });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Failed to generate key." });
        }
    } else {
        res.status(200).send('Event ignored');
    }
});

// ─── PROTECTED ENDPOINTS (DASHBOARD) ─────────────────────────

// Get Developer Scripts
app.get('/api/scripts', authenticateToken, async (req, res) => {
    try {
        const scripts = await db.all("SELECT id, name, created_at FROM scripts WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);
        res.json({ success: true, scripts });
    } catch (err) {
        res.status(500).json({ success: false, message: "Database error." });
    }
});

// Create Developer Script
app.post('/api/scripts/create', authenticateToken, async (req, res) => {
    const { name, script_body } = req.body;
    if (!name || !script_body) return res.status(400).json({ success: false, message: "Name and script body required." });

    try {
        // Optional: Obfuscate here before saving
        await db.run("INSERT INTO scripts (user_id, name, script_body) VALUES (?, ?, ?)", [req.user.id, name, script_body]);
        res.json({ success: true, message: "Script created successfully." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Database error." });
    }
});

// Get Developer Keys
app.get('/api/keys', authenticateToken, async (req, res) => {
    try {
        const allKeys = await db.all(`
            SELECT k.id, k.key_value, k.hwid, k.status, k.created_at, s.name as script_name
            FROM keys k
            JOIN scripts s ON k.script_id = s.id
            WHERE s.user_id = ?
            ORDER BY k.created_at DESC
        `, [req.user.id]);
        res.json({ success: true, keys: allKeys });
    } catch (err) {
        res.status(500).json({ success: false, message: "Database error." });
    }
});

// Generate Manual Key
app.post('/api/keys/generate', authenticateToken, async (req, res) => {
    const { script_id, custom_key } = req.body;
    if (!script_id) return res.status(400).json({ success: false, message: "Target script ID required." });

    const keyVal = custom_key || `LG-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    try {
        // Verify script belongs to user
        const script = await db.get("SELECT id FROM scripts WHERE id = ? AND user_id = ?", [script_id, req.user.id]);
        if (!script) return res.status(403).json({ success: false, message: "Unauthorized script." });

        await db.run("INSERT INTO keys (script_id, key_value) VALUES (?, ?)", [script_id, keyVal]);
        res.json({ success: true, key: keyVal });
    } catch (err) {
        res.status(400).json({ success: false, message: "Key already exists or database error." });
    }
});

// Get Developer Analytics
app.get('/api/analytics', authenticateToken, async (req, res) => {
    try {
        const stats = await db.all(`
            SELECT a.event_type, COUNT(*) as count, DATE(a.timestamp) as date 
            FROM analytics a
            JOIN keys k ON a.key_id = k.id
            JOIN scripts s ON k.script_id = s.id
            WHERE s.user_id = ?
            GROUP BY a.event_type, DATE(a.timestamp)
        `, [req.user.id]);
        res.json({ success: true, stats });
    } catch (err) {
        res.status(500).json({ success: false, message: "Database error." });
    }
});

app.listen(PORT, () => {
    console.log(`LuaGuard Multi-Tenant Backend running at http://localhost:${PORT}`);
});
