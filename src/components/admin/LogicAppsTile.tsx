
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings, Workflow } from "lucide-react";

export const LogicAppsTile = () => {
  const handleConfigure = () => {
    // TODO: Implement configuration dialog
    console.log("Configure Logic Apps clicked");
  };

  return (
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
        <p className="text-sm text-muted-foreground">
          Connect to Azure Logic Apps to automate user provisioning and access management workflows.
        </p>
      </CardContent>
    </Card>
  );
};
