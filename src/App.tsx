
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";
import AutomationRiskPage from "./pages/Dashboard/AutomationRiskPage";
import TrainingEffectivenessPage from "./pages/Dashboard/TrainingEffectivenessPage";
import ReskillingSuccessPage from "./pages/Dashboard/ReskillingSuccessPage";
import BudgetAnalysisPage from "./pages/Dashboard/BudgetAnalysisPage";
import PrioritizeRolesPage from "./pages/Dashboard/PrioritizeRolesPage";
import DashboardIndex from "./pages/Dashboard/index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardIndex />} />
          <Route path="/dashboard/automation-risk" element={
            <DashboardLayout>
              <AutomationRiskPage />
            </DashboardLayout>
          } />
          <Route path="/dashboard/training-effectiveness" element={
            <DashboardLayout>
              <TrainingEffectivenessPage />
            </DashboardLayout>
          } />
          <Route path="/dashboard/reskilling-success" element={
            <DashboardLayout>
              <ReskillingSuccessPage />
            </DashboardLayout>
          } />
          <Route path="/dashboard/budget-analysis" element={
            <DashboardLayout>
              <BudgetAnalysisPage />
            </DashboardLayout>
          } />
          <Route path="/dashboard/prioritize-roles" element={
            <DashboardLayout>
              <PrioritizeRolesPage />
            </DashboardLayout>
          } />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
