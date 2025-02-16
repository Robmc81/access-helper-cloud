
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Database, RefreshCw, Settings, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";

type ConnectorStatus = "active" | "inactive" | "error";

interface Connector {
  id: string;
  name: string;
  type: "ldap" | "azure-ad" | "entra" | "custom";
  status: ConnectorStatus;
  lastSync: Date | null;
  description: string;
}

const initialConnectors: Connector[] = [
  {
    id: "1",
    name: "Active Directory Sync",
    type: "ldap",
    status: "inactive",
    lastSync: null,
    description: "Synchronize identities from on-premise Active Directory"
  },
  {
    id: "2",
    name: "Azure AD Connector",
    type: "azure-ad",
    status: "inactive",
    lastSync: null,
    description: "Cloud identity synchronization with Azure Active Directory"
  },
  {
    id: "3",
    name: "Microsoft Entra Integration",
    type: "entra",
    status: "inactive",
    lastSync: null,
    description: "Modern identity and access management with Microsoft Entra"
  }
];

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

  const getStatusColor = (status: ConnectorStatus) => {
    switch (status) {
      case "active":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
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
                <Card key={connector.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">{connector.name}</h3>
                      <p className="text-sm text-gray-600">{connector.description}</p>
                      <div className="flex items-center space-x-4">
                        <span className={`text-sm ${getStatusColor(connector.status)}`}>
                          Status: {connector.status}
                        </span>
                        {connector.lastSync && (
                          <span className="text-sm text-gray-600">
                            Last sync: {connector.lastSync.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleSync(connector.id)}
                        disabled={syncing === connector.id}
                        className="hover-scale"
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${syncing === connector.id ? 'animate-spin' : ''}`} />
                        {syncing === connector.id ? 'Syncing...' : 'Sync Now'}
                      </Button>
                      <Button
                        variant="outline"
                        className="hover-scale"
                        onClick={() => toast.info("Configuration panel coming soon")}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

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
        </div>
      </div>
    </div>
  );
};

export default Admin;
