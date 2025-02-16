
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Terminal, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const LogsCard = () => {
  const navigate = useNavigate();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">System Logs</h2>
            <p className="text-xs text-gray-600">View and download system activity logs</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="hover-scale"
          onClick={() => navigate("/logs")}
        >
          <span>View Logs</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Card>
  );
};
