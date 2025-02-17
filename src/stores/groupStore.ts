
// Load initial data from localStorage if available
const loadStoredGroups = () => {
  try {
    const storedData = localStorage.getItem('groups');
    if (!storedData) return new Map();
    return new Map(JSON.parse(storedData));
  } catch (error) {
    console.error('Error loading groups:', error);
    return new Map();
  }
};

// Save groups to localStorage
const saveGroups = (groups: Map<string, Group>) => {
  try {
    localStorage.setItem('groups', JSON.stringify(Array.from(groups.entries())));
  } catch (error) {
    console.error('Error saving groups:', error);
  }
};

export interface Group {
  id: string;
  name: string;
  description: string;
  members: string[]; // Array of email addresses
  createdAt: Date;
}

export const groups = loadStoredGroups();

// Wrap Map.prototype.set to automatically save changes
const originalSet = groups.set.bind(groups);
groups.set = function(key, value) {
  console.log("Setting group:", key, value);
  const result = originalSet(key, value);
  saveGroups(groups);
  return result;
};

// Initialize with some sample groups if empty
if (groups.size === 0) {
  const sampleGroups: [string, Group][] = [
    ['admin', {
      id: 'admin',
      name: 'Administrators',
      description: 'System administrators with full access',
      members: [],
      createdAt: new Date(),
    }],
    ['users', {
      id: 'users',
      name: 'General Users',
      description: 'Standard user access group',
      members: [],
      createdAt: new Date(),
    }],
  ];

  sampleGroups.forEach(([id, group]) => groups.set(id, group));
}
