
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Users } from "lucide-react";
import { SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { UseFormReturn } from "react-hook-form";
import { groups } from "@/stores/groupStore";

interface GroupRequestSheetProps {
  isRequestingForOther: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  form: UseFormReturn<{
    fullName: string;
    email: string;
    department: string;
  }>;
  onGroupRequest: (groupId: string) => void;
  onCancel: () => void;
}

export const GroupRequestSheet = ({
  isRequestingForOther,
  searchQuery,
  onSearchChange,
  form,
  onGroupRequest,
  onCancel,
}: GroupRequestSheetProps) => {
  const filteredGroups = Array.from(groups.entries()).filter(([_, group]) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
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
            onChange={(e) => onSearchChange(e.target.value)}
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
              onClick={() => onGroupRequest(id)}
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
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </SheetFooter>
    </SheetContent>
  );
};
