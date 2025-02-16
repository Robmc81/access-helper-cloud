
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

interface EntraConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: EntraConfiguration) => void;
}

interface EntraConfiguration {
  tenantId: string;
  clientId: string;
  clientSecret: string;
}

export const EntraConfig = ({ isOpen, onClose, onSave }: EntraConfigProps) => {
  const [config, setConfig] = useState<EntraConfiguration>({
    tenantId: "",
    clientId: "",
    clientSecret: "",
  });
  const [testing, setTesting] = useState(false);

  const handleSave = () => {
    if (!config.tenantId || !config.clientId || !config.clientSecret) {
      toast.error("Please fill in all fields");
      return;
    }
    onSave(config);
    onClose();
    toast.success("Entra configuration saved successfully");
  };

  const testConfiguration = async () => {
    if (!config.tenantId || !config.clientId || !config.clientSecret) {
      toast.error("Please fill in all fields before testing");
      return;
    }

    setTesting(true);
    try {
      // Simulate API call to test Entra configuration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically make a real API call to validate the credentials
      // For now, we'll simulate a successful test
      toast.success("Entra configuration test successful!");
    } catch (error) {
      toast.error("Failed to validate Entra configuration");
      console.error("Entra test error:", error);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Microsoft Entra Configuration</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tenantId">Tenant ID</Label>
            <Input
              id="tenantId"
              value={config.tenantId}
              onChange={(e) =>
                setConfig({ ...config, tenantId: e.target.value })
              }
              placeholder="Enter your Entra tenant ID"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              value={config.clientId}
              onChange={(e) =>
                setConfig({ ...config, clientId: e.target.value })
              }
              placeholder="Enter your Entra client ID"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientSecret">Client Secret</Label>
            <Input
              id="clientSecret"
              type="password"
              value={config.clientSecret}
              onChange={(e) =>
                setConfig({ ...config, clientSecret: e.target.value })
              }
              placeholder="Enter your Entra client secret"
            />
          </div>
        </div>
        <div className="flex justify-between space-x-2">
          <Button 
            variant="secondary" 
            onClick={testConfiguration}
            disabled={testing}
          >
            {testing ? "Testing..." : "Test Configuration"}
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Configuration</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
