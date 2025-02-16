
import { saveToIndexedDB } from '../db/dbConfig';
import { createSyncRecord } from '../sync/syncOperations';
import { addLog } from '../logging/systemLogs';
import { getOpenLDAPConfig, provisionToOpenLDAP } from '../ldap/ldapOperations';
import { toast } from "sonner";

export const provisionIdentity = async (userData: {
  email: string;
  fullName: string;
  department: string;
  source?: string;
}) => {
  try {
    console.log('Starting identity provisioning for:', userData);
    const identityData = {
      ...userData,
      createdAt: new Date(),
      source: userData.source || 'logic_apps',
      status: 'active',
    };

    // Store in IndexedDB
    await saveToIndexedDB('identityStore', identityData);
    
    // Create sync record
    await createSyncRecord('identity', 'create', identityData);

    // Check OpenLDAP configuration
    console.log('Checking OpenLDAP configuration...');
    const config = await getOpenLDAPConfig();
    console.log('OpenLDAP config status:', config ? `Enabled: ${config.enabled}` : 'Not configured');
    
    if (config && config.enabled) {
      console.log('OpenLDAP is enabled, attempting to provision user...');
      await provisionToOpenLDAP(identityData, config);
    } else {
      console.log('OpenLDAP is not enabled or not configured. Skipping LDAP provisioning.');
      await addLog('INFO', `User saved to IndexedDB only (OpenLDAP disabled): ${userData.email}`);
    }
    
    toast.success(`Provisioned user: ${userData.fullName}`);
    return identityData;
  } catch (error) {
    console.error('Error provisioning identity:', error);
    await addLog('ERROR', `Failed to provision identity: ${userData.email}`, { error: error.message });
    toast.error(`Failed to provision user: ${userData.fullName}`);
    throw error;
  }
};

export const provisionBulkIdentities = async (usersData: Array<{
  email: string;
  fullName: string;
  department: string;
  source?: string;
}>) => {
  try {
    const results = await Promise.all(
      usersData.map(userData => provisionIdentity(userData))
    );
    
    toast.success(`Successfully provisioned ${results.length} users`);
    return results;
  } catch (error) {
    console.error('Error in bulk provisioning:', error);
    await addLog('ERROR', 'Failed to complete bulk user provisioning', { error: error.message });
    toast.error('Failed to complete bulk user provisioning');
    throw error;
  }
};
