
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BackupRestore } from "@/components/admin/BackupRestore";
import { ConnectorSettings } from "@/components/admin/ConnectorSettings";
import { LogicAppsConfig } from "@/components/admin/LogicAppsConfig";

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
          <LogicAppsConfig />
          <ConnectorSettings />
          <BackupRestore />
        </div>
      </div>
    </div>
  );
};

export default Admin;
