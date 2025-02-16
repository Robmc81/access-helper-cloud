
import { getAllFromIndexedDB } from '../db/dbConfig';
import { getLogs } from '../logging/systemLogs';
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
