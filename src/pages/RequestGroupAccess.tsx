
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Settings, Users, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

const RequestGroupAccess = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen p-8 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container animate-fadeIn">
        <Button
          variant="ghost"
          className="mb-6 hover-scale"
          onClick={() => navigate("/")}
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Request Group Access</h1>
          <Button
            variant="ghost"
            size="sm"
            className="hover-scale flex items-center gap-2"
            onClick={() => navigate("/admin")}
          >
            <Settings className="w-4 h-4" />
            Admin Portal
          </Button>
        </div>
        
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
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
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover-scale"
                        onClick={() => {
                          navigate('/', { 
                            state: { 
                              requestGroupForUser: {
                                fullName: identity.fullName,
                                email: identity.email,
                                department: identity.department
                              }
                            }
                          });
                        }}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Request Group Access
                      </Button>
                    </td>
                  </tr>
                ))}
                {identities.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-sm text-gray-500 text-center">
                      No approved identities yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RequestGroupAccess;
