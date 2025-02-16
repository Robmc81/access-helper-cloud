
import { useState, useEffect } from "react";
import { openDB, IDBPDatabase } from 'idb';
import { toast } from "sonner";
import { addLog } from "@/stores/indexedDBStore";

const DB_NAME = 'ocgDDIL';
const DB_VERSION = 2;

export const useLogicAppsDB = () => {
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState<IDBPDatabase | null>(null);
  const [workflowUrl, setWorkflowUrl] = useState("");

  useEffect(() => {
    let mounted = true;

    const initializeDB = async () => {
      try {
        console.log('Initializing database...');
        const database = await openDB(DB_NAME, DB_VERSION, {
          upgrade(db) {
            console.log('Upgrading database...');
            if (!db.objectStoreNames.contains('systemConfig')) {
              db.createObjectStore('systemConfig');
            }
            if (!db.objectStoreNames.contains('systemLogs')) {
              db.createObjectStore('systemLogs', { keyPath: 'id' });
            }
          },
        });

        if (!mounted) {
          database.close();
          return;
        }

        console.log('Database initialized successfully');
        setDb(database);
        
        // Load configuration
        console.log('Loading configuration...');
        await loadConfiguration(database);
        
        if (mounted) {
          setLoading(false);
          console.log('Component loading complete');
        }
      } catch (error) {
        console.error('Failed to initialize database:', error);
        if (mounted) {
          await addLog('ERROR', 'Database initialization failed', { error: String(error) });
          toast.error('Failed to initialize database');
          setLoading(false);
        }
      }
    };

    initializeDB();

    return () => {
      mounted = false;
      if (db) {
        console.log('Closing database connection');
        db.close();
      }
    };
  }, []);

  const loadConfiguration = async (database: IDBPDatabase) => {
    try {
      console.log('Fetching workflow URL from database...');
      const url = await database.get('systemConfig', 'workflowUrl');
      if (url) {
        console.log('Workflow URL found:', url);
        setWorkflowUrl(url);
        await addLog('INFO', 'Loaded existing workflow URL configuration');
      } else {
        console.log('No workflow URL found in database');
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      await addLog('ERROR', 'Failed to load configuration', { error: String(error) });
      toast.error('Failed to load configuration');
    }
  };

  const saveWorkflowUrl = async (url: string): Promise<boolean> => {
    if (!db) {
      toast.error('Database not initialized');
      return false;
    }

    try {
      // Validate URL format
      new URL(url);

      // Save to database
      await db.put('systemConfig', url, 'workflowUrl');
      await addLog('INFO', 'Workflow URL saved', { url });

      // Verify save
      const savedUrl = await db.get('systemConfig', 'workflowUrl');
      if (savedUrl === url) {
        setWorkflowUrl(url);
        toast.success('Workflow URL saved successfully');
        return true;
      } else {
        throw new Error('URL verification failed');
      }
    } catch (error) {
      console.error('Error saving workflow URL:', error);
      await addLog('ERROR', 'Failed to save workflow URL', { error: String(error), url });
      toast.error(error instanceof Error ? error.message : 'Failed to save workflow URL');
      return false;
    }
  };

  return {
    loading,
    workflowUrl,
    saveWorkflowUrl,
  };
};
