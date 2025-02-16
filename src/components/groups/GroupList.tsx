
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, User } from "lucide-react";
import { groups, Group } from "@/stores/groupStore";
import { identityStore } from "@/stores/accessStore";

export const GroupList = () => {
  const [groupsData, setGroupsData] = useState<[string, Group][]>([]);

  useEffect(() => {
    // Convert Map to array and sort by name
    const sortedGroups = Array.from(groups.entries()).sort((a, b) => 
      a[1].name.localeCompare(b[1].name)
    );
    setGroupsData(sortedGroups);
  }, []);

  const getMemberDetails = (email: string) => {
    return identityStore.get(email);
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
            <Badge variant="secondary">
              {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
            </Badge>
          </div>

          <Accordion type="single" collapsible>
            <AccordionItem value="members">
              <AccordionTrigger>View Members</AccordionTrigger>
              <AccordionContent>
                <ScrollArea className="h-[200px] rounded-md border p-4">
                  {group.members.length > 0 ? (
                    <div className="space-y-4">
                      {group.members.map((email) => {
                        const member = getMemberDetails(email);
                        return (
                          <div key={email} className="flex items-center gap-3">
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
    </div>
  );
};
