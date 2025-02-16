
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Save, RefreshCw } from "lucide-react";
import { addLog } from "@/stores/indexedDBStore";
import { toast } from "sonner";

interface WorkflowUrlConfigProps {
  workflowUrl: string;
  onSave: (url: string) => Promise<boolean>;
}

export const WorkflowUrlConfig = ({ workflowUrl, onSave }: WorkflowUrlConfigProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [editingUrl, setEditingUrl] = useState(workflowUrl);

  const handleSaveEndpoint = async () => {
    if (!editingUrl.trim()) {
      toast.error('Workflow URL cannot be empty');
      await addLog('WARN', 'Attempted to save empty workflow URL');
      return;
    }

    try {
      const success = await onSave(editingUrl);
      if (success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error in save endpoint handler:', error);
      await addLog('ERROR', 'Save endpoint handler failed', { error: String(error) });
    }
  };

  const testWorkflow = async () => {
    if (!workflowUrl) {
      toast.error('Please configure the workflow URL first');
      return;
    }

    setTesting(true);
    try {
      await addLog('INFO', 'Testing Logic Apps workflow', { url: workflowUrl });
      
      const testPayload = {
        email: "test@example.com",
        fullName: "Test User",
        department: "IT",
        source: "logic_apps"
      };

      const response = await fetch(workflowUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      await addLog('INFO', 'Logic Apps workflow test successful', { response: data });
      toast.success('Logic Apps workflow test successful');
    } catch (error) {
      console.error('Logic Apps test error:', error);
      await addLog('ERROR', 'Logic Apps workflow test failed', { 
        error: String(error),
        url: workflowUrl 
      });
      toast.error('Failed to test Logic Apps workflow');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Workflow Configuration</h3>
      <p className="text-sm text-gray-600">
        Configure the Logic Apps workflow endpoint to receive provisioning requests:
      </p>
      <div className="relative">
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                value={editingUrl}
                onChange={(e) => setEditingUrl(e.target.value)}
                className="flex-1"
                placeholder="Enter Logic Apps workflow URL"
              />
              <Button
                onClick={handleSaveEndpoint}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <code className="block bg-gray-100 p-3 rounded-md text-sm flex-1 break-all">
              {workflowUrl || "No workflow URL configured"}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="h-10 w-10"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <Button 
        onClick={testWorkflow}
        disabled={testing || !workflowUrl}
        className="w-full sm:w-auto"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${testing ? 'animate-spin' : ''}`} />
        {testing ? "Testing Workflow..." : "Test Workflow"}
      </Button>
    </div>
  );
};
