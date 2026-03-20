import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import crypto from 'crypto';

let db;

export function initDb() {
    const dbPath = path.join(app.getPath('userData'), 'skills.db');
    db = new Database(dbPath);
    
    // Create skills table
    db.exec(`
        CREATE TABLE IF NOT EXISTS skills (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            content TEXT,
            author TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            usage_count INTEGER DEFAULT 0,
            is_local INTEGER DEFAULT 0,
            is_custom INTEGER DEFAULT 0,
            source_url TEXT,
            is_favorite INTEGER DEFAULT 0,
            linked_files TEXT
        )
    `);
    
    // Migration: Add linked_files column if it doesn't exist
    try {
        db.prepare('SELECT linked_files FROM skills LIMIT 1').get();
    } catch (e) {
        console.log('Migrating database: adding linked_files column...');
        db.exec('ALTER TABLE skills ADD COLUMN linked_files TEXT');
    }

    // Add updated_at trigger
    db.exec(`
        CREATE TRIGGER IF NOT EXISTS update_skills_timestamp 
        AFTER UPDATE ON skills
        BEGIN
            UPDATE skills SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
        END
    `);

    // Create history table
    db.exec(`
        CREATE TABLE IF NOT EXISTS history (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            root_folder_name TEXT,
            token_count INTEGER,
            char_count INTEGER,
            skills_used TEXT,
            skills_count INTEGER,
            content TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            custom_id TEXT
        )
    `);

    console.log('Database initialized at:', dbPath);
}

export function getSkills(sortField = 'created_at', sortOrder = 'DESC') {
    const validFields = ['name', 'created_at', 'updated_at', 'author', 'usage_count'];
    if (!validFields.includes(sortField)) sortField = 'created_at';
    if (!['ASC', 'DESC'].includes(sortOrder)) sortOrder = 'DESC';

    const stmt = db.prepare(`SELECT * FROM skills ORDER BY ${sortField} ${sortOrder}`);
    return stmt.all().map(skill => ({
        ...skill,
        is_local: !!skill.is_local,
        is_custom: !!skill.is_custom,
        is_favorite: !!skill.is_favorite,
        linkedFiles: skill.linked_files ? JSON.parse(skill.linked_files) : []
    }));
}

export function addSkill(skill) {
    const stmt = db.prepare(`
        INSERT OR REPLACE INTO skills (
            id, name, description, content, author, created_at, updated_at, 
            usage_count, is_local, is_custom, source_url, is_favorite, linked_files
        ) VALUES (
            @id, @name, @description, @content, @author, @created_at, @updated_at, 
            @usage_count, @is_local, @is_custom, @source_url, @is_favorite, @linked_files
        )
    `);

    return stmt.run({
        ...skill,
        source_url: skill.source_url || skill.sourceUrl || '',
        created_at: skill.created_at || new Date().toISOString(),
        updated_at: skill.updated_at || new Date().toISOString(),
        usage_count: skill.usage_count || 0,
        is_local: (skill.is_local || skill.isLocal) ? 1 : 0,
        is_custom: (skill.is_custom || skill.isCustom) ? 1 : 0,
        is_favorite: skill.is_favorite ? 1 : 0,
        linked_files: skill.linkedFiles ? JSON.stringify(skill.linkedFiles) : null
    });
}

export function updateSkill(id, patch) {
    const keys = Object.keys(patch);
    if (keys.length === 0) return;

    const sets = [];
    const values = [];

    keys.forEach(k => {
        if (k === 'linkedFiles') {
            sets.push('linked_files = ?');
            values.push(JSON.stringify(patch[k]));
        } else {
            sets.push(`${k} = ?`);
            if (typeof patch[k] === 'boolean') {
                values.push(patch[k] ? 1 : 0);
            } else {
                values.push(patch[k]);
            }
        }
    });

    const stmt = db.prepare(`UPDATE skills SET ${sets.join(', ')} WHERE id = ?`);
    return stmt.run(...values, id);
}

export function deleteSkill(id) {
    const stmt = db.prepare('DELETE FROM skills WHERE id = ?');
    return stmt.run(id);
}

export function incrementUsage(id) {
    const stmt = db.prepare('UPDATE skills SET usage_count = usage_count + 1 WHERE id = ?');
    return stmt.run(id);
}

export function bulkAddSkills(skills) {
    const insert = db.prepare(`
        INSERT OR REPLACE INTO skills (
            id, name, description, content, author, created_at, updated_at, 
            usage_count, is_local, is_custom, source_url, is_favorite, linked_files
        ) VALUES (
            @id, @name, @description, @content, @author, @created_at, @updated_at, 
            @usage_count, @is_local, @is_custom, @source_url, @is_favorite, @linked_files
        )
    `);

    const transaction = db.transaction((skills) => {
        for (const skill of skills) {
            insert.run({
                ...skill,
                source_url: skill.source_url || skill.sourceUrl || '',
                created_at: skill.created_at || new Date().toISOString(),
                updated_at: skill.updated_at || new Date().toISOString(),
                usage_count: skill.usage_count || 0,
                is_local: (skill.is_local || skill.isLocal) ? 1 : 0,
                is_custom: (skill.is_custom || skill.isCustom) ? 1 : 0,
                is_favorite: skill.is_favorite ? 1 : 0,
                linked_files: skill.linkedFiles ? JSON.stringify(skill.linkedFiles) : null
            });
        }
    });

    return transaction(skills);
}

export function addHistory(entry) {
    const stmt = db.prepare(`
        INSERT INTO history (
            id, type, root_folder_name, token_count, char_count, 
            skills_used, skills_count, content, created_at, custom_id
        ) VALUES (
            @id, @type, @root_folder_name, @token_count, @char_count, 
            @skills_used, @skills_count, @content, @created_at, @custom_id
        )
    `);

    return stmt.run({
        ...entry,
        id: entry.id || crypto.randomUUID(),
        skills_used: entry.skills_used ? JSON.stringify(entry.skills_used) : '[]',
        created_at: entry.created_at || new Date().toISOString(),
        custom_id: entry.custom_id || (entry.id || crypto.randomUUID()).slice(0, 8)
    });
}

export function getHistory(page = 1, pageSize = 30) {
    const offset = (page - 1) * pageSize;
    const stmt = db.prepare(`
        SELECT * FROM history 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
    `);
    
    return stmt.all(pageSize, offset).map(entry => ({
        ...entry,
        skills_used: JSON.parse(entry.skills_used || '[]')
    }));
}

export function getHistoryCount() {
    return db.prepare('SELECT COUNT(*) as count FROM history').get().count;
}

export function deleteHistory(id) {
    return db.prepare('DELETE FROM history WHERE id = ?').run(id);
}
