import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/hooks/useLanguage";
import { CompleteProfileDialog } from "@/components/CompleteProfileDialog";
import { AdminImpersonationBanner } from "@/components/AdminImpersonationBanner";
import Landing from "./pages/Landing";
import Catalog from "./pages/Catalog";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import GameDetail from "./pages/GameDetail";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Releases from "./pages/Releases";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import { SteamGuard } from "./pages/SteamGuard";
import { CheckoutSuccess } from "./pages/CheckoutSuccess";
import NotFound from "./pages/NotFound";
import Invoices from "./pages/Invoices";
import StreamingCatalog from "./pages/StreamingCatalog";
import StreamingDetail from "./pages/StreamingDetail";
import { ServicesList } from "./pages/admin/Streaming/ServicesList";
import { ServiceForm } from "./pages/admin/Streaming/ServiceForm";
import { ManageInventory } from "./pages/admin/Streaming/ManageInventory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CompleteProfileDialog />
        <BrowserRouter>
          <AdminImpersonationBanner />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/catalogo" element={<Catalog />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/game/:id" element={<GameDetail />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/streaming" element={<StreamingCatalog />} />
            <Route path="/streaming/:id" element={<StreamingDetail />} />
            <Route path="/admin/streaming" element={<ServicesList />} />
            <Route path="/admin/streaming/new" element={<ServiceForm />} />
            <Route path="/admin/streaming/:id/edit" element={<ServiceForm />} />
            <Route path="/admin/streaming/:id/inventory" element={<ManageInventory />} />
            <Route path="/releases" element={<Releases />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/steam-guard" element={<SteamGuard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
