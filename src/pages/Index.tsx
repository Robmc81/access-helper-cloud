
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { User, UserPlus, Users, Clock, AppWindow, Group, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RequestAccessDialog, formSchema } from "@/components/access/RequestAccessDialog";
import { IdentityStoreTable } from "@/components/access/IdentityStoreTable";
import { accessRequests } from "@/stores/accessStore";
import { saveToIndexedDB } from "@/stores/indexedDBStore";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'regular' | 'guest'>('regular');
  const [pendingCount, setPendingCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Count pending requests
    const count = Array.from(accessRequests.values()).filter(
      request => request.status === 'pending'
    ).length;
    setPendingCount(count);
  }, []);

  const handleAccessRequest = async (values: z.infer<typeof formSchema>) => {
    const isGuest = dialogType === 'guest';
    setIsRequestingAccess(true);
    const requestId = crypto.randomUUID();
    const requestData = {
      id: requestId,
      fullName: values.fullName,
      email: values.email,
      department: values.department,
      status: 'pending' as const,
      timestamp: new Date(),
      type: isGuest ? 'guest' : 'regular',
    };
    
    try {
      // Save to both localStorage and IndexedDB
      accessRequests.set(requestId, requestData);
      await saveToIndexedDB('accessRequests', requestData);
      setPendingCount(prev => prev + 1);
      
      toast.success(`${isGuest ? 'Guest access' : 'Access'} request submitted successfully! Check pending requests for status.`);
    } catch (error) {
      console.error('Error saving access request:', error);
      toast.error('Failed to save access request');
    }
    
    setShowDialog(false);
    setIsRequestingAccess(false);
  };

  const openDialog = (type: 'regular' | 'guest') => {
    setDialogType(type);
    setShowDialog(true);
  };

  const features = [
    {
      icon: Clock,
      title: "Pending Requests",
      description:
        "View and manage all pending access requests awaiting approval.",
      route: "/dashboard",
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      icon: User,
      title: "Access Request History",
      description:
        "View Access Request History",
      route: "/dashboard",
    },
    {
      icon: Users,
      title: "Identity Store",
      description:
        "Centralized identity store with powerful search capabilities for efficient user management.",
      route: "/identities",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
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
      <div className="container px-4 mx-auto">
        <div className="flex flex-col items-start gap-4 pt-4">
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
          
          <div className="w-full flex flex-col items-center gap-4 animate-fadeIn sm:flex-row sm:justify-start">
            <Button
              size="lg"
              className="w-full animate-fadeIn hover-scale sm:w-auto"
              onClick={() => openDialog('regular')}
              disabled={isRequestingAccess}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Request New Account
            </Button>
            <Button
              size="lg"
              className="w-full animate-fadeIn hover-scale sm:w-auto"
              onClick={() => openDialog('guest')}
              disabled={isRequestingAccess}
            >
              <User className="w-5 h-5 mr-2" />
              Request Guest Account
            </Button>
            <Button
              size="lg"
              className="w-full animate-fadeIn hover-scale sm:w-auto"
              onClick={() => navigate("/catalog")}
            >
              <AppWindow className="w-5 h-5 mr-2" />
              Request Application Access
            </Button>
            <Button
              size="lg"
              className="w-full animate-fadeIn hover-scale sm:w-auto"
              onClick={() => navigate("/groups")}
            >
              <Group className="w-5 h-5 mr-2" />
              Request Group Access
            </Button>
          </div>
        </div>

        <div className="mt-16 space-y-8">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="p-6 glass-card hover-scale cursor-pointer transition-all"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
              onClick={() => navigate(feature.route)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <feature.icon className="w-12 h-12 p-2 mb-4 text-success bg-success/10 rounded-lg" />
                  <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
                {feature.badge && (
                  <Badge variant="destructive" className="text-sm px-2 py-1">
                    {feature.badge} pending
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>

        <RequestAccessDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          onSubmit={handleAccessRequest}
          isSubmitting={isRequestingAccess}
          isGuestRequest={dialogType === 'guest'}
        />
      </div>
    </div>
  );
};

export default Index;
