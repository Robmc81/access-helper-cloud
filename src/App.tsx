
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Logs from "./pages/Logs";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Catalog from "./pages/Catalog";
import Identities from "./pages/Identities";
import Groups from "./pages/Groups";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/identities" element={<Identities />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
