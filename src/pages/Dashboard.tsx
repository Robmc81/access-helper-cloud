
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Lock } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container animate-fadeIn">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Access Dashboard</h1>
          <Button variant="outline" className="hover-scale">
            <User className="w-4 h-4 mr-2" />
            My Profile
          </Button>
        </div>
        
        <div className="grid gap-6 mb-8 md:grid-cols-2">
          <Card className="p-6 glass-card">
            <h2 className="flex items-center mb-4 text-xl font-semibold">
              <Lock className="w-5 h-5 mr-2 text-success" />
              Pending Requests
            </h2>
            <p className="text-gray-600">No pending requests at this time.</p>
          </Card>
          
          <Card className="p-6 glass-card">
            <h2 className="flex items-center mb-4 text-xl font-semibold">
              <User className="w-5 h-5 mr-2 text-success" />
              Recent Activity
            </h2>
            <p className="text-gray-600">No recent activity to display.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
