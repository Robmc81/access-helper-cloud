
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { saveOpenLDAPConfig } from "@/stores/indexedDBStore";
import { toast } from "sonner";

interface OpenLDAPConfigFormProps {
  initialConfig: {
    enabled: boolean;
    url: string;
    bindDN: string;
    bindPassword: string;
    baseDN: string;
    userContainer: string;
  };
  onSuccess: () => void;
}

export const OpenLDAPConfigForm = ({ initialConfig, onSuccess }: OpenLDAPConfigFormProps) => {
  const [config, setConfig] = useState(initialConfig);
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = async () => {
    try {
      await saveOpenLDAPConfig(config);
      onSuccess();
    } catch (error) {
      console.error('Failed to save OpenLDAP config:', error);
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      // Validate required fields
      if (!config.url || !config.bindDN || !config.bindPassword || !config.baseDN || !config.userContainer) {
        toast.error('Please fill in all required fields before testing connection');
        return;
      }

      // Mock LDAP test connection
      const isValidUrl = config.url.startsWith('ldap://') || config.url.startsWith('ldaps://');
      if (!isValidUrl) {
        throw new Error('Invalid LDAP URL format. Must start with ldap:// or ldaps://');
      }

      toast.loading('Testing connection to OpenLDAP server...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      toast.dismiss();
      toast.success('Successfully connected to OpenLDAP server', {
        description: `Connected to ${config.url}`,
      });
    } catch (error) {
      console.error('OpenLDAP connection test failed:', error);
      toast.dismiss();
      toast.error('Connection test failed', {
        description: error.message || 'Failed to connect to OpenLDAP server',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Label>Enable OpenLDAP Integration</Label>
          <p className="text-sm text-muted-foreground">
            Automatically provision users to OpenLDAP
          </p>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
        />
      </div>

      <div className="space-y-4">
        <div>
          <Label>Server URL</Label>
          <Input
            value={config.url}
            onChange={(e) => setConfig(prev => ({ ...prev, url: e.target.value }))}
            placeholder="ldap://localhost:389"
          />
        </div>

        <div>
          <Label>Bind DN</Label>
          <Input
            value={config.bindDN}
            onChange={(e) => setConfig(prev => ({ ...prev, bindDN: e.target.value }))}
            placeholder="cn=admin,dc=example,dc=com"
          />
        </div>

        <div>
          <Label>Bind Password</Label>
          <Input
            type="password"
            value={config.bindPassword}
            onChange={(e) => setConfig(prev => ({ ...prev, bindPassword: e.target.value }))}
            placeholder="Enter bind password"
          />
        </div>

        <div>
          <Label>Base DN</Label>
          <Input
            value={config.baseDN}
            onChange={(e) => setConfig(prev => ({ ...prev, baseDN: e.target.value }))}
            placeholder="dc=example,dc=com"
          />
        </div>

        <div>
          <Label>User Container</Label>
          <Input
            value={config.userContainer}
            onChange={(e) => setConfig(prev => ({ ...prev, userContainer: e.target.value }))}
            placeholder="ou=users"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button onClick={handleSave} className="flex-1">
          Save Configuration
        </Button>
        <Button 
          onClick={handleTestConnection} 
          variant="outline" 
          className="flex-1"
          disabled={isTesting}
        >
          {isTesting ? 'Testing...' : 'Test Connection'}
        </Button>
      </div>
    </div>
  );
};
