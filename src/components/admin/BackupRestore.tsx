
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Upload, FileJson, FileXml } from "lucide-react";
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
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={() => exportData('json')}
            className="w-full sm:w-auto"
          >
            <FileJson className="w-4 h-4 mr-2" />
            Export as JSON
          </Button>
          <Button
            onClick={() => exportData('xml')}
            className="w-full sm:w-auto"
            variant="secondary"
          >
            <FileXml className="w-4 h-4 mr-2" />
            Export as XML
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
            accept=".json,.xml"
            onChange={handleImport}
          />
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Use the File System Access API to securely backup and restore your data. 
          Supports both JSON and XML formats.
        </p>
      </div>
    </Card>
  );
};
