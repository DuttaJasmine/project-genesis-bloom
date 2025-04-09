
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, 
  Legend, Line
} from "recharts";

interface BudgetComparisonChartProps {
  budgetComparisonData: Array<{
    program: string;
    current: number;
    optimized: number;
    change: number;
  }>;
  chartConfig: {
    current: {
      label: string;
      theme: { light: string; dark: string };
    };
    optimized: {
      label: string;
      theme: { light: string; dark: string };
    };
    change: {
      label: string;
      theme: { light: string; dark: string };
    };
  };
}

export const BudgetComparisonChart: React.FC<BudgetComparisonChartProps> = ({
  budgetComparisonData,
  chartConfig
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Allocation Comparison</CardTitle>
        <CardDescription>
          Current vs optimized budget allocation by program
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={budgetComparisonData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="program" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="left"
                  label={{ value: 'Budget (£)', angle: -90, position: 'insideLeft' }} 
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  label={{ value: 'Change (%)', angle: 90, position: 'insideRight' }} 
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar yAxisId="left" dataKey="current" name="Current Budget" fill="#3b82f6" />
                <Bar yAxisId="left" dataKey="optimized" name="Optimized Budget" fill="#22c55e" />
                <Line yAxisId="right" type="monotone" dataKey="change" name="% Change" stroke="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};
