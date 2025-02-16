
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { User, UserPlus, Users, Clock, AppWindow, UserGroup } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RequestAccessDialog, formSchema } from "@/components/access/RequestAccessDialog";
import { IdentityStoreTable } from "@/components/access/IdentityStoreTable";
import { accessRequests } from "@/stores/accessStore";
import * as z from "zod";

const features = [
  {
    icon: Clock,
    title: "Pending Requests",
    description:
      "View and manage all pending access requests awaiting approval.",
    route: "/dashboard",
  },
  {
    icon: User,
    title: "Access Request",
    description:
      "View and manage all approved identities in the system.",
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

const Index = () => {
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();

  const handleAccessRequest = async (values: z.infer<typeof formSchema>) => {
    setIsRequestingAccess(true);
    const requestId = crypto.randomUUID();
    const requestData = {
      fullName: values.fullName,
      email: values.email,
      department: values.department,
      status: 'pending' as const,
      timestamp: new Date(),
    };
    accessRequests.set(requestId, requestData);
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast.success("Access request submitted successfully! Check pending requests for status.");
    setShowDialog(false);
    setIsRequestingAccess(false);
    
    console.log("Current access requests:", Array.from(accessRequests.entries()));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="fixed top-4 left-4">
        <img 
          src="/lovable-uploads/bd8565df-34df-4671-aed8-f98870e9b36d.png" 
          alt="U.S. Army Logo" 
          className="w-24 h-auto"
        />
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          OCG DDIL
        </h1>
      </div>
      <div className="container px-4 py-16 mx-auto">
        <div className="flex flex-col items-center gap-4 animate-fadeIn sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="w-full animate-fadeIn hover-scale sm:w-auto"
            onClick={() => setShowDialog(true)}
            disabled={isRequestingAccess}
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Request New Account
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="w-full animate-fadeIn hover-scale sm:w-auto"
            onClick={() => navigate("/catalog")}
          >
            <AppWindow className="w-5 h-5 mr-2" />
            Request Application Access
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full animate-fadeIn hover-scale sm:w-auto"
            onClick={() => navigate("/groups")}
          >
            <UserGroup className="w-5 h-5 mr-2" />
            Request Group Access
          </Button>
        </div>

        <div className="mt-24 space-y-8">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="p-6 glass-card hover-scale cursor-pointer transition-all"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
              onClick={() => navigate(feature.route)}
            >
              <feature.icon className="w-12 h-12 p-2 mb-4 text-success bg-success/10 rounded-lg" />
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>

        <RequestAccessDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          onSubmit={handleAccessRequest}
          isSubmitting={isRequestingAccess}
        />
      </div>
    </div>
  );
};

export default Index;
