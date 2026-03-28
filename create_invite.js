const { db } = require('./database');
db.run("INSERT INTO invites (invite_code, is_used) VALUES ('LGINV-MASTER', 0)", (err) => {
    if (err) console.error(err);
    else console.log("Invite Created: LGINV-MASTER");
});
