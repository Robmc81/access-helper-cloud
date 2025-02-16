
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Settings, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { IdentityStoreTable } from "@/components/access/IdentityStoreTable";

const Identities = () => {
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
          <h1 className="text-3xl font-bold">Identity Store</h1>
          <Button
            variant="ghost"
            size="sm"
            className="hover-scale flex items-center gap-2"
            onClick={() => navigate("/admin")}
          >
            <Settings className="w-4 h-4" />
            Admin Portal
          </Button>
        </div>
        
        <IdentityStoreTable />
      </div>
    </div>
  );
};

export default Identities;
