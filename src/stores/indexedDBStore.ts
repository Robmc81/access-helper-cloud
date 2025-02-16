
import { openDB } from 'idb';
import { toast } from "sonner";

const DB_NAME = 'ocgDDIL';
const DB_VERSION = 1;

const db = await openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    // Create stores
    if (!db.objectStoreNames.contains('accessRequests')) {
      db.createObjectStore('accessRequests', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('identityStore')) {
      db.createObjectStore('identityStore', { keyPath: 'email' });
    }
  },
});

export const saveToIndexedDB = async (storeName: string, data: any) => {
  try {
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
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return await store.getAll();
  } catch (error) {
    console.error(`Error reading from ${storeName}:`, error);
    toast.error(`Failed to read data from ${storeName}`);
    return [];
  }
};

export const exportData = async () => {
  try {
    const accessRequests = await getAllFromIndexedDB('accessRequests');
    const identityStore = await getAllFromIndexedDB('identityStore');
    
    const exportData = {
      accessRequests,
      identityStore,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocg-ddil-backup-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully');
  } catch (error) {
    console.error('Export error:', error);
    toast.error('Failed to export data');
  }
};

export const importData = async (file: File) => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    // Validate data structure
    if (!data.accessRequests || !data.identityStore) {
      throw new Error('Invalid backup file format');
    }
    
    // Import access requests
    for (const request of data.accessRequests) {
      await saveToIndexedDB('accessRequests', request);
    }
    
    // Import identity store
    for (const identity of data.identityStore) {
      await saveToIndexedDB('identityStore', identity);
    }
    
    toast.success('Data imported successfully');
  } catch (error) {
    console.error('Import error:', error);
    toast.error('Failed to import data');
  }
};
