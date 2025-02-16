
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Shield, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { ConnectorCard } from "@/components/admin/ConnectorCard";
import { AdvancedSettings } from "@/components/admin/AdvancedSettings";
import { Connector, initialConnectors } from "@/types/connector";

const Admin = () => {
  const navigate = useNavigate();
  const [connectors, setConnectors] = useState<Connector[]>(initialConnectors);
  const [syncing, setSyncing] = useState<string | null>(null);

  const handleSync = async (connectorId: string) => {
    setSyncing(connectorId);
    
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setConnectors(prev => prev.map(connector => {
      if (connector.id === connectorId) {
        return {
          ...connector,
          status: "active",
          lastSync: new Date()
        };
      }
      return connector;
    }));
    
    toast.success("Synchronization completed successfully");
    setSyncing(null);
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            className="hover-scale"
            onClick={() => navigate("/")}
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold">Admin Portal</h1>
          <Button variant="outline" className="hover-scale">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        <div className="grid gap-6">
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 mr-2 text-success" />
              <h2 className="text-xl font-semibold">Identity Synchronization</h2>
            </div>
            <div className="space-y-4">
              {connectors.map((connector) => (
                <ConnectorCard
                  key={connector.id}
                  connector={connector}
                  onSync={handleSync}
                  syncing={syncing}
                />
              ))}
            </div>
          </Card>

          <AdvancedSettings />
        </div>
      </div>
    </div>
  );
};

export default Admin;
