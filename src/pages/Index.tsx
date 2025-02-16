import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { User, UserPlus, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  department: z.string().min(2, "Department must be at least 2 characters"),
});

// Simple in-memory stores
export const accessRequests = new Map<string, {
  fullName: string;
  email: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: Date;
}>();

export const identityStore = new Map<string, {
  fullName: string;
  email: string;
  department: string;
  createdAt: Date;
}>();

const Index = () => {
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      department: "",
    },
  });

  const handleAccessRequest = async (values: z.infer<typeof formSchema>) => {
    setIsRequestingAccess(true);
    // Store the request in our simple datastore with proper typing
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
    
    toast.success("Access request submitted successfully! Awaiting approval.");
    setShowDialog(false);
    console.log("Current access requests:", Array.from(accessRequests.entries()));
    
    setTimeout(() => {
      setIsRequestingAccess(false);
      navigate("/dashboard", { 
        state: { 
          requestId,
          email: values.email,
          status: 'pending'
        } 
      });
    }, 1000);
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
            onClick={() => setShowDialog(true)}
            disabled={isRequestingAccess}
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Request Access
          </Button>
        </div>

        <div className="grid gap-8 mt-24 md:grid-cols-1">
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

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Access</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAccessRequest)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="Engineering" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isRequestingAccess}>
                    {isRequestingAccess ? (
                      "Submitting..."
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
];

export default Index;
