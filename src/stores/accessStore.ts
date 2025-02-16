
// Load initial data from localStorage if available
const loadStoredData = <T>(key: string): Map<string, T> => {
  try {
    const storedData = localStorage.getItem(key);
    if (!storedData) return new Map();

    const parsedData = JSON.parse(storedData);
    // Ensure the parsed data is an array of entries
    if (!Array.isArray(parsedData)) return new Map();

    return new Map(parsedData);
  } catch (error) {
    console.error(`Error loading data for ${key}:`, error);
    return new Map();
  }
};

// Save data to localStorage
const saveData = (key: string, data: Map<any, any>) => {
  try {
    // Convert Date objects to ISO strings before saving
    const serializedData = Array.from(data.entries()).map(([k, v]) => {
      if (v.timestamp instanceof Date) {
        v = { ...v, timestamp: v.timestamp.toISOString() };
      }
      if (v.approvedAt instanceof Date) {
        v = { ...v, approvedAt: v.approvedAt.toISOString() };
      }
      if (v.createdAt instanceof Date) {
        v = { ...v, createdAt: v.createdAt.toISOString() };
      }
      return [k, v];
    });
    localStorage.setItem(key, JSON.stringify(serializedData));
  } catch (error) {
    console.error(`Error saving data for ${key}:`, error);
  }
};

// Initialize stores with data from localStorage
export const accessRequests = loadStoredData<{
  fullName: string;
  email: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: Date;
  approvedAt?: Date;
  type: 'regular' | 'guest' | 'group';
  groupId?: string;
  groupName?: string;
}>('accessRequests');

export const identityStore = loadStoredData<{
  fullName: string;
  email: string;
  department: string;
  createdAt: Date;
  requestId: string;
}>('identityStore');

// Wrap Map.prototype.set to automatically save changes
const originalAccessRequestSet = accessRequests.set.bind(accessRequests);
accessRequests.set = function(key, value) {
  const result = originalAccessRequestSet(key, value);
  saveData('accessRequests', accessRequests);
  return result;
};

const originalIdentityStoreSet = identityStore.set.bind(identityStore);
identityStore.set = function(key, value) {
  const result = originalIdentityStoreSet(key, value);
  saveData('identityStore', identityStore);
  return result;
};

// Convert stored date strings back to Date objects immediately after loading
for (const [key, value] of accessRequests.entries()) {
  if (typeof value.timestamp === 'string') {
    accessRequests.set(key, {
      ...value,
      timestamp: new Date(value.timestamp),
      approvedAt: value.approvedAt ? new Date(value.approvedAt) : undefined
    });
  }
}

for (const [key, value] of identityStore.entries()) {
  if (typeof value.createdAt === 'string') {
    identityStore.set(key, {
      ...value,
      createdAt: new Date(value.createdAt)
    });
  }
}
