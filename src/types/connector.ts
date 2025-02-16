
export type ConnectorStatus = "active" | "inactive" | "error";

export interface Connector {
  id: string;
  name: string;
  type: "strata" | "custom";
  status: ConnectorStatus;
  lastSync: Date | null;
  description: string;
}

export const initialConnectors: Connector[] = [
  {
    id: "1",
    name: "Strata Identity Orchestration",
    type: "strata",
    status: "inactive",
    lastSync: null,
    description: "Configure identity orchestration with Strata.io for seamless identity management"
  }
];
