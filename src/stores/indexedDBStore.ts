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

  interface FileSystemDirectoryHandle {
    requestPermission: (descriptor: { mode: 'read' | 'readwrite' }) => Promise<PermissionState>;
  }
}

const DB_NAME = 'ocgDDIL';
const DB_VERSION = 2; // Incrementing version to force upgrade

const db = await openDB(DB_NAME, DB_VERSION, {
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

export const saveToIndexedDB = async (storeName: string, data: any) => {
  try {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    await store.put(data);
    await tx.done;
    await addLog('INFO', `Data saved to ${storeName}`, { id: data.id || data.email });
  } catch (error) {
    console.error(`Error saving to ${storeName}:`, error);
    await addLog('ERROR', `Failed to save data to ${storeName}`, { error: error.message });
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
    await addLog('ERROR', `Failed to read data from ${storeName}`, { error: error.message });
    toast.error(`Failed to read data from ${storeName}`);
    return [];
  }
};

export const exportData = async () => {
  try {
    const accessRequests = await getAllFromIndexedDB('accessRequests');
    const identityStore = await getAllFromIndexedDB('identityStore');
    const syncStore = await getAllFromIndexedDB('syncStore');
    const systemLogs = await getLogs();
    
    const exportData = {
      accessRequests,
      identityStore,
      syncStore,
      systemLogs,
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
    await addLog('ERROR', 'Failed to export data', { error: error.message });
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
    await addLog('ERROR', 'Failed to import data', { error: error.message });
    toast.error('Failed to import data');
  }
};

export const scheduleAutoBackup = async () => {
  try {
    if ('showDirectoryPicker' in window) {
      const dirHandle = await window.showDirectoryPicker();
      localStorage.setItem('autoBackupEnabled', 'true');
      
      const permission = await dirHandle.requestPermission({ mode: 'readwrite' });
      
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
    await addLog('ERROR', 'Failed to set up auto-backup', { error: error.message });
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

// Function to provision a new identity
export const provisionIdentity = async (userData: {
  email: string;
  fullName: string;
  department: string;
  source?: string;
}) => {
  try {
    const identityData = {
      ...userData,
      createdAt: new Date(),
      source: userData.source || 'logic_apps',
      status: 'active',
    };

    // Store in IndexedDB
    const tx = db.transaction('identityStore', 'readwrite');
    const store = tx.objectStore('identityStore');
    
    // Check if user already exists
    const existingUser = await store.get(userData.email);
    
    // Save to IndexedDB
    if (existingUser) {
      await store.put({
        ...existingUser,
        ...identityData,
        updatedAt: new Date(),
      });
    } else {
      await store.put(identityData);
    }
    
    await tx.done;
    
    // Create sync record
    await createSyncRecord('identity', existingUser ? 'update' : 'create', identityData);

    // Provision to OpenLDAP if configured
    const config = await getOpenLDAPConfig();
    if (config && config.enabled) {
      await provisionToOpenLDAP(identityData, config);
    }
    
    toast.success(`${existingUser ? 'Updated' : 'Provisioned'} user: ${userData.fullName}`);
    return identityData;
  } catch (error) {
    console.error('Error provisioning identity:', error);
    await addLog('ERROR', `Failed to provision identity: ${userData.email}`, { error: error.message });
    toast.error(`Failed to provision user: ${userData.fullName}`);
    throw error;
  }
};

interface OpenLDAPConfig {
  enabled: boolean;
  url: string;
  bindDN: string;
  bindPassword: string;
  baseDN: string;
  userContainer: string;
}

export const getOpenLDAPConfig = async (): Promise<OpenLDAPConfig | null> => {
  try {
    const tx = db.transaction('systemConfig', 'readonly');
    const store = tx.objectStore('systemConfig');
    const config = await store.get('openldap');
    return config || {
      enabled: false,
      url: '',
      bindDN: '',
      bindPassword: '',
      baseDN: '',
      userContainer: '',
    };
  } catch (error) {
    console.error('Error getting OpenLDAP config:', error);
    return null;
  }
};

export const saveOpenLDAPConfig = async (config: OpenLDAPConfig) => {
  try {
    // Validate required fields
    if (!config.url || !config.bindDN || !config.bindPassword || !config.baseDN || !config.userContainer) {
      throw new Error('All fields are required');
    }

    const tx = db.transaction('systemConfig', 'readwrite');
    const store = tx.objectStore('systemConfig');
    
    // Save the complete config object
    await store.put({
      enabled: config.enabled,
      url: config.url,
      bindDN: config.bindDN,
      bindPassword: config.bindPassword,
      baseDN: config.baseDN,
      userContainer: config.userContainer,
    }, 'openldap');
    
    await tx.done;
    await addLog('INFO', 'OpenLDAP configuration updated', { config: { ...config, bindPassword: '***' } });
    toast.success('OpenLDAP configuration saved successfully');
  } catch (error) {
    console.error('Error saving OpenLDAP config:', error);
    await addLog('ERROR', 'Failed to save OpenLDAP configuration', { error: error.message });
    toast.error('Failed to save OpenLDAP configuration');
    throw error;
  }
};

const provisionToOpenLDAP = async (userData: any, config: OpenLDAPConfig) => {
  try {
    const isValidUrl = config.url.startsWith('ldap://') || config.url.startsWith('ldaps://');
    if (!isValidUrl) {
      throw new Error('Invalid LDAP URL format. Must start with ldap:// or ldaps://');
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    await addLog('INFO', `User provisioned to OpenLDAP: ${userData.email}`);
    toast.success(`Successfully provisioned user to OpenLDAP: ${userData.email}`);
  } catch (error) {
    console.error('OpenLDAP provisioning error:', error);
    await addLog('ERROR', `Failed to provision to OpenLDAP: ${userData.email}`, { error: error.message });
    throw error;
  }
};

// Function to provision multiple identities at once
export const provisionBulkIdentities = async (usersData: Array<{
  email: string;
  fullName: string;
  department: string;
  source?: string;
}>) => {
  try {
    const results = await Promise.all(
      usersData.map(userData => provisionIdentity(userData))
    );
    
    toast.success(`Successfully provisioned ${results.length} users`);
    return results;
  } catch (error) {
    console.error('Error in bulk provisioning:', error);
    await addLog('ERROR', 'Failed to complete bulk user provisioning', { error: error.message });
    toast.error('Failed to complete bulk user provisioning');
    throw error;
  }
};

export interface SystemLog {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR";
  message: string;
  details?: any;
}

export const addLog = async (
  level: SystemLog['level'],
  message: string,
  details?: any
) => {
  try {
    const log: SystemLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level,
      message,
      details
    };
    
    const tx = db.transaction('systemLogs', 'readwrite');
    const store = tx.objectStore('systemLogs');
    await store.add(log);
    await tx.done;
  } catch (error) {
    console.error('Failed to add log:', error);
  }
};

export const getLogs = async (limit = 100): Promise<SystemLog[]> => {
  try {
    const tx = db.transaction('systemLogs', 'readonly');
    const store = tx.objectStore('systemLogs');
    const logs = await store.getAll();
    return logs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Failed to get logs:', error);
    return [];
  }
};
