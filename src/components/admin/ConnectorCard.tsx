
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { toast } from "sonner";
import { Connector, ConnectorStatus } from "@/types/connector";

interface ConnectorCardProps {
  connector: Connector;
}

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

export const ConnectorCard = ({ connector }: ConnectorCardProps) => {
  const handleConfigure = () => {
    toast.info("Strata configuration panel coming soon");
  };

  return (
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
        <div>
          <Button
            variant="outline"
            className="hover-scale"
            onClick={handleConfigure}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>
    </Card>
  );
};
