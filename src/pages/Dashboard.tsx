
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Lock, Home, Check, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { accessRequests, identityStore } from "@/stores/accessStore";
import { toast } from "sonner";
import { useState } from "react";

type RequestStatus = 'pending' | 'approved' | 'rejected';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestId, email } = location.state || {};

  const handleApproval = (id: string, approved: boolean) => {
    if (!accessRequests.has(id)) {
      toast.error("Access request not found");
      return;
    }

    const request = accessRequests.get(id)!;
    const newStatus: RequestStatus = approved ? 'approved' : 'rejected';
    
    // Update the request with new status and approval time
    const updatedRequest = {
      ...request,
      status: newStatus,
      approvedAt: approved ? new Date() : undefined
    };
    
    accessRequests.set(id, updatedRequest);
    
    // If approved, add to identity store
    if (approved) {
      identityStore.set(request.email, {
        fullName: request.fullName,
        email: request.email,
        department: request.department,
        createdAt: new Date(),
        requestId: id
      });
      
      toast.success("Access request approved and identity added to the system");
    } else {
      toast.success("Access request rejected");
    }
    
    console.log("Updated access request:", Array.from(accessRequests.entries()));
  };

  // Get all pending requests
  const pendingRequests = Array.from(accessRequests.entries())
    .filter(([_, request]) => request.status === 'pending')
    .sort((a, b) => b[1].timestamp.getTime() - a[1].timestamp.getTime());

  // Get all requests for the current email (if email is provided)
  const userRequests = email 
    ? Array.from(accessRequests.entries())
      .filter(([_, request]) => request.email === email)
      .sort((a, b) => b[1].timestamp.getTime() - a[1].timestamp.getTime())
    : [];

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
          {/* Pending Requests Section */}
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
                      <p className="text-gray-600">Name: {request.fullName}</p>
                      <p className="text-gray-600">Email: {request.email}</p>
                      <p className="text-gray-600">Department: {request.department}</p>
                      <p className="text-gray-600">
                        Submitted: {request.timestamp.toLocaleDateString()}
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

          {/* User Request History Section (only shown if email is provided) */}
          {email && (
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
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No access request history found.</p>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
