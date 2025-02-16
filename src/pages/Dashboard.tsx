
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Lock, Home, Check, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { accessRequests, identityStore } from "@/stores/accessStore";
import { toast } from "sonner";
import { useState } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestId, email } = location.state || {};
  const [currentStatus, setCurrentStatus] = useState(location.state?.status);

  const handleApproval = (approved: boolean) => {
    if (!requestId || !accessRequests.has(requestId)) {
      toast.error("Access request not found");
      return;
    }

    const request = accessRequests.get(requestId)!;
    const newStatus = approved ? 'approved' : 'rejected';
    
    // Update the request with new status and approval time
    accessRequests.set(requestId, {
      ...request,
      status: newStatus,
      approvedAt: approved ? new Date() : undefined
    });
    
    setCurrentStatus(newStatus);
    
    // If approved, add to identity store
    if (approved) {
      identityStore.set(request.email, {
        fullName: request.fullName,
        email: request.email,
        department: request.department,
        createdAt: new Date(),
        requestId: requestId
      });
      
      toast.success("Access request approved and identity added to the system");
    } else {
      toast.success("Access request rejected");
    }
  };

  // Get all requests for the current email
  const userRequests = Array.from(accessRequests.entries())
    .filter(([_, request]) => request.email === email)
    .sort((a, b) => b[1].timestamp.getTime() - a[1].timestamp.getTime());

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
        
        <div className="grid gap-6 mb-8">
          <Card className="p-6 glass-card">
            <h2 className="flex items-center mb-4 text-xl font-semibold">
              <Lock className="w-5 h-5 mr-2 text-success" />
              Access Request History
            </h2>
            {userRequests.length > 0 ? (
              <div className="space-y-6">
                {userRequests.map(([reqId, request]) => (
                  <div key={reqId} className="p-4 border rounded-lg">
                    <div className="space-y-2">
                      <p className="text-gray-600">Email: {request.email}</p>
                      <p className="text-gray-600">
                        Status: <span className="font-semibold capitalize">{request.status}</span>
                      </p>
                      <p className="text-gray-600">
                        Submitted: {request.timestamp.toLocaleDateString()}
                      </p>
                      {request.approvedAt && (
                        <p className="text-gray-600">
                          Approved: {request.approvedAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {request.status === 'pending' && reqId === requestId && (
                      <div className="flex gap-2 mt-4">
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
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No access request history found.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
