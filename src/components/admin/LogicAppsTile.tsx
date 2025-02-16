
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings, Workflow, Link } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { addLog } from "@/stores/indexedDBStore";

export const LogicAppsTile = () => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [workflowUrl, setWorkflowUrl] = useState("");
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    const loadWorkflowUrl = async () => {
      try {
        const dbRequest = window.indexedDB.open('ocgDDIL', 1);
        
        dbRequest.onerror = async (event) => {
          console.error('Database error:', event);
          await addLog('ERROR', 'Failed to open database', { error: 'Database error' });
        };

        dbRequest.onupgradeneeded = (event) => {
          const db = (event.target as IDBRequest).result;
          if (!db.objectStoreNames.contains('systemConfig')) {
            db.createObjectStore('systemConfig');
          }
        };

        dbRequest.onsuccess = async (event) => {
          const db = (event.target as IDBRequest).result;
          try {
            const transaction = db.transaction('systemConfig', 'readonly');
            const store = transaction.objectStore('systemConfig');
            const request = store.get('logicAppWorkflowUrl');
            
            request.onsuccess = () => {
              if (request.result) {
                setWorkflowUrl(request.result);
                setNewUrl(request.result);
              }
            };
          } catch (error) {
            console.error('Transaction error:', error);
            await addLog('ERROR', 'Failed to read workflow URL', { error: String(error) });
          }
        };
      } catch (error) {
        console.error('Error loading workflow URL:', error);
        await addLog('ERROR', 'Failed to load workflow URL', { error: String(error) });
      }
    };

    loadWorkflowUrl();
  }, []);

  const handleConfigure = () => {
    setIsConfigOpen(true);
  };

  const handleSave = async () => {
    try {
      // Basic URL validation
      new URL(newUrl);

      const dbRequest = window.indexedDB.open('ocgDDIL', 1);
      
      dbRequest.onsuccess = async (event) => {
        const db = (event.target as IDBRequest).result;
        try {
          const transaction = db.transaction('systemConfig', 'readwrite');
          const store = transaction.objectStore('systemConfig');
          const request = store.put(newUrl, 'logicAppWorkflowUrl');
          
          transaction.oncomplete = async () => {
            setWorkflowUrl(newUrl);
            setIsConfigOpen(false);
            toast.success('Workflow URL saved successfully');
            await addLog('INFO', 'Logic App workflow URL updated', { url: newUrl });
          };

          transaction.onerror = async () => {
            toast.error('Failed to save workflow URL');
            await addLog('ERROR', 'Failed to save workflow URL', { error: 'Transaction error' });
          };
        } catch (error) {
          console.error('Transaction error:', error);
          toast.error('Failed to save workflow URL');
          await addLog('ERROR', 'Failed to save workflow URL', { error: String(error) });
        }
      };
    } catch (error) {
      console.error('Error saving workflow URL:', error);
      toast.error('Please enter a valid URL');
      await addLog('ERROR', 'Failed to save workflow URL', { error: String(error) });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Workflow className="h-6 w-6 text-blue-500" />
              <div>
                <CardTitle>Azure Logic App Integration</CardTitle>
                <CardDescription>Automate user provisioning workflows</CardDescription>
              </div>
            </div>
            <Button 
              onClick={handleConfigure}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Configure
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect to Azure Logic Apps to automate user provisioning and access management workflows.
            </p>
            {workflowUrl ? (
              <div className="flex items-start space-x-2 bg-gray-50 p-3 rounded-lg border">
                <Link className="h-4 w-4 text-blue-500 mt-1" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium">Current Workflow URL</p>
                  <p className="text-sm break-all font-mono bg-white px-2 py-1 rounded border">
                    {workflowUrl}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No workflow URL configured yet. Click Configure to set up the integration.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Logic App Workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="workflowUrl" className="text-sm font-medium">
                Workflow URL
              </label>
              <Input
                id="workflowUrl"
                placeholder="Enter Logic App workflow URL"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </div>
            <Button onClick={handleSave} className="w-full">
              Save Configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
