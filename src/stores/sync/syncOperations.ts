
import { db, saveToIndexedDB, getAllFromIndexedDB } from '../db/dbConfig';

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

export const mergeSyncData = async (importedData: any) => {
  if (!importedData.syncStore) return;

  const currentRecords = await getAllFromIndexedDB('syncStore');
  const importedRecords = importedData.syncStore;
  
  const existingIds = new Set(currentRecords.map((r: SyncRecord) => r.id));
  const newRecords = importedRecords.filter((r: SyncRecord) => !existingIds.has(r.id));
  
  await applySyncRecords(newRecords);
};
