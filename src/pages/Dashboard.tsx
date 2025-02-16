
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Lock, Home, Check, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { accessRequests } from "./Index";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestId, email, status } = location.state || {};

  const handleApproval = (approved: boolean) => {
    if (!requestId || !accessRequests.has(requestId)) {
      toast.error("Access request not found");
      return;
    }

    const request = accessRequests.get(requestId)!;
    request.status = approved ? 'approved' : 'rejected';
    accessRequests.set(requestId, request);
    
    toast.success(`Access request ${approved ? 'approved' : 'rejected'} successfully`);
    navigate(0); // Refresh the page to update the status
  };

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
              Access Request Status
            </h2>
            {requestId ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-gray-600">Email: {email}</p>
                  <p className="text-gray-600">
                    Status: <span className="font-semibold capitalize">{status}</span>
                  </p>
                </div>
                {status === 'pending' && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleApproval(true)}
                      className="w-full"
                      variant="default"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      onClick={() => handleApproval(false)}
                      className="w-full"
                      variant="destructive"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
                {status === 'approved' && (
                  <p className="text-sm text-success">This request has been approved.</p>
                )}
                {status === 'rejected' && (
                  <p className="text-sm text-destructive">This request has been rejected.</p>
                )}
              </div>
            ) : (
              <p className="text-gray-600">No active access requests.</p>
            )}
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
