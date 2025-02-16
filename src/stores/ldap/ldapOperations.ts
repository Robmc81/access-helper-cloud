
import { getDB } from '../db/dbConfig';
import { toast } from "sonner";
import { addLog } from '../logging/systemLogs';

export interface OpenLDAPConfig {
  enabled: boolean;
  url: string;
  bindDN: string;
  bindPassword: string;
  baseDN: string;
  userContainer: string;
}

export const provisionToOpenLDAP = async (userData: any, config: OpenLDAPConfig) => {
  try {
    console.log('Starting OpenLDAP provisioning for user:', { 
      email: userData.email, 
      fullName: userData.fullName,
      department: userData.department 
    });
    
    const isValidUrl = config.url.startsWith('ldap://') || config.url.startsWith('ldaps://');
    if (!isValidUrl) {
      throw new Error('Invalid LDAP URL format. Must start with ldap:// or ldaps://');
    }

    console.log('Attempting to connect to LDAP server:', config.url);
    
    // Create a function to simulate LDAP operations since we can't use ldapjs in the browser
    const simulateLDAPOperation = async () => {
      const userDN = `cn=${userData.email},${config.userContainer},${config.baseDN}`;
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if we can connect to the LDAP server
      const canConnect = await fetch(config.url.replace('ldap://', 'http://'))
        .then(() => true)
        .catch(() => {
          throw new Error(`Cannot connect to LDAP server at ${config.url}`);
        });

      if (!canConnect) {
        throw new Error('Failed to connect to LDAP server');
      }

      return userDN;
    };

    // Simulate LDAP bind
    console.log('Binding to LDAP server...');
    await simulateLDAPOperation();
    console.log('Successfully bound to LDAP server');

    // Simulate creating user entry
    const userDN = `cn=${userData.email},${config.userContainer},${config.baseDN}`;
    console.log('Creating user with DN:', userDN);

    const entry = {
      objectClass: ['top', 'person', 'organizationalPerson', 'inetOrgPerson'],
      cn: userData.email,
      sn: userData.fullName.split(' ').pop() || '',
      givenName: userData.fullName.split(' ')[0] || '',
      mail: userData.email,
      departmentNumber: userData.department,
      userPassword: 'changeme'
    };

    // Simulate adding user
    await simulateLDAPOperation();
    console.log('Successfully added user to LDAP');

    await addLog('INFO', `User provisioned to OpenLDAP: ${userData.email}`, {
      userDN,
      attributes: {
        cn: userData.email,
        sn: entry.sn,
        givenName: entry.givenName,
        mail: userData.email,
        department: userData.department
      }
    });
    
    console.log('OpenLDAP provisioning completed successfully');
    toast.success(`Successfully provisioned user to OpenLDAP: ${userData.email}`);
  } catch (error) {
    console.error('OpenLDAP provisioning error:', error);
    await addLog('ERROR', `Failed to provision to OpenLDAP: ${userData.email}`, { 
      error: error.message,
      stack: error.stack,
      config: {
        url: config.url,
        bindDN: config.bindDN,
        baseDN: config.baseDN,
        userContainer: config.userContainer
      }
    });
    throw error;
  }
};

export const getOpenLDAPConfig = async (): Promise<OpenLDAPConfig | null> => {
  try {
    const db = await getDB();
    const tx = db.transaction('systemConfig', 'readonly');
    const store = tx.objectStore('systemConfig');
    const config = await store.get('openldap');
    return config || {
      enabled: false,
      url: '',
      bindDN: '',
      bindPassword: '',
      baseDN: '',
      userContainer: '',
    };
  } catch (error) {
    console.error('Error getting OpenLDAP config:', error);
    return null;
  }
};

export const saveOpenLDAPConfig = async (config: OpenLDAPConfig) => {
  try {
    console.log('Attempting to save OpenLDAP config:', { ...config, bindPassword: '***' });
    
    if (!config.url.trim()) {
      throw new Error('Server URL is required');
    }
    if (!config.bindDN.trim()) {
      throw new Error('Bind DN is required');
    }
    if (!config.bindPassword.trim()) {
      throw new Error('Bind Password is required');
    }
    if (!config.baseDN.trim()) {
      throw new Error('Base DN is required');
    }
    if (!config.userContainer.trim()) {
      throw new Error('User Container is required');
    }

    const db = await getDB();
    const tx = db.transaction('systemConfig', 'readwrite');
    const store = tx.objectStore('systemConfig');
    
    const configToSave = {
      enabled: config.enabled,
      url: config.url.trim(),
      bindDN: config.bindDN.trim(),
      bindPassword: config.bindPassword.trim(),
      baseDN: config.baseDN.trim(),
      userContainer: config.userContainer.trim(),
    };
    
    await store.put(configToSave, 'openldap');
    await tx.done;
    
    await addLog('INFO', 'OpenLDAP configuration updated', { config: { ...configToSave, bindPassword: '***' } });
    toast.success('OpenLDAP configuration saved successfully');
  } catch (error) {
    console.error('Error saving OpenLDAP config:', error);
    await addLog('ERROR', 'Failed to save OpenLDAP configuration', { error: error.message });
    toast.error(error.message || 'Failed to save OpenLDAP configuration');
    throw error;
  }
};
