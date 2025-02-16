
import { useState, useEffect } from "react";
import { RequestAccessDialog, formSchema } from "@/components/access/RequestAccessDialog";
import { accessRequests } from "@/stores/accessStore";
import { saveToIndexedDB } from "@/stores/indexedDBStore";
import { useForm } from "react-hook-form";
import { Sheet } from "@/components/ui/sheet";
import { toast } from "sonner";
import * as z from "zod";
import { Header } from "@/components/layout/Header";
import { ActionButtons } from "@/components/access/ActionButtons";
import { FeatureCards } from "@/components/access/FeatureCards";
import { GroupRequestSheet } from "@/components/access/GroupRequestSheet";
import { groups } from "@/stores/groupStore";

const Index = () => {
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'regular' | 'guest'>('regular');
  const [pendingCount, setPendingCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isRequestingForOther, setIsRequestingForOther] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col items-start gap-4 pt-4">
          <Header />
          <ActionButtons 
            isRequestingAccess={isRequestingAccess}
            onRequestAccess={openDialog}
            onRequestForOther={() => setIsRequestingForOther(true)}
          />
        </div>

        <FeatureCards pendingCount={pendingCount} />

        <RequestAccessDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          onSubmit={handleAccessRequest}
          isSubmitting={isRequestingAccess}
          isGuestRequest={dialogType === 'guest'}
        />

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <GroupRequestSheet
            isRequestingForOther={isRequestingForOther}
            searchQuery={searchQuery}
            onSearchChange={(value) => setSearchQuery(value)}
            form={form}
            onGroupRequest={handleGroupRequest}
            onCancel={() => {
              setIsRequestingForOther(false);
              form.reset();
            }}
          />
        </Sheet>
      </div>
    </div>
  );
};

export default Index;
