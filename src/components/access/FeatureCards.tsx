
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Users, Group } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  route: string;
  badge?: number | null;
}

interface FeatureCardsProps {
  pendingCount: number;
}

export const FeatureCards = ({ pendingCount }: FeatureCardsProps) => {
  const navigate = useNavigate();
  
  const features: Feature[] = [
    {
      icon: Clock,
      title: "Pending Requests",
      description: "View and manage all pending access requests awaiting approval.",
      route: "/dashboard",
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      icon: User,
      title: "Access Request History",
      description: "View Access Request History",
      route: "/dashboard",
    },
    {
      icon: Users,
      title: "Identity Store",
      description: "Centralized identity store with powerful search capabilities for efficient user management.",
      route: "/identities",
    },
    {
      icon: Group,
      title: "Groups",
      description: "View and manage access groups and their members.",
      route: "/groups",
    },
  ];

  return (
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
  );
};
