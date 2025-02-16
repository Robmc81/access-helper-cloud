
import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { getAllFromIndexedDB } from "@/stores/indexedDBStore";
import { formatInTimeZone } from 'date-fns-tz';

interface Identity {
  email: string;
  fullName: string;
  department: string;
  createdAt: Date;
  source?: string;
}

export const IdentityStoreTable = () => {
  const [identities, setIdentities] = useState<Identity[]>([]);

  useEffect(() => {
    const loadIdentities = async () => {
      const data = await getAllFromIndexedDB('identityStore');
      setIdentities(data);
    };

    loadIdentities();
  }, []);

  const formatDateTime = (date: Date) => {
    return formatInTimeZone(
      new Date(date),
      'America/New_York',
      'MMM d, yyyy h:mm:ss a zzz'
    );
  };

  const formatSource = (source?: string) => {
    if (!source) return 'Manual';
    return source.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card className="p-6 glass-card">
      <h2 className="flex items-center mb-4 text-xl font-semibold">
        <Users className="w-5 h-5 mr-2 text-success" />
        Identity Store
      </h2>
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Department</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Source</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Added (ET)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {identities.map((identity) => (
              <tr key={identity.email} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">{identity.fullName}</div>
                    <div className="text-sm text-gray-500">{identity.email}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {identity.department}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {formatSource(identity.source)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {formatDateTime(identity.createdAt)}
                </td>
              </tr>
            ))}
            {identities.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-3 text-sm text-gray-500 text-center">
                  No approved identities yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
