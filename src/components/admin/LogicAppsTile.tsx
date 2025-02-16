
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings, Workflow } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { addLog } from "@/stores/indexedDBStore";

export const LogicAppsTile = () => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [workflowUrl, setWorkflowUrl] = useState("");
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    // Load existing URL from IndexedDB
    const loadWorkflowUrl = async () => {
      try {
        const db = await window.indexedDB.open('ocgDDIL', 1);
        db.onsuccess = () => {
          const transaction = db.result.transaction('systemConfig', 'readonly');
          const store = transaction.objectStore('systemConfig');
          const request = store.get('logicAppWorkflowUrl');
          
          request.onsuccess = () => {
            if (request.result) {
              setWorkflowUrl(request.result);
              setNewUrl(request.result);
            }
          };
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

      const db = await window.indexedDB.open('ocgDDIL', 1);
      db.onsuccess = async () => {
        const transaction = db.result.transaction('systemConfig', 'readwrite');
        const store = transaction.objectStore('systemConfig');
        store.put(newUrl, 'logicAppWorkflowUrl');

        transaction.oncomplete = async () => {
          setWorkflowUrl(newUrl);
          setIsConfigOpen(false);
          toast.success('Workflow URL saved successfully');
          await addLog('INFO', 'Logic App workflow URL updated', { url: newUrl });
        };
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
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Connect to Azure Logic Apps to automate user provisioning and access management workflows.
            </p>
            {workflowUrl && (
              <p className="text-sm">
                Current workflow URL: <code className="bg-gray-100 px-2 py-1 rounded">{workflowUrl}</code>
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
