
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

  const handleSave = () => {
    if (!config.tenantId || !config.clientId || !config.clientSecret) {
      toast.error("Please fill in all fields");
      return;
    }
    onSave(config);
    onClose();
    toast.success("Entra configuration saved successfully");
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
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
