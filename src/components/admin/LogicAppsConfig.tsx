
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Info, RefreshCw, Edit2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { addLog } from "@/stores/indexedDBStore";
import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'ocgDDIL';
const DB_VERSION = 2;

export const LogicAppsConfig = () => {
  const [testing, setTesting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [workflowUrl, setWorkflowUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState<IDBPDatabase | null>(null);

  // Initialize database and load configuration
  useEffect(() => {
    const initializeDB = async () => {
      try {
        const database = await openDB(DB_NAME, DB_VERSION, {
          upgrade(db) {
            if (!db.objectStoreNames.contains('systemConfig')) {
              db.createObjectStore('systemConfig');
            }
            if (!db.objectStoreNames.contains('systemLogs')) {
              db.createObjectStore('systemLogs', { keyPath: 'id' });
            }
          },
        });

        setDb(database);
        await loadConfiguration(database);
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        await addLog('ERROR', 'Database initialization failed', { error: String(error) });
        toast.error('Failed to initialize database');
        setLoading(false);
      }
    };

    initializeDB();

    return () => {
      if (db) {
        db.close();
      }
    };
  }, []);

  // Load existing configuration
  const loadConfiguration = async (database: IDBPDatabase) => {
    try {
      const url = await database.get('systemConfig', 'workflowUrl');
      if (url) {
        setWorkflowUrl(url);
        await addLog('INFO', 'Loaded existing workflow URL configuration');
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      await addLog('ERROR', 'Failed to load configuration', { error: String(error) });
      toast.error('Failed to load configuration');
    }
  };

  // Save workflow URL
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

  // Handle save button click
  const handleSaveEndpoint = async () => {
    if (!workflowUrl.trim()) {
      toast.error('Workflow URL cannot be empty');
      await addLog('WARN', 'Attempted to save empty workflow URL');
      return;
    }

    try {
      const success = await saveWorkflowUrl(workflowUrl);
      if (success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error in save endpoint handler:', error);
      await addLog('ERROR', 'Save endpoint handler failed', { error: String(error) });
    }
  };

  // Test workflow configuration
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

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-2xl">Logic Apps User Provisioning</CardTitle>
        <CardDescription>
          Configure and manage user provisioning through Microsoft Logic Apps
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
                    value={workflowUrl}
                    onChange={(e) => setWorkflowUrl(e.target.value)}
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

        {/* Help Guide */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Implementation Guide</h3>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="setup">
              <AccordionTrigger>Basic Setup Steps</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Open Microsoft Logic Apps in Azure Portal</li>
                  <li>Create a new workflow or edit existing one</li>
                  <li>Add an HTTP trigger as the starting point</li>
                  <li>Copy the HTTP POST URL from the trigger</li>
                  <li>Paste the URL in the configuration above</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="payload">
              <AccordionTrigger>Request Payload Format</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">Single user provisioning payload:</p>
                <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
{JSON.stringify({
  email: "user@example.com",
  fullName: "John Doe",
  department: "IT",
  source: "logic_apps"
}, null, 2)}
                </pre>
                
                <p className="mt-4 mb-2">Bulk user provisioning payload:</p>
                <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
{JSON.stringify({
  users: [
    {
      email: "user1@example.com",
      fullName: "John Doe",
      department: "IT"
    },
    {
      email: "user2@example.com",
      fullName: "Jane Smith",
      department: "HR"
    }
  ]
}, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="response">
              <AccordionTrigger>Response Handling</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <p>Success Response (200 OK):</p>
                  <pre className="bg-gray-100 p-3 rounded-md text-sm">
{JSON.stringify({
  success: true,
  message: "User(s) provisioned successfully",
  data: { /* user data */ }
}, null, 2)}
                  </pre>
                  
                  <p className="mt-4">Error Response (400/500):</p>
                  <pre className="bg-gray-100 p-3 rounded-md text-sm">
{JSON.stringify({
  success: false,
  message: "Error message here",
  error: { /* error details */ }
}, null, 2)}
                  </pre>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="examples">
              <AccordionTrigger>Example Scenarios</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">1. New Employee Onboarding</h4>
                    <p className="text-sm text-gray-600">
                      Trigger when a new employee is added to HR system, automatically provision user access.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold">2. Department Transfer</h4>
                    <p className="text-sm text-gray-600">
                      Update user department when transfer occurs in HR system.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold">3. Bulk Import</h4>
                    <p className="text-sm text-gray-600">
                      Import multiple users from a CSV file or external system.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
};
