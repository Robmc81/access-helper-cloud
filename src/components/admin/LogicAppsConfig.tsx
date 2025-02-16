
import { RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLogicAppsDB } from "@/hooks/useLogicAppsDB";
import { WorkflowUrlConfig } from "./WorkflowUrlConfig";
import { ImplementationGuide } from "./ImplementationGuide";

export const LogicAppsConfig = () => {
  const { loading, workflowUrl, saveWorkflowUrl } = useLogicAppsDB();

  if (loading) {
    console.log('Rendering loading state');
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

  console.log('Rendering main component');
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-2xl">Logic Apps User Provisioning</CardTitle>
        <CardDescription>
          Configure and manage user provisioning through Microsoft Logic Apps
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <WorkflowUrlConfig 
          workflowUrl={workflowUrl}
          onSave={saveWorkflowUrl}
        />
        <ImplementationGuide />
      </CardContent>
    </Card>
  );
};
