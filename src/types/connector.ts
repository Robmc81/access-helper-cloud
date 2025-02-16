
export type ConnectorStatus = "active" | "inactive" | "error";

export interface Connector {
  id: string;
  name: string;
  type: "ldap" | "entra" | "custom";
  status: ConnectorStatus;
  lastSync: Date | null;
  description: string;
}

export const initialConnectors: Connector[] = [
  {
    id: "1",
    name: "Active Directory Sync",
    type: "ldap",
    status: "inactive",
    lastSync: null,
    description: "Synchronize identities from on-premise Active Directory"
  },
  {
    id: "2",
    name: "Microsoft Entra Integration",
    type: "entra",
    status: "inactive",
    lastSync: null,
    description: "Modern identity and access management with Microsoft Entra"
  }
];
