
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Users, User, Settings } from "lucide-react";
import { GroupList } from "@/components/groups/GroupList";

const Groups = () => {
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
          <div>
            <h1 className="text-3xl font-bold">Groups</h1>
            <p className="text-muted-foreground">Manage access groups and their members</p>
          </div>
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
        
        <GroupList />
      </div>
    </div>
  );
};

export default Groups;
