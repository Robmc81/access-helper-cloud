
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Download, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SystemLog, getLogs } from "@/stores/indexedDBStore";

export const LogsSettings = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [logs, setLogs] = useState<SystemLog[]>([]);

  const fetchLogs = async () => {
    const fetchedLogs = await getLogs();
    setLogs(fetchedLogs);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLogs();
    setIsRefreshing(false);
    toast.success("Logs refreshed");
  };

  const handleDownload = () => {
    const logText = logs.map(log => 
      `${new Date(log.timestamp).toLocaleString()} [${log.level}] ${log.message}${
        log.details ? ' ' + JSON.stringify(log.details) : ''
      }`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString()}.txt`;
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
          {logs.map((log) => (
            <div
              key={log.id}
              className={`${
                log.level === 'ERROR' ? 'text-red-600' :
                log.level === 'WARN' ? 'text-yellow-600' :
                'text-gray-600'
              }`}
            >
              <span className="text-gray-500">
                {new Date(log.timestamp).toLocaleString()}
              </span>{' '}
              <span className="font-semibold">[{log.level}]</span>{' '}
              {log.message}
              {log.details && (
                <span className="text-gray-500"> {JSON.stringify(log.details)}</span>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
