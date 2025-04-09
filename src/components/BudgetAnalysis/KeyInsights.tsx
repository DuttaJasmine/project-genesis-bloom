
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface OptimizedProgram {
  program: string;
  roi: number;
}

interface KeyInsightsProps {
  budgetCutPercentage: number;
  optimizedBudget: {
    programAllocation?: OptimizedProgram[];
    percentReduction?: number;
    totalParticipantsReduction?: number;
  };
}

export const KeyInsights: React.FC<KeyInsightsProps> = ({
  budgetCutPercentage,
  optimizedBudget
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Insights</CardTitle>
        <CardDescription>
          Strategic recommendations based on budget analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 border-l-4 border-amber-500 bg-amber-50 rounded">
            <h3 className="font-medium text-amber-800">Impact Summary</h3>
            <p className="text-sm text-amber-700 mt-1">
              A {budgetCutPercentage}% budget cut would reduce training capacity by approximately {optimizedBudget.percentReduction?.toFixed(1)}%, 
              affecting {optimizedBudget.totalParticipantsReduction} potential participants.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Programs to Prioritize</h3>
              <ul className="space-y-1 text-sm">
                {optimizedBudget.programAllocation?.slice(0, 3).map(program => (
                  <li key={program.program} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    <span>{program.program} (ROI: {program.roi.toFixed(2)})</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Programs to Reduce</h3>
              <ul className="space-y-1 text-sm">
                {optimizedBudget.programAllocation?.slice(-3).reverse().map(program => (
                  <li key={program.program} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                    <span>{program.program} (ROI: {program.roi.toFixed(2)})</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="p-4 border rounded-md">
            <h3 className="font-medium mb-2">Strategic Recommendations</h3>
            <ul className="space-y-1 text-sm">
              <li>• Focus on high-ROI programs that deliver the most value per pound spent</li>
              <li>• Consider consolidating or redesigning low-performing programs</li>
              <li>• Prioritize participants from roles at highest automation risk</li>
              <li>• Implement more rigorous candidate selection to maximize completion rates</li>
              <li>• Explore cost-sharing arrangements with industry partners</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
