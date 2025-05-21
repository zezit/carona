import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { UserProvider } from "@/context/UserContext";
import Login from "./pages/Login";
import UserApproval from "./pages/UserApproval";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Report from "./pages/Report";
import { ReportTest } from "./pages/ReportTest";

// Configuração do React Query com opções mais estáveis
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <UserProvider>
            <Toaster />
            <SonnerToaster />
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/home" element={<Index />} />
              <Route path="/approval" element={<UserApproval />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/report" element={<Report />} />
              <Route path="/report-test" element={<ReportTest />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </UserProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
