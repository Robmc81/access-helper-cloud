
import { openDB } from 'idb';
import { toast } from "sonner";

const DB_NAME = 'ocgDDIL';
const DB_VERSION = 1;

const db = await openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('accessRequests')) {
      db.createObjectStore('accessRequests', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('identityStore')) {
      db.createObjectStore('identityStore', { keyPath: 'email' });
    }
    if (!db.objectStoreNames.contains('syncStore')) {
      db.createObjectStore('syncStore', { keyPath: 'id' });
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
    
    // Try to use File System Access API if available
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: `ocg-ddil-backup-${new Date().toISOString()}.json`,
          types: [{
            description: 'JSON File',
            accept: { 'application/json': ['.json'] },
          }],
        });
        
        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(exportData, null, 2));
        await writable.close();
        
        toast.success('Data exported successfully using File System Access API');
        return;
      } catch (error) {
        console.warn('File System Access API failed, falling back to download:', error);
      }
    }
    
    // Fallback to traditional download
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

// Add auto-backup functionality
export const scheduleAutoBackup = async () => {
  try {
    if ('showDirectoryPicker' in window) {
      const dirHandle = await window.showDirectoryPicker();
      localStorage.setItem('autoBackupEnabled', 'true');
      
      // Store the directory handle
      const grantPermission = await dirHandle.requestPermission({ mode: 'readwrite' });
      if (grantPermission === 'granted') {
        // Create auto-backup
        const backupData = {
          accessRequests: await getAllFromIndexedDB('accessRequests'),
          identityStore: await getAllFromIndexedDB('identityStore'),
          exportDate: new Date().toISOString(),
        };
        
        const fileName = `ocg-ddil-auto-backup-${new Date().toISOString()}.json`;
        const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(backupData, null, 2));
        await writable.close();
        
        toast.success('Auto-backup location set and initial backup created');
      }
    } else {
      toast.error('File System Access API is not supported in this browser');
    }
  } catch (error) {
    console.error('Auto-backup error:', error);
    toast.error('Failed to set up auto-backup');
  }
};
