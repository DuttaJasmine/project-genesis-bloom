
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Coins, RefreshCw } from "lucide-react";
import { fetchCasesWithEvents, fetchAutomationRiskData } from "@/services/supabaseService";
import { BudgetCutControls } from "@/components/BudgetAnalysis/BudgetCutControls";
import { BudgetComparisonChart } from "@/components/BudgetAnalysis/BudgetComparisonChart";
import { TrainingCapacityTable } from "@/components/BudgetAnalysis/TrainingCapacityTable";
import { KeyInsights } from "@/components/BudgetAnalysis/KeyInsights";
import { useBudgetCalculations } from "@/components/BudgetAnalysis/BudgetCalculations";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const BudgetAnalysisPage = () => {
  const [budgetCutPercentage, setBudgetCutPercentage] = useState(30);
  const { toast } = useToast();
  
  const { 
    data: casesWithEvents = [], 
    isLoading: isLoadingCases,
    refetch: refetchCases 
  } = useQuery({
    queryKey: ["trainingWithEvents"],
    queryFn: fetchCasesWithEvents,
  });
  
  const { 
    data: occupations = [], 
    isLoading: isLoadingOccupations,
    refetch: refetchOccupations
  } = useQuery({
    queryKey: ["automationRisk"],
    queryFn: fetchAutomationRiskData,
  });
  
  const { currentBudget, optimizedBudget, budgetComparisonData } = useBudgetCalculations({
    casesWithEvents,
    occupations,
    budgetCutPercentage
  });
  
  const chartConfig = {
    current: {
      label: "Current Budget",
      theme: { light: "#3b82f6", dark: "#42a5f5" },
    },
    optimized: {
      label: "Optimized Budget",
      theme: { light: "#22c55e", dark: "#4caf50" },
    },
    change: {
      label: "% Change",
      theme: { light: "#f59e0b", dark: "#fb8c00" },
    },
  };

  const handleRefresh = async () => {
    try {
      toast({
        title: "Refreshing data...",
        description: "Fetching the latest data from the database",
      });
      
      await Promise.all([refetchCases(), refetchOccupations()]);
      
      toast({
        title: "Data refreshed",
        description: "Dashboard now shows the latest data",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Refresh failed",
        description: "There was an error refreshing the data",
        variant: "destructive",
      });
    }
  };

  const isLoading = isLoadingCases || isLoadingOccupations;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-bold">Budget Reduction Analysis</h1>
        </div>
        
        <Button 
          onClick={handleRefresh} 
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>
      
      <BudgetCutControls
        budgetCutPercentage={budgetCutPercentage}
        setBudgetCutPercentage={setBudgetCutPercentage}
        currentBudget={currentBudget}
        optimizedBudget={optimizedBudget}
      />
      
      <BudgetComparisonChart
        budgetComparisonData={budgetComparisonData}
        chartConfig={chartConfig}
      />
      
      <TrainingCapacityTable
        currentBudget={currentBudget}
        optimizedBudget={optimizedBudget}
      />
      
      <KeyInsights
        budgetCutPercentage={budgetCutPercentage}
        optimizedBudget={optimizedBudget}
      />
    </div>
  );
};

export default BudgetAnalysisPage;
