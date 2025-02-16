
import { db, saveToIndexedDB, getAllFromIndexedDB } from '../db/dbConfig';
import { getLogs } from '../logging/systemLogs';
import { toast } from "sonner";
import { convertToXML, parseXML } from '@/utils/xmlConverter';

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

export const exportData = async (format: 'json' | 'xml' = 'json') => {
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
    
    const data = format === 'xml' ? convertToXML(exportData) : JSON.stringify(exportData, null, 2);
    const fileExtension = format === 'xml' ? '.xml' : '.json';
    const contentType = format === 'xml' ? 'application/xml' : 'application/json';
    
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: `ocg-ddil-backup-${new Date().toISOString()}${fileExtension}`,
          types: [{
            description: format === 'xml' ? 'XML File' : 'JSON File',
            accept: { [contentType]: [fileExtension] },
          }],
        });
        
        const writable = await handle.createWritable();
        await writable.write(data);
        await writable.close();
        
        toast.success(`Data exported successfully as ${format.toUpperCase()}`);
        return;
      } catch (error) {
        console.warn('File System Access API failed, falling back to download:', error);
      }
    }
    
    const blob = new Blob([data], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocg-ddil-backup-${new Date().toISOString()}${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Data exported successfully as ${format.toUpperCase()}`);
  } catch (error) {
    console.error('Export error:', error);
    toast.error('Failed to export data');
  }
};

export const importData = async (file: File) => {
  try {
    const text = await file.text();
    const isXML = file.type === 'application/xml' || file.name.endsWith('.xml');
    const data = isXML ? parseXML(text) : JSON.parse(text);
    
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
    
    toast.success(`Data imported successfully from ${isXML ? 'XML' : 'JSON'}`);
  } catch (error) {
    console.error('Import error:', error);
    toast.error('Failed to import data');
  }
};
