
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Upload } from "lucide-react";
import { exportData, importData } from "@/stores/indexedDBStore";
import { useRef } from "react";

export const BackupRestore = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importData(file);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Backup & Restore</h2>
      <div className="space-y-4">
        <div>
          <Button
            onClick={() => exportData()}
            className="w-full sm:w-auto mr-4"
          >
            <Database className="w-4 h-4 mr-2" />
            Export Backup
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Backup
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".json"
            onChange={handleImport}
          />
        </div>
      </div>
    </Card>
  );
};
