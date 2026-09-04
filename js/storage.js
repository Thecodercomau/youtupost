/* ==========================================
   YOUTUPOST — Storage
   LocalStorage & IndexedDB Wrapper
   ========================================== */

export const Storage = {
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('Storage.get error:', key, e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage.set error:', key, e);
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Storage.remove error:', key, e);
    }
  },

  clear() {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith('youtupost_')) keys.push(k);
      }
      keys.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.warn('Storage.clear error:', e);
    }
  },
};

/* IndexedDB for larger data */
const DB_NAME = 'youtupost_db';
const DB_VERSION = 1;

export const IndexedDB = {
  _db: null,

  async open() {
    if (this._db) return this._db;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('media')) {
          db.createObjectStore('media', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
      req.onsuccess = (e) => {
        this._db = e.target.result;
        resolve(this._db);
      };
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async saveMedia(id, blob) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('media', 'readwrite');
      tx.objectStore('media').put({ id, blob, timestamp: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  },

  async getMedia(id) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('media', 'readonly');
      const req = tx.objectStore('media').get(id);
      req.onsuccess = () => resolve(req.result?.blob || null);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async saveCache(key, data) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cache', 'readwrite');
      tx.objectStore('cache').put({ key, data, timestamp: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  },

  async getCache(key) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cache', 'readonly');
      const req = tx.objectStore('cache').get(key);
      req.onsuccess = () => resolve(req.result?.data || null);
      req.onerror = (e) => reject(e.target.error);
    });
  },
};
