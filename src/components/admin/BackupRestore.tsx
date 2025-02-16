
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Upload, FolderOpen } from "lucide-react";
import { exportData, importData, scheduleAutoBackup } from "@/stores/indexedDBStore";
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
            onClick={() => exportData()}
            className="w-full sm:w-auto"
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
          <Button
            onClick={() => scheduleAutoBackup()}
            className="w-full sm:w-auto"
            variant="outline"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Set Auto-Backup Location
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".json"
            onChange={handleImport}
          />
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Use the File System Access API to securely backup and restore your data. Auto-backup will create regular backups in your chosen directory.
        </p>
      </div>
    </Card>
  );
};
