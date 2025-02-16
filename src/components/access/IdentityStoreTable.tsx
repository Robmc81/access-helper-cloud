
import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import { identityStore } from "@/stores/accessStore";

export const IdentityStoreTable = () => {
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
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.from(identityStore.values()).map((identity) => (
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
                  {identity.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
            {Array.from(identityStore.values()).length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-3 text-sm text-gray-500 text-center">
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
