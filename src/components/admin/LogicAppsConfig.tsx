
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
import { Info, RefreshCw, Edit2, Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export const LogicAppsConfig = () => {
  const [testing, setTesting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [workflowUrl, setWorkflowUrl] = useState("");

  const testWorkflow = async () => {
    if (!workflowUrl) {
      toast.error("Please configure the workflow URL first");
      return;
    }

    setTesting(true);
    try {
      // Test payload
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
      console.log("Logic Apps test response:", data);
      toast.success("Logic Apps workflow test successful");
    } catch (error) {
      console.error("Logic Apps test error:", error);
      toast.error("Failed to test Logic Apps workflow");
    } finally {
      setTesting(false);
    }
  };

  const handleSaveEndpoint = () => {
    if (!workflowUrl) {
      toast.error("Workflow URL cannot be empty");
      return;
    }
    try {
      new URL(workflowUrl); // Validate URL format
      setIsEditing(false);
      toast.success("Logic Apps workflow URL updated successfully");
    } catch (e) {
      toast.error("Please enter a valid workflow URL");
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-2xl">Logic Apps User Provisioning</CardTitle>
        <CardDescription>
          Configure and manage user provisioning through Microsoft Logic Apps
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration Section */}
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
                    variant="ghost"
                    size="icon"
                    onClick={handleSaveEndpoint}
                    className="h-10 w-10"
                  >
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(false)}
                    className="h-10 w-10"
                  >
                    <X className="h-4 w-4 text-red-500" />
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
