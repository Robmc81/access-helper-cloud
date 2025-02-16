
export const accessRequests = new Map<string, {
  fullName: string;
  email: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: Date;
  approvedAt?: Date;  // New field to track approval time
}>();

export const identityStore = new Map<string, {
  fullName: string;
  email: string;
  department: string;
  createdAt: Date;
  requestId: string;  // Link back to original request
}>();
