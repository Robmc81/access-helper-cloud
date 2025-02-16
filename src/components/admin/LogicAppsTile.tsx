
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings, Workflow, Link, Play } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { addLog } from "@/stores/indexedDBStore";
import { provisionIdentity } from "@/stores/indexedDBStore";
import { useNavigate } from "react-router-dom";

export const LogicAppsTile = () => {
  const navigate = useNavigate();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [workflowUrl, setWorkflowUrl] = useState("https://prod-01.northcentralus.logic.azure.com:443/workflows/70b2a44d77534c67a9556e148bc07946/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=8aORmU8_I6hdR7IjWBqLauU03sXEvZBqtCiwKiBeW_c");
  const [newUrl, setNewUrl] = useState("https://prod-01.northcentralus.logic.azure.com:443/workflows/70b2a44d77534c67a9556e148bc07946/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=8aORmU8_I6hdR7IjWBqLauU03sXEvZBqtCiwKiBeW_c");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfigure = () => {
    setIsConfigOpen(true);
  };

  const handleSave = async () => {
    setWorkflowUrl(newUrl);
    setIsConfigOpen(false);
    toast.success('Workflow URL saved successfully');
    try {
      await addLog('INFO', 'Logic App workflow URL updated', { url: newUrl });
    } catch (error) {
      console.error('Failed to log URL update:', error);
    }
  };

  const handleViewLogs = () => {
    navigate('/logs');
  };

  const handleProcessWorkload = async () => {
    setIsProcessing(true);
    try {
      console.log('Sending request to:', workflowUrl);
      
      const response = await fetch(workflowUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      
      // Validate the response data
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected an array of users');
      }

      // Process each user in the response
      for (const user of data) {
        if (!user.email || !user.fullName || !user.department) {
          console.warn('Skipping invalid user data:', user);
          continue;
        }

        await provisionIdentity({
          email: user.email,
          fullName: user.fullName,
          department: user.department,
          source: 'logic_apps'
        });
      }

      toast.success(`Successfully processed ${data.length} users`);
      try {
        await addLog('INFO', 'Logic App workflow processed successfully', { userCount: data.length });
      } catch (error) {
        console.error('Failed to log success:', error);
      }

    } catch (error) {
      console.error('Error processing workflow:', error);
      toast.error('Failed to process workflow. Check logs for details.');
      try {
        await addLog('ERROR', 'Failed to process Logic App workflow', { error: error.message });
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }
    } finally {
      setIsProcessing(false);
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
            <div className="flex gap-2">
              <Button 
                onClick={handleViewLogs}
                variant="outline"
                size="sm"
              >
                View Logs
              </Button>
              <Button 
                onClick={handleConfigure}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Configure
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect to Azure Logic Apps to automate user provisioning and access management workflows.
            </p>
            {workflowUrl ? (
              <>
                <div className="flex items-start space-x-2 bg-gray-50 p-3 rounded-lg border">
                  <Link className="h-4 w-4 text-blue-500 mt-1" />
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">Current Workflow URL</p>
                    <p className="text-sm break-all font-mono bg-white px-2 py-1 rounded border">
                      {workflowUrl}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleProcessWorkload}
                    disabled={isProcessing}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    {isProcessing ? 'Processing...' : 'Process Workflow'}
                  </Button>
                </div>
              </>
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
