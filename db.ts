
import { BusinessLead } from './types';

// Declare SQL from sql.js (loaded via script tag)
declare const initSqlJs: any;

let db: any = null;
const DB_STORE_NAME = 'leadgenius_db';
const DB_FILE_KEY = 'sqlite_db';

/**
 * Initializes the SQL.js database.
 * Attempts to load existing DB from IndexedDB first.
 */
export async function initDb(): Promise<void> {
  const SQL = await initSqlJs({
    locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`
  });

  const savedData = await loadFromIndexedDB();
  if (savedData) {
    db = new SQL.Database(new Uint8Array(savedData));
  } else {
    db = new SQL.Database();
    // Create schema
    db.run(`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        name TEXT,
        address TEXT,
        rating REAL,
        latitude REAL,
        longitude REAL,
        industry TEXT,
        marketGaps TEXT,
        pitchAngle TEXT,
        website TEXT,
        hasChatbot INTEGER,
        hasOnlineBooking INTEGER,
        sentiment TEXT,
        isSaved INTEGER DEFAULT 0,
        notes TEXT,
        proposal TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
}

/**
 * Saves a lead or updates an existing one.
 */
export async function upsertLead(lead: BusinessLead, isSavedOverride?: boolean): Promise<void> {
  if (!db) return;

  const currentLead = getLeadById(lead.id);
  const isSavedValue = isSavedOverride !== undefined 
    ? (isSavedOverride ? 1 : 0) 
    : (currentLead?.isSaved ? 1 : 0);

  db.run(`
    INSERT INTO leads (id, name, address, rating, latitude, longitude, industry, marketGaps, pitchAngle, website, hasChatbot, hasOnlineBooking, sentiment, isSaved, notes, proposal)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name,
      address=excluded.address,
      rating=excluded.rating,
      latitude=excluded.latitude,
      longitude=excluded.longitude,
      industry=excluded.industry,
      marketGaps=excluded.marketGaps,
      pitchAngle=excluded.pitchAngle,
      website=excluded.website,
      hasChatbot=excluded.hasChatbot,
      hasOnlineBooking=excluded.hasOnlineBooking,
      sentiment=excluded.sentiment,
      isSaved=excluded.isSaved,
      notes=COALESCE(excluded.notes, leads.notes),
      proposal=COALESCE(excluded.proposal, leads.proposal)
  `, [
    lead.id,
    lead.name,
    lead.address,
    lead.rating,
    lead.latitude,
    lead.longitude,
    lead.industry,
    JSON.stringify(lead.marketGaps),
    lead.pitchAngle,
    lead.website || '',
    lead.hasChatbot ? 1 : 0,
    lead.hasOnlineBooking ? 1 : 0,
    lead.sentiment,
    isSavedValue,
    lead.notes || null,
    lead.proposal || null
  ]);

  await persistDb();
}

/**
 * Update specific intelligence fields for a lead.
 */
export async function updateLeadIntelligence(id: string, updates: Partial<Pick<BusinessLead, 'notes' | 'proposal' | 'pitchAngle'>>): Promise<void> {
  if (!db) return;
  
  const fields = Object.keys(updates);
  if (fields.length === 0) return;

  const setClause = fields.map(f => `${f} = ?`).join(', ');
  const values = Object.values(updates);
  
  db.run(`UPDATE leads SET ${setClause} WHERE id = ?`, [...values, id]);
  await persistDb();
}

/**
 * Toggles the 'saved' status of a lead.
 */
export async function toggleLeadSave(id: string): Promise<void> {
  if (!db) return;
  db.run(`UPDATE leads SET isSaved = 1 - isSaved WHERE id = ?`, [id]);
  await persistDb();
}

/**
 * Retrieves all leads.
 */
export function getAllLeads(): BusinessLead[] {
  if (!db) return [];
  const res = db.exec("SELECT * FROM leads ORDER BY createdAt DESC");
  if (res.length === 0) return [];

  const columns = res[0].columns;
  const values = res[0].values;

  return values.map((row: any[]) => {
    const obj: any = {};
    columns.forEach((col: string, i: number) => {
      if (col === 'marketGaps') {
        obj[col] = JSON.parse(row[i] || '[]');
      } else if (col === 'hasChatbot' || col === 'hasOnlineBooking' || col === 'isSaved') {
        obj[col] = row[i] === 1;
      } else {
        obj[col] = row[i];
      }
    });
    return obj as BusinessLead;
  });
}

export function getLeadById(id: string): (BusinessLead & { isSaved: boolean }) | null {
  if (!db) return null;
  const res = db.exec("SELECT * FROM leads WHERE id = ?", [id]);
  if (res.length === 0) return null;
  
  const columns = res[0].columns;
  const row = res[0].values[0];
  const obj: any = {};
  columns.forEach((col: string, i: number) => {
    if (col === 'marketGaps') obj[col] = JSON.parse(row[i] || '[]');
    else if (col === 'hasChatbot' || col === 'hasOnlineBooking' || col === 'isSaved') obj[col] = row[i] === 1;
    else obj[col] = row[i];
  });
  return obj;
}

/**
 * Exports the DB as a .sqlite file.
 */
export function exportDb() {
  if (!db) return;
  const data = db.export();
  const blob = new Blob([data], { type: 'application/x-sqlite3' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leadgenius_export_${new Date().toISOString().split('T')[0]}.sqlite`;
  a.click();
}

/**
 * Imports a DB from a file.
 */
export async function importDb(file: File): Promise<void> {
  const SQL = await initSqlJs({
    locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`
  });
  const buffer = await file.arrayBuffer();
  db = new SQL.Database(new Uint8Array(buffer));
  await persistDb();
}

/**
 * Persists the current in-memory DB to IndexedDB.
 */
async function persistDb() {
  if (!db) return;
  const data = db.export();
  await saveToIndexedDB(data);
}

// --- IndexedDB Helpers ---

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_STORE_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('files');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveToIndexedDB(data: Uint8Array): Promise<void> {
  const idb = await openIDB();
  const tx = idb.transaction('files', 'readwrite');
  tx.objectStore('files').put(data, DB_FILE_KEY);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadFromIndexedDB(): Promise<ArrayBuffer | null> {
  const idb = await openIDB();
  const tx = idb.transaction('files', 'readonly');
  const request = tx.objectStore('files').get(DB_FILE_KEY);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}
