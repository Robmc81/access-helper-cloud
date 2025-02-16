import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { User, UserPlus, Users, Clock, AppWindow, Group, Settings, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RequestAccessDialog, formSchema } from "@/components/access/RequestAccessDialog";
import { IdentityStoreTable } from "@/components/access/IdentityStoreTable";
import { accessRequests } from "@/stores/accessStore";
import { saveToIndexedDB } from "@/stores/indexedDBStore";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { groups } from "@/stores/groupStore";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";

const Index = () => {
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'regular' | 'guest'>('regular');
  const [pendingCount, setPendingCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isRequestingForOther, setIsRequestingForOther] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      department: "",
    },
  });

  const openDialog = (type: 'regular' | 'guest') => {
    setDialogType(type);
    setShowDialog(true);
  };

  useEffect(() => {
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
      type: isGuest ? 'guest' as const : 'regular' as const,
    };
    
    try {
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

  const handleGroupRequest = async (groupId: string) => {
    const group = groups.get(groupId);
    if (group) {
      const requestId = crypto.randomUUID();
      let requestData;

      if (isRequestingForOther) {
        const values = form.getValues();
        if (!values.fullName || !values.email || !values.department) {
          toast.error("Please fill in all user details");
          return;
        }
        requestData = {
          id: requestId,
          fullName: values.fullName,
          email: values.email,
          department: values.department,
          status: 'pending' as const,
          timestamp: new Date(),
          type: 'group' as const,
          groupId: groupId,
          groupName: group.name
        };
      } else {
        requestData = {
          id: requestId,
          fullName: "Current User",
          email: "user@example.com",
          department: "Unknown",
          status: 'pending' as const,
          timestamp: new Date(),
          type: 'group' as const,
          groupId: groupId,
          groupName: group.name
        };
      }
      
      try {
        accessRequests.set(requestId, requestData);
        await saveToIndexedDB('accessRequests', requestData);
        setPendingCount(prev => prev + 1);
        toast.success(`Request submitted for ${group.name} group access`);
        setSheetOpen(false);
        setIsRequestingForOther(false);
        form.reset();
      } catch (error) {
        console.error('Error saving group access request:', error);
        toast.error('Failed to save group access request');
      }
    }
  };

  const filteredGroups = Array.from(groups.entries()).filter(([_, group]) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    {
      icon: Group,
      title: "Groups",
      description:
        "View and manage access groups and their members.",
      route: "/groups",
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
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  size="lg"
                  className="w-full animate-fadeIn hover-scale sm:w-auto"
                >
                  <Group className="w-5 h-5 mr-2" />
                  Request Group Access
                </Button>
              </SheetTrigger>
              <SheetTrigger asChild>
                <Button
                  size="lg"
                  className="w-full animate-fadeIn hover-scale sm:w-auto"
                  onClick={() => setIsRequestingForOther(true)}
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Request Group Access for Another User
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>
                    {isRequestingForOther 
                      ? "Request Group Access for Another User"
                      : "Request Group Access"}
                  </SheetTitle>
                </SheetHeader>
                {isRequestingForOther && (
                  <div className="py-4">
                    <Form {...form}>
                      <form className="space-y-4">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
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
                            </FormItem>
                          )}
                        />
                      </form>
                    </Form>
                  </div>
                )}
                <div className="py-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search groups..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {filteredGroups.map(([id, group]) => (
                      <Card
                        key={id}
                        className="p-4 cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => handleGroupRequest(id)}
                      >
                        <div className="flex items-start gap-3">
                          <Users className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <h3 className="font-semibold">{group.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {group.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
                <SheetFooter className="mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsRequestingForOther(false);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
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
