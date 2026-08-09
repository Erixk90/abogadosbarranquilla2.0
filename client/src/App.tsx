import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminPostEditor from "./pages/admin/AdminPostEditor";
import AdminMedia from "./pages/admin/AdminMedia";
import AdminHome from "./pages/admin/AdminHome";
import AdminServices from "./pages/admin/AdminServices";
import RequireAdmin from "@/components/admin/RequireAdmin";
import AdminShell from "@/components/admin/AdminShell";
import { CmsProvider } from "@/context/CmsProvider";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import ScrollToHash from "@/components/ScrollToHash";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <AdminAuthProvider>
        <CmsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToHash />
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/noticias" element={<Index />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminShell>
                    <AdminDashboard />
                  </AdminShell>
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/noticias"
              element={
                <RequireAdmin>
                  <AdminShell>
                    <AdminPosts />
                  </AdminShell>
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/noticias/nuevo"
              element={
                <RequireAdmin>
                  <AdminShell>
                    <AdminPostEditor />
                  </AdminShell>
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/noticias/:id"
              element={
                <RequireAdmin>
                  <AdminShell>
                    <AdminPostEditor />
                  </AdminShell>
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/media"
              element={
                <RequireAdmin>
                  <AdminShell>
                    <AdminMedia />
                  </AdminShell>
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/home"
              element={
                <RequireAdmin>
                  <AdminShell>
                    <AdminHome />
                  </AdminShell>
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/servicios"
              element={
                <RequireAdmin>
                  <AdminShell>
                    <AdminServices />
                  </AdminShell>
                </RequireAdmin>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CmsProvider>
      </AdminAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
