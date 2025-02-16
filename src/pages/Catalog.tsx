
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";

const Catalog = () => {
  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container animate-fadeIn">
        <h1 className="mb-8 text-3xl font-bold">Application Catalog</h1>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <Input
              placeholder="Search applications..."
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="hover-scale">
            <Lock className="w-4 h-4 mr-2" />
            Request Access
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 glass-card hover-scale">
              <h3 className="mb-2 text-xl font-semibold">Application {i}</h3>
              <p className="mb-4 text-gray-600">
                Description for Application {i}
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Request Access
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Catalog;
