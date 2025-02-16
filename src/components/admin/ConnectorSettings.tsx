
import { useState } from "react";
import { Connector, initialConnectors } from "@/types/connector";
import { ConnectorCard } from "./ConnectorCard";
import { toast } from "sonner";

export const ConnectorSettings = () => {
  const [connectors, setConnectors] = useState<Connector[]>(initialConnectors);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSync = async (id: string) => {
    setSyncingId(id);
    
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setConnectors(prevConnectors =>
      prevConnectors.map(connector =>
        connector.id === id
          ? {
              ...connector,
              status: "active",
              lastSync: new Date(),
            }
          : connector
      )
    );
    
    setSyncingId(null);
    toast.success("Identity orchestration synchronized successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">IDP Settings</h2>
      </div>
      
      <div className="space-y-4">
        {connectors.map((connector) => (
          <ConnectorCard
            key={connector.id}
            connector={connector}
            onSync={handleSync}
            syncing={syncingId}
          />
        ))}
      </div>
    </div>
  );
};
