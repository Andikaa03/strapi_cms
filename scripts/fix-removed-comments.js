const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../.tmp/data.db'));

const info = db.prepare('UPDATE plugin_comments_comments SET removed = 0 WHERE removed = 1').run();
console.log('Rows fixed (removed reset to false):', info.changes);

const cols = db.prepare('PRAGMA table_info(plugin_comments_comments)').all().map(c => c.name);
console.log('Columns:', cols.join(', '));
const rows = db.prepare('SELECT id, removed, approval_status FROM plugin_comments_comments ORDER BY id').all();
console.log('Current state of all comments:');
rows.forEach(r => console.log(`  id=${r.id}  removed=${r.removed}  approvalStatus=${r.approvalStatus}`));

db.close();
