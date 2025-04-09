
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Coins } from "lucide-react";
import { fetchCasesWithEvents, fetchAutomationRiskData } from "@/services/supabaseService";
import { BudgetCutControls } from "@/components/BudgetAnalysis/BudgetCutControls";
import { BudgetComparisonChart } from "@/components/BudgetAnalysis/BudgetComparisonChart";
import { TrainingCapacityTable } from "@/components/BudgetAnalysis/TrainingCapacityTable";
import { KeyInsights } from "@/components/BudgetAnalysis/KeyInsights";
import { useBudgetCalculations } from "@/components/BudgetAnalysis/BudgetCalculations";

const BudgetAnalysisPage = () => {
  const [budgetCutPercentage, setBudgetCutPercentage] = useState(30);
  
  const { data: casesWithEvents = [] } = useQuery({
    queryKey: ["trainingWithEvents"],
    queryFn: fetchCasesWithEvents,
  });
  
  const { data: occupations = [] } = useQuery({
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Coins className="h-6 w-6 text-amber-500" />
        <h1 className="text-2xl font-bold">Budget Reduction Analysis</h1>
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
