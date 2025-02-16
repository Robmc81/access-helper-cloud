import { openDB } from 'idb';
import { toast } from "sonner";

declare global {
  interface Window {
    showSaveFilePicker: (options: { 
      suggestedName: string; 
      types: Array<{ description: string; accept: Record<string, string[]> }> 
    }) => Promise<FileSystemFileHandle>;
    showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
  }
}

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
    const syncStore = await getAllFromIndexedDB('syncStore');
    
    const exportData = {
      accessRequests,
      identityStore,
      syncStore,
      exportDate: new Date().toISOString(),
    };
    
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
    
    if (!data.accessRequests || !data.identityStore) {
      throw new Error('Invalid backup file format');
    }
    
    for (const request of data.accessRequests) {
      await saveToIndexedDB('accessRequests', request);
    }
    
    for (const identity of data.identityStore) {
      await saveToIndexedDB('identityStore', identity);
    }

    if (data.syncStore) {
      for (const syncItem of data.syncStore) {
        await saveToIndexedDB('syncStore', syncItem);
      }
    }
    
    toast.success('Data imported successfully');
  } catch (error) {
    console.error('Import error:', error);
    toast.error('Failed to import data');
  }
};

export const scheduleAutoBackup = async () => {
  try {
    if ('showDirectoryPicker' in window) {
      const dirHandle = await window.showDirectoryPicker();
      localStorage.setItem('autoBackupEnabled', 'true');
      
      const permission = await dirHandle.requestPermission({ mode: 'readwrite' }) as FileSystemPermissionStatus;
      
      if (permission === 'granted') {
        const backupData = {
          accessRequests: await getAllFromIndexedDB('accessRequests'),
          identityStore: await getAllFromIndexedDB('identityStore'),
          syncStore: await getAllFromIndexedDB('syncStore'),
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

// Sync functionality
export interface SyncRecord {
  id: string;
  type: 'accessRequest' | 'identity';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  status: 'pending' | 'synced';
}

export const createSyncRecord = async (
  type: SyncRecord['type'],
  action: SyncRecord['action'],
  data: any
) => {
  const syncRecord: SyncRecord = {
    id: crypto.randomUUID(),
    type,
    action,
    data,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };
  
  await saveToIndexedDB('syncStore', syncRecord);
  return syncRecord;
};

export const getPendingSyncRecords = async (): Promise<SyncRecord[]> => {
  const allRecords = await getAllFromIndexedDB('syncStore');
  return allRecords.filter((record: SyncRecord) => record.status === 'pending');
};

export const markAsSynced = async (id: string) => {
  const tx = db.transaction('syncStore', 'readwrite');
  const store = tx.objectStore('syncStore');
  const record = await store.get(id);
  
  if (record) {
    record.status = 'synced';
    await store.put(record);
  }
  
  await tx.done;
};

// Function to apply sync records from another device
export const applySyncRecords = async (records: SyncRecord[]) => {
  const sortedRecords = records.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  for (const record of sortedRecords) {
    try {
      switch (record.type) {
        case 'accessRequest':
          await saveToIndexedDB('accessRequests', record.data);
          break;
        case 'identity':
          await saveToIndexedDB('identityStore', record.data);
          break;
      }
      await markAsSynced(record.id);
    } catch (error) {
      console.error('Error applying sync record:', error);
    }
  }
};

// Function to merge sync data from another device
export const mergeSyncData = async (importedData: any) => {
  if (!importedData.syncStore) return;

  const currentRecords = await getAllFromIndexedDB('syncStore');
  const importedRecords = importedData.syncStore;
  
  // Create a map of existing record IDs for quick lookup
  const existingIds = new Set(currentRecords.map((r: SyncRecord) => r.id));
  
  // Filter out records we already have
  const newRecords = importedRecords.filter((r: SyncRecord) => !existingIds.has(r.id));
  
  // Apply new records
  await applySyncRecords(newRecords);
};
