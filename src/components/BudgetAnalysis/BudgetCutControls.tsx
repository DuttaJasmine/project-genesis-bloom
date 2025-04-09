
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle } from "lucide-react";

interface BudgetCutControlsProps {
  budgetCutPercentage: number;
  setBudgetCutPercentage: (value: number) => void;
  currentBudget: {
    totalBudget?: number;
  };
  optimizedBudget: {
    newTotalBudget?: number;
  };
}

export const BudgetCutControls: React.FC<BudgetCutControlsProps> = ({
  budgetCutPercentage,
  setBudgetCutPercentage,
  currentBudget,
  optimizedBudget,
}) => {
  return (
    <Card className="bg-amber-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <CardTitle>What If Budgets Are Cut by {budgetCutPercentage}%?</CardTitle>
        </div>
        <CardDescription>
          Adjust the slider to simulate different budget cut scenarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">10%</span>
            <Slider
              value={[budgetCutPercentage]}
              onValueChange={(value) => setBudgetCutPercentage(value[0])}
              min={10}
              max={50}
              step={5}
              className="flex-1"
            />
            <span className="text-sm font-medium">50%</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Current Budget</h3>
              <p className="text-2xl font-bold">£{currentBudget.totalBudget?.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">New Budget</h3>
              <p className="text-2xl font-bold">£{optimizedBudget.newTotalBudget?.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Reduction</h3>
              <p className="text-2xl font-bold text-amber-600">
                £{(currentBudget.totalBudget - (optimizedBudget.newTotalBudget || 0))?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
