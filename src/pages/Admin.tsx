
import { Button } from "@/components/ui/button";
import { Home, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BackupRestore } from "@/components/admin/BackupRestore";
import { ConnectorSettings } from "@/components/admin/ConnectorSettings";
import { LogsCard } from "@/components/admin/LogsCard";
import { LogicAppsTile } from "@/components/admin/LogicAppsTile";
import { Card } from "@/components/ui/card";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container animate-fadeIn">
        <Button
          variant="ghost"
          className="mb-6 hover-scale"
          onClick={() => navigate("/")}
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Settings</h1>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="flex items-center mb-4 text-xl font-semibold">
              <Users className="w-5 h-5 mr-2 text-success" />
              Identity Management
            </h2>
            <Button 
              variant="outline" 
              className="hover-scale w-full h-24"
              onClick={() => navigate("/identities")}
            >
              <div className="text-center">
                <h3 className="font-medium">Identity Store</h3>
                <p className="text-sm text-gray-600">View and manage user identities</p>
              </div>
            </Button>
          </Card>
          
          <LogicAppsTile />
          <ConnectorSettings />
          <LogsCard />
          <BackupRestore />
        </div>
      </div>
    </div>
  );
};

export default Admin;
