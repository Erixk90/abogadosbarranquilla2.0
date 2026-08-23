import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RequireAdmin from "@/components/admin/RequireAdmin";
import AdminShell from "@/components/admin/AdminShell";
import { CmsProvider } from "@/context/CmsProvider";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import ScrollToHash from "@/components/ScrollToHash";

const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminPosts = lazy(() => import("./pages/admin/AdminPosts"));
const AdminPostEditor = lazy(() => import("./pages/admin/AdminPostEditor"));
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia"));
const AdminHome = lazy(() => import("./pages/admin/AdminHome"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));

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
            <Suspense fallback={<div className="min-h-screen" />}>
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
            </Suspense>
          </BrowserRouter>
        </CmsProvider>
      </AdminAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
