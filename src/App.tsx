
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import Catalog from "@/pages/Catalog";
import Dashboard from "@/pages/Dashboard";
import Admin from "@/pages/Admin";
import Identities from "@/pages/Identities";
import Groups from "@/pages/Groups";
import Logs from "@/pages/Logs";
import NotFound from "@/pages/NotFound";
import RequestGroupAccess from "@/pages/RequestGroupAccess";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/identities" element={<Identities />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/request-group-access" element={<RequestGroupAccess />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
