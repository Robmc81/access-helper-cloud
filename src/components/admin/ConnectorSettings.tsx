
import { useState } from "react";
import { Connector, initialConnectors } from "@/types/connector";
import { ConnectorCard } from "./ConnectorCard";

export const ConnectorSettings = () => {
  const [connectors] = useState<Connector[]>(initialConnectors);

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
          />
        ))}
      </div>
    </div>
  );
};
