
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LogsSettings } from "@/components/admin/LogsSettings";

const Logs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container animate-fadeIn">
        <Button
          variant="ghost"
          className="mb-6 hover-scale"
          onClick={() => navigate("/admin")}
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Admin
        </Button>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">System Logs</h1>
        </div>

        <LogsSettings />
      </div>
    </div>
  );
};

export default Logs;
