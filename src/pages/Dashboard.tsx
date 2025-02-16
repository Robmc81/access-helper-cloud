
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Lock, Home, Check, X, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { accessRequests, identityStore } from "./Index";
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
    request.status = newStatus;
    accessRequests.set(requestId, request);
    setCurrentStatus(newStatus);
    
    // If approved, add to identity store
    if (approved) {
      identityStore.set(request.email, {
        fullName: request.fullName,
        email: request.email,
        department: request.department,
        createdAt: new Date()
      });
    }
    
    toast.success(`Access request ${approved ? 'approved' : 'rejected'} successfully`);
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
                    Status: <span className="font-semibold capitalize">{currentStatus}</span>
                  </p>
                </div>
                {currentStatus === 'pending' && (
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
                {currentStatus === 'approved' && (
                  <p className="text-sm text-success">This request has been approved.</p>
                )}
                {currentStatus === 'rejected' && (
                  <p className="text-sm text-destructive">This request has been rejected.</p>
                )}
              </div>
            ) : (
              <p className="text-gray-600">No active access requests.</p>
            )}
          </Card>
          
          <Card className="p-6 glass-card">
            <h2 className="flex items-center mb-4 text-xl font-semibold">
              <Users className="w-5 h-5 mr-2 text-success" />
              Identity Store
            </h2>
            <div className="overflow-hidden rounded-lg border bg-white">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Department</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Array.from(identityStore.values()).map((identity) => (
                    <tr key={identity.email} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">{identity.fullName}</div>
                          <div className="text-sm text-gray-500">{identity.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {identity.department}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {identity.createdAt.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {Array.from(identityStore.values()).length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-sm text-gray-500 text-center">
                        No approved identities yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
