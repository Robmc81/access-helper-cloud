
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Users, Plus, Trash } from "lucide-react";
import { GroupList } from "@/components/groups/GroupList";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { toast } from "sonner";
import { groups, Group } from "@/stores/groupStore";
import { useForm } from "react-hook-form";

interface CreateGroupForm {
  name: string;
  description: string;
}

const Groups = () => {
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const form = useForm<CreateGroupForm>({
    defaultValues: {
      name: "",
      description: ""
    }
  });

  const onCreateGroup = (data: CreateGroupForm) => {
    const newGroup: Group = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description,
      members: [],
      createdAt: new Date()
    };

    groups.set(newGroup.id, newGroup);
    toast.success("Group created successfully");
    setShowCreateDialog(false);
    form.reset();
  };

  const onDeleteGroup = (groupId: string) => {
    const group = groups.get(groupId);
    if (!group) return;

    if (group.members.length > 0) {
      toast.error("Cannot delete group with members");
      return;
    }

    groups.delete(groupId);
    toast.success("Group deleted successfully");
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
          <div>
            <h1 className="text-3xl font-bold">Groups</h1>
            <p className="text-muted-foreground">Manage access groups and their members</p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="hover-scale flex items-center gap-2"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="w-4 h-4" />
              Create Group
            </Button>
          </div>
        </div>
        
        <GroupList onDeleteGroup={onDeleteGroup} />

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCreateGroup)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter group name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter group description" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Group</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Groups;
