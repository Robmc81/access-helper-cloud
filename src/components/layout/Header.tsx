
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <div className="fixed top-4 right-4 z-10">
        <Button
          variant="ghost"
          className="text-gray-600 hover:text-gray-900"
          onClick={() => navigate("/admin")}
        >
          <Settings className="w-4 h-4 mr-2" />
          Admin
        </Button>
      </div>
      <div className="mb-8">
        <img 
          src="/lovable-uploads/bd8565df-34df-4671-aed8-f98870e9b36d.png" 
          alt="U.S. Army Logo" 
          className="w-24 h-auto"
        />
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          OCG DDIL
        </h1>
      </div>
    </>
  );
};
