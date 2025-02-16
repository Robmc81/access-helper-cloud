
import { openDB, IDBPDatabase } from 'idb';
import { toast } from "sonner";

const DB_NAME = 'ocgDDIL';
const DB_VERSION = 2;

let dbInstance: IDBPDatabase | null = null;

const initDB = async () => {
  try {
    dbInstance = await openDB(DB_NAME, DB_VERSION, {
      async upgrade(db, oldVersion, newVersion) {
        // Create stores if they don't exist
        if (!db.objectStoreNames.contains('accessRequests')) {
          db.createObjectStore('accessRequests', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('identityStore')) {
          db.createObjectStore('identityStore', { keyPath: 'email' });
        }
        if (!db.objectStoreNames.contains('syncStore')) {
          db.createObjectStore('syncStore', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('systemLogs')) {
          db.createObjectStore('systemLogs', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('systemConfig')) {
          db.createObjectStore('systemConfig');
        }

        // Verify all stores exist
        const stores = ['accessRequests', 'identityStore', 'syncStore', 'systemLogs', 'systemConfig'];
        for (const store of stores) {
          if (!db.objectStoreNames.contains(store)) {
            console.error(`Failed to create store: ${store}`);
            throw new Error(`Failed to create store: ${store}`);
          }
        }

        console.info('All IndexedDB stores initialized successfully');
      },
    });
    return dbInstance;
  } catch (error) {
    console.error('Failed to initialize IndexedDB:', error);
    toast.error('Failed to initialize database');
    throw error;
  }
};

export const getDB = async () => {
  if (!dbInstance) {
    dbInstance = await initDB();
  }
  return dbInstance;
};

export const saveToIndexedDB = async (storeName: string, data: any) => {
  try {
    const db = await getDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    await store.put(data);
    await tx.done;
  } catch (error) {
    console.error(`Error saving to ${storeName}:`, error);
    toast.error(`Failed to save data to ${storeName}`);
  }
};

export const getAllFromIndexedDB = async (storeName: string) => {
  try {
    const db = await getDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return await store.getAll();
  } catch (error) {
    console.error(`Error reading from ${storeName}:`, error);
    toast.error(`Failed to read data from ${storeName}`);
    return [];
  }
};
