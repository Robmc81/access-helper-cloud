
import { Button } from "@/components/ui/button";
import { User, UserPlus, AppWindow, Group } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface ActionButtonsProps {
  isRequestingAccess: boolean;
  onRequestAccess: (type: 'regular' | 'guest') => void;
  onRequestForOther: () => void;
}

export const ActionButtons = ({ 
  isRequestingAccess, 
  onRequestAccess,
  onRequestForOther
}: ActionButtonsProps) => {
  const navigate = useNavigate();

  return (
    <div className="w-full flex flex-col items-center gap-4 animate-fadeIn sm:flex-row sm:justify-start">
      <Button
        size="lg"
        className="w-full animate-fadeIn hover-scale sm:w-auto"
        onClick={() => onRequestAccess('regular')}
        disabled={isRequestingAccess}
      >
        <UserPlus className="w-5 h-5 mr-2" />
        Request New Account
      </Button>
      <Button
        size="lg"
        className="w-full animate-fadeIn hover-scale sm:w-auto"
        onClick={() => onRequestAccess('guest')}
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
      <Sheet>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="w-full animate-fadeIn hover-scale sm:w-auto"
            onClick={() => onRequestForOther()}
          >
            <Group className="w-5 h-5 mr-2" />
            Request Group Access
          </Button>
        </SheetTrigger>
      </Sheet>
    </div>
  );
};
