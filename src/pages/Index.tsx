
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { User, UserPlus, Lock, Search, Workflow } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const navigate = useNavigate();

  const handleAccessRequest = () => {
    setIsRequestingAccess(true);
    toast.success("Access request submitted successfully!");
    setTimeout(() => {
      setIsRequestingAccess(false);
      navigate("/dashboard");
    }, 2000);
  };

  const handleTileClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container px-4 py-16 mx-auto">
        <div className="text-center animate-fadeIn">
          <div className="inline-flex items-center px-4 py-2 mb-8 text-sm font-medium text-success-foreground bg-success/10 rounded-full">
            <Lock className="w-4 h-4 mr-2" />
            Secure Access Management
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-6xl">
            Streamline Access Management
          </h1>
          <p className="max-w-2xl mx-auto mb-12 text-lg text-gray-600">
            Simplify application access requests and entitlement management with our
            intuitive platform.
          </p>
          <Button
            size="lg"
            className="animate-fadeIn hover-scale"
            onClick={handleAccessRequest}
            disabled={isRequestingAccess}
          >
            {isRequestingAccess ? (
              "Submitting..."
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                Request Access
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-8 mt-24 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="p-6 glass-card hover-scale cursor-pointer transition-all"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
              onClick={() => handleTileClick(feature.route)}
            >
              <feature.icon className="w-12 h-12 p-2 mb-4 text-success bg-success/10 rounded-lg" />
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const features = [
  {
    icon: User,
    title: "Identity Management",
    description:
      "Centralized identity store with powerful search capabilities for efficient user management.",
    route: "/dashboard",
  },
  {
    icon: Workflow,
    title: "Workflow Automation",
    description:
      "Streamline access requests with automated approval workflows and notifications.",
    route: "/dashboard",
  },
  {
    icon: Search,
    title: "Quick Search",
    description:
      "Find and manage user entitlements quickly with our advanced search functionality.",
    route: "/catalog",
  },
];

export default Index;
