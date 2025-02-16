
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
    localStorage.setItem(key, JSON.stringify(Array.from(data.entries())));
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
  if (!(value.timestamp instanceof Date)) {
    accessRequests.set(key, {
      ...value,
      timestamp: new Date(value.timestamp),
      approvedAt: value.approvedAt ? new Date(value.approvedAt) : undefined
    });
  }
}

for (const [key, value] of identityStore.entries()) {
  if (!(value.createdAt instanceof Date)) {
    identityStore.set(key, {
      ...value,
      createdAt: new Date(value.createdAt)
    });
  }
}
