
export const accessRequests = new Map<string, {
  fullName: string;
  email: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: Date;
}>();

export const identityStore = new Map<string, {
  fullName: string;
  email: string;
  department: string;
  createdAt: Date;
}>();
