
import { getDB } from '../db/dbConfig';

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
    
    const db = await getDB();
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
    const db = await getDB();
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
