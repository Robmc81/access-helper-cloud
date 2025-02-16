
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { getOpenLDAPConfig } from "@/stores/indexedDBStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OpenLDAPConfigForm } from "./OpenLDAPConfigForm";

export const OpenLDAPConfig = () => {
  const [config, setConfig] = useState({
    enabled: false,
    url: '',
    bindDN: '',
    bindPassword: '',
    baseDN: '',
    userContainer: '',
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      const savedConfig = await getOpenLDAPConfig();
      if (savedConfig) {
        setConfig(savedConfig);
      }
    };
    loadConfig();
  }, []);

  return (
    <>
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">OpenLDAP Integration</h3>
            <p className="text-sm text-gray-600">Configure OpenLDAP server for user provisioning</p>
            <div className="flex items-center space-x-4">
              <span className={`text-sm ${config.enabled ? 'text-green-600' : 'text-gray-600'}`}>
                Status: {config.enabled ? 'Active' : 'Inactive'}
              </span>
              {config.url && (
                <span className="text-sm text-gray-600">
                  Server: {config.url}
                </span>
              )}
            </div>
          </div>
          <div>
            <Button
              variant="outline"
              className="hover-scale"
              onClick={() => setOpen(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>OpenLDAP Configuration</DialogTitle>
          </DialogHeader>
          <OpenLDAPConfigForm
            initialConfig={config}
            onSuccess={() => {
              setOpen(false);
              loadConfig();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
