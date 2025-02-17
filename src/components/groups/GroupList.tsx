
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, User, Trash, UserPlus, UserMinus } from "lucide-react";
import { groups, Group } from "@/stores/groupStore";
import { identityStore, Identity } from "@/stores/accessStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { toast } from "sonner";

interface GroupListProps {
  onDeleteGroup: (groupId: string) => void;
}

export const GroupList = ({ onDeleteGroup }: GroupListProps) => {
  const [groupsData, setGroupsData] = useState<[string, Group][]>([]);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<Identity[]>([]);

  useEffect(() => {
    updateGroupsData();
  }, []);

  const updateGroupsData = () => {
    console.log("Updating groups data");
    const sortedGroups = Array.from(groups.entries()).sort((a, b) => 
      a[1].name.localeCompare(b[1].name)
    );
    console.log("Sorted groups:", sortedGroups);
    setGroupsData(sortedGroups);
  };

  const getMemberDetails = (email: string) => {
    return identityStore.get(email);
  };

  const handleAddMember = (groupId: string) => {
    console.log("Adding member to group:", groupId);
    setSelectedGroupId(groupId);
    const currentGroup = groups.get(groupId);
    if (currentGroup) {
      // Get all users that aren't already in the group
      const allUsers = Array.from(identityStore.values());
      console.log("All users:", allUsers);
      const filteredUsers = allUsers.filter(user => 
        !currentGroup.members.includes(user.email)
      );
      console.log("Filtered users:", filteredUsers);
      setAvailableUsers(filteredUsers);
      setShowAddMemberDialog(true);
    }
  };

  const handleSelectUser = (email: string) => {
    console.log("Selected user:", email);
    if (selectedGroupId) {
      const group = groups.get(selectedGroupId);
      console.log("Current group:", group);
      if (group) {
        const updatedGroup = {
          ...group,
          members: [...group.members, email]
        };
        console.log("Updated group:", updatedGroup);
        groups.set(selectedGroupId, updatedGroup);
        updateGroupsData();
        setShowAddMemberDialog(false);
        toast.success("Member added to group successfully");
      }
    }
  };

  const handleRemoveMember = (groupId: string, email: string) => {
    const group = groups.get(groupId);
    if (group) {
      const updatedGroup = {
        ...group,
        members: group.members.filter(member => member !== email)
      };
      groups.set(groupId, updatedGroup);
      updateGroupsData();
      toast.success("Member removed from group successfully");
    }
  };

  return (
    <div className="grid gap-6">
      {groupsData.map(([id, group]) => (
        <Card key={id} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-xl font-semibold">{group.name}</h3>
                <p className="text-sm text-muted-foreground">{group.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-destructive"
                onClick={() => onDeleteGroup(id)}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Accordion type="single" collapsible>
            <AccordionItem value="members">
              <AccordionTrigger>View Members</AccordionTrigger>
              <AccordionContent>
                <div className="mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddMember(id)}
                    className="hover-scale"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </div>
                <ScrollArea className="h-[200px] rounded-md border p-4">
                  {group.members.length > 0 ? (
                    <div className="space-y-4">
                      {group.members.map((email) => {
                        const member = getMemberDetails(email);
                        return (
                          <div key={email} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">
                                  {member?.fullName || email}
                                </p>
                                {member?.department && (
                                  <p className="text-sm text-muted-foreground">
                                    {member.department}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(id, email)}
                              className="hover:text-destructive"
                            >
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No members in this group
                    </p>
                  )}
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      ))}

      <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member to Group</DialogTitle>
          </DialogHeader>
          <Command>
            <CommandInput placeholder="Search users..." />
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              {availableUsers.map((user) => (
                <CommandItem
                  key={user.email}
                  onSelect={() => handleSelectUser(user.email)}
                  className="cursor-pointer"
                >
                  <User className="w-4 h-4 mr-2" />
                  <div>
                    <p>{user.fullName}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddMemberDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
