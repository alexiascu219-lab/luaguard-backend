const db = require('./database');

async function seed() {
    console.log("Seeding LuaGuard Database...");
    try {
        await db.run("INSERT OR IGNORE INTO keys (key_value, script_body) VALUES (?, ?)", 
            ["SECURE-KEY-777", "print('LuaGuard: Decryption Success! This script was sent encrypted.')"]);
        
        await db.run("INSERT OR IGNORE INTO keys (key_value, script_body) VALUES (?, ?)", 
            ["PREMIUM-KEY-999", "print('Welcome, Premium LuaGuard User!')"]);
            
        console.log("Seeding complete.");
    } catch (err) {
        console.error("Seeding failed:", err);
    }
}

seed();
