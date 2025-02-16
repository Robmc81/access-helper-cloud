import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Lock, Home, Check, X, Group } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { accessRequests, identityStore } from "@/stores/accessStore";
import { saveToIndexedDB, provisionIdentity } from "@/stores/indexedDBStore";
import { toast } from "sonner";
import { useState } from "react";

type RequestStatus = 'pending' | 'approved' | 'rejected';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestId, email } = location.state || {};
  const [refreshKey, setRefreshKey] = useState(0);

  const handleApproval = async (id: string, approved: boolean) => {
    try {
      if (!accessRequests.has(id)) {
        toast.error("Access request not found");
        return;
      }

      const request = accessRequests.get(id)!;
      const newStatus: RequestStatus = approved ? 'approved' : 'rejected';
      
      const updatedRequest = {
        ...request,
        status: newStatus,
        approvedAt: new Date()
      };
      
      accessRequests.set(id, updatedRequest);
      await saveToIndexedDB('accessRequests', updatedRequest);
      
      if (approved) {
        await provisionIdentity({
          email: request.email,
          fullName: request.fullName,
          department: request.department,
          source: 'access_request'
        });
        
        toast.success("Access request approved successfully");
      } else {
        toast.success("Access request rejected successfully");
      }

      setRefreshKey(prev => prev + 1);
      
    } catch (error) {
      console.error("Error handling approval:", error);
      toast.error("Failed to process request");
    }
  };

  const pendingRequests = Array.from(accessRequests.entries())
    .filter(([_, request]) => request.status === 'pending')
    .sort((a, b) => {
      const timeA = new Date(b[1].timestamp).getTime();
      const timeB = new Date(a[1].timestamp).getTime();
      return timeA - timeB;
    });

  const processedRequests = Array.from(accessRequests.entries())
    .filter(([_, request]) => request.status === 'approved' || request.status === 'rejected')
    .sort((a, b) => {
      const timeA = b[1].approvedAt ? new Date(b[1].approvedAt).getTime() : new Date(b[1].timestamp).getTime();
      const timeB = a[1].approvedAt ? new Date(a[1].approvedAt).getTime() : new Date(a[1].timestamp).getTime();
      return timeA - timeB;
    });

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
              Pending Access Requests
            </h2>
            {pendingRequests.length > 0 ? (
              <div className="space-y-6">
                {pendingRequests.map(([reqId, request]) => (
                  <div key={reqId} className="p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {request.type === 'group' ? (
                          <Group className="w-4 h-4 text-primary" />
                        ) : (
                          <User className="w-4 h-4 text-primary" />
                        )}
                        <span className="font-medium capitalize">{request.type} Access Request</span>
                      </div>
                      <p className="text-gray-600">Name: {request.fullName}</p>
                      <p className="text-gray-600">Email: {request.email}</p>
                      <p className="text-gray-600">Department: {request.department}</p>
                      {request.type === 'group' && (
                        <p className="text-gray-600">Group: {request.groupName}</p>
                      )}
                      <p className="text-gray-600">
                        Submitted: {new Date(request.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        onClick={() => handleApproval(reqId, true)}
                        className="w-full"
                        variant="default"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        onClick={() => handleApproval(reqId, false)}
                        className="w-full"
                        variant="destructive"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No pending requests found.</p>
            )}
          </Card>

          <Card className="p-6 glass-card">
            <h2 className="flex items-center mb-4 text-xl font-semibold">
              <Lock className="w-5 h-5 mr-2 text-success" />
              Access Request History
            </h2>
            {processedRequests.length > 0 ? (
              <div className="space-y-6">
                {processedRequests.map(([reqId, request]) => (
                  <div key={reqId} className="p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {request.type === 'group' ? (
                          <Group className="w-4 h-4 text-primary" />
                        ) : (
                          <User className="w-4 h-4 text-primary" />
                        )}
                        <span className="font-medium capitalize">{request.type} Access Request</span>
                      </div>
                      <p className="text-gray-600">Name: {request.fullName}</p>
                      <p className="text-gray-600">Email: {request.email}</p>
                      <p className="text-gray-600">Department: {request.department}</p>
                      {request.type === 'group' && (
                        <p className="text-gray-600">Group: {request.groupName}</p>
                      )}
                      <p className="text-gray-600">
                        Status: <span className={`font-semibold capitalize ${
                          request.status === 'approved' ? 'text-green-600' : 'text-red-600'
                        }`}>{request.status}</span>
                      </p>
                      <p className="text-gray-600">
                        Submitted: {new Date(request.timestamp).toLocaleDateString()}
                      </p>
                      {request.approvedAt && (
                        <p className="text-gray-600">
                          {request.status === 'approved' ? 'Approved' : 'Rejected'}: {new Date(request.approvedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No processed requests found.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
