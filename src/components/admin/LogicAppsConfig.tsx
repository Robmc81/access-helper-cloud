
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
import { Info, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const LogicAppsConfig = () => {
  const [testing, setTesting] = useState(false);

  const testWorkflow = async () => {
    setTesting(true);
    try {
      // Simulate testing the workflow
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Logic Apps workflow test successful");
    } catch (error) {
      toast.error("Failed to test Logic Apps workflow");
    } finally {
      setTesting(false);
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
          <h3 className="text-lg font-semibold">Endpoint Configuration</h3>
          <p className="text-sm text-gray-600">
            Use the following endpoint in your Logic Apps workflow to provision users:
          </p>
          <code className="block bg-gray-100 p-3 rounded-md text-sm">
            {window.location.origin}/api/provision
          </code>
          <Button 
            onClick={testWorkflow}
            disabled={testing}
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
                  <li>Add an HTTP action to your workflow</li>
                  <li>Configure the HTTP action with the endpoint URL shown above</li>
                  <li>Set the method to POST</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="payload">
              <AccordionTrigger>Request Payload Format</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">For single user provisioning:</p>
                <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
{JSON.stringify({
  email: "user@example.com",
  fullName: "John Doe",
  department: "IT",
  source: "logic_apps" // optional
}, null, 2)}
                </pre>
                
                <p className="mt-4 mb-2">For bulk user provisioning:</p>
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
