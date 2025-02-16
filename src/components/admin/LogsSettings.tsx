
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Download, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const LogsSettings = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [logs] = useState([
    { timestamp: "2024-02-20 10:15:23", level: "INFO", message: "System startup completed" },
    { timestamp: "2024-02-20 10:15:24", level: "INFO", message: "Identity orchestration service initialized" },
    { timestamp: "2024-02-20 10:15:25", level: "INFO", message: "Configuration loaded successfully" },
    { timestamp: "2024-02-20 10:16:30", level: "WARN", message: "Connection attempt timeout - retrying" },
    { timestamp: "2024-02-20 10:16:35", level: "INFO", message: "Connection established" },
  ]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast.success("Logs refreshed");
  };

  const handleDownload = () => {
    const logText = logs.map(log => `${log.timestamp} [${log.level}] ${log.message}`).join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'system-logs.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Logs downloaded");
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold">System Logs</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="hover-scale"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            className="hover-scale"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-[300px] rounded-md border">
        <div className="p-4 space-y-2 font-mono text-sm">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`${
                log.level === 'ERROR' ? 'text-red-600' :
                log.level === 'WARN' ? 'text-yellow-600' :
                'text-gray-600'
              }`}
            >
              <span className="text-gray-500">{log.timestamp}</span>{' '}
              <span className="font-semibold">[{log.level}]</span>{' '}
              {log.message}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
