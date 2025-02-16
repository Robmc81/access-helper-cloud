
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getOpenLDAPConfig, saveOpenLDAPConfig } from "@/stores/indexedDBStore";
import { toast } from "sonner";

export const OpenLDAPConfig = () => {
  const [config, setConfig] = useState({
    enabled: false,
    url: '',
    bindDN: '',
    bindPassword: '',
    baseDN: '',
    userContainer: '',
  });

  useEffect(() => {
    const loadConfig = async () => {
      const savedConfig = await getOpenLDAPConfig();
      if (savedConfig) {
        setConfig(savedConfig);
      }
    };
    loadConfig();
  }, []);

  const handleSave = async () => {
    try {
      await saveOpenLDAPConfig(config);
    } catch (error) {
      console.error('Failed to save OpenLDAP config:', error);
    }
  };

  const handleTestConnection = async () => {
    try {
      const response = await fetch('/api/ldap/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...config,
          bindPassword: '***' // Don't send actual password in logs
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect to OpenLDAP server');
      }

      toast.success('Successfully connected to OpenLDAP server');
    } catch (error) {
      console.error('OpenLDAP connection test failed:', error);
      toast.error('Failed to connect to OpenLDAP server');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>OpenLDAP Integration</CardTitle>
        <CardDescription>Configure OpenLDAP server for user provisioning</CardDescription>
      </CardHeader>
      <CardContent>
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
            <Button onClick={handleTestConnection} variant="outline" className="flex-1">
              Test Connection
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
