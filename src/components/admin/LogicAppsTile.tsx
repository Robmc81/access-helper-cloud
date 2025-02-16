
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings, Workflow, Link, Play, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { addLog } from "@/stores/indexedDBStore";
import { provisionIdentity } from "@/stores/indexedDBStore";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const LogicAppsTile = () => {
  const navigate = useNavigate();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [workflowUrl, setWorkflowUrl] = useState("https://prod-01.northcentralus.logic.azure.com:443/workflows/70b2a44d77534c67a9556e148bc07946/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=8aORmU8_I6hdR7IjWBqLauU03sXEvZBqtCiwKiBeW_c");
  const [newUrl, setNewUrl] = useState("https://prod-01.northcentralus.logic.azure.com:443/workflows/70b2a44d77534c67a9556e148bc07946/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=8aORmU8_I6hdR7IjWBqLauU03sXEvZBqtCiwKiBeW_c");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSchedulerEnabled, setIsSchedulerEnabled] = useState(false);
  const [intervalValue, setIntervalValue] = useState("15");
  const [intervalUnit, setIntervalUnit] = useState("minutes");
  const schedulerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (schedulerRef.current) {
        clearInterval(schedulerRef.current);
      }
    };
  }, []);

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

      const responseData = await response.json();
      console.log('Received data:', responseData);
      
      const users = Array.isArray(responseData) ? responseData : [responseData];
      
      const processedUsers = users.filter(user => {
        if (!user.email || !user.fullName || !user.department) {
          console.warn('Skipping invalid user data:', user);
          return false;
        }
        return true;
      });

      for (const user of processedUsers) {
        await provisionIdentity({
          email: user.email,
          fullName: user.fullName,
          department: user.department,
          source: 'logic_apps'
        });
      }

      toast.success(`Successfully processed ${processedUsers.length} users`);
      try {
        await addLog('INFO', 'Logic App workflow processed successfully', { userCount: processedUsers.length });
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

  const startScheduler = () => {
    if (schedulerRef.current) {
      clearInterval(schedulerRef.current);
    }

    const intervalInMs = intervalUnit === "minutes" 
      ? parseInt(intervalValue) * 60 * 1000 
      : parseInt(intervalValue) * 60 * 60 * 1000;

    schedulerRef.current = setInterval(handleProcessWorkload, intervalInMs);
    toast.success(`Scheduler started - running every ${intervalValue} ${intervalUnit}`);
    try {
      addLog('INFO', 'Workflow scheduler started', { interval: intervalValue, unit: intervalUnit });
    } catch (error) {
      console.error('Failed to log scheduler start:', error);
    }
  };

  const stopScheduler = () => {
    if (schedulerRef.current) {
      clearInterval(schedulerRef.current);
      schedulerRef.current = null;
      toast.success('Scheduler stopped');
      try {
        addLog('INFO', 'Workflow scheduler stopped');
      } catch (error) {
        console.error('Failed to log scheduler stop:', error);
      }
    }
  };

  const handleSchedulerToggle = (enabled: boolean) => {
    setIsSchedulerEnabled(enabled);
    if (enabled) {
      startScheduler();
    } else {
      stopScheduler();
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
                onClick={() => setIsSchedulerOpen(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Schedule
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

      <Dialog open={isSchedulerOpen} onOpenChange={setIsSchedulerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Scheduler</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically run the workflow at regular intervals
                </p>
              </div>
              <Switch
                checked={isSchedulerEnabled}
                onCheckedChange={handleSchedulerToggle}
              />
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Interval</Label>
                <Input
                  type="number"
                  min="1"
                  value={intervalValue}
                  onChange={(e) => setIntervalValue(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div className="flex-1">
                <Label>Unit</Label>
                <Select
                  value={intervalUnit}
                  onValueChange={setIntervalUnit}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
