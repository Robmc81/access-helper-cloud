
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Database } from "lucide-react";
import { toast } from "sonner";

export const AdvancedSettings = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center mb-4">
        <Database className="w-6 h-6 mr-2 text-success" />
        <h2 className="text-xl font-semibold">Advanced Settings</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Button
          variant="outline"
          className="hover-scale h-24"
          onClick={() => toast.info("Feature coming soon")}
        >
          <div className="text-center">
            <h3 className="font-medium">Mapping Rules</h3>
            <p className="text-sm text-gray-600">Configure attribute mapping rules</p>
          </div>
        </Button>
        <Button
          variant="outline"
          className="hover-scale h-24"
          onClick={() => toast.info("Feature coming soon")}
        >
          <div className="text-center">
            <h3 className="font-medium">Sync Schedules</h3>
            <p className="text-sm text-gray-600">Set up automated sync schedules</p>
          </div>
        </Button>
        <Button
          variant="outline"
          className="hover-scale h-24"
          onClick={() => toast.info("Feature coming soon")}
        >
          <div className="text-center">
            <h3 className="font-medium">Audit Logs</h3>
            <p className="text-sm text-gray-600">View synchronization history</p>
          </div>
        </Button>
        <Button
          variant="outline"
          className="hover-scale h-24"
          onClick={() => toast.info("Feature coming soon")}
        >
          <div className="text-center">
            <h3 className="font-medium">Error Handling</h3>
            <p className="text-sm text-gray-600">Configure error notifications</p>
          </div>
        </Button>
      </div>
    </Card>
  );
};
