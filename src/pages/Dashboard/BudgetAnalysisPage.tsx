import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, 
  Legend, LineChart, Line, Tooltip
} from "recharts";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { fetchCasesWithEvents, fetchAutomationRiskData } from "@/services/supabaseService";
import { Coins, AlertTriangle, ArrowUpRight } from "lucide-react";

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
  
  // Assign arbitrary costs to different training programs for simulation
  const programCosts = React.useMemo(() => {
    const programs = [...new Set(casesWithEvents.map(c => c.training_program))].filter(Boolean);
    
    // Assign costs between 1000 and 5000
    return programs.reduce((acc, program, index) => {
      // Fix: Use numerical value for modulo operation
      acc[program] = 1000 + (index * 1000) % 4001; // Range from 1000 to 5000
      return acc;
    }, {} as Record<string, number>); // Add type annotation to acc
  }, [casesWithEvents]);
  
  // Calculate current budget allocation
  const currentBudget = React.useMemo(() => {
    const programCounts: Record<string, number> = {};
    let totalParticipants = 0;
    
    casesWithEvents.forEach(caseData => {
      const program = caseData.training_program;
      if (!program) return;
      
      programCounts[program] = (programCounts[program] || 0) + 1;
      totalParticipants++;
    });
    
    // Calculate current spending by program
    const programSpending = Object.entries(programCounts).map(([program, count]) => ({
      program,
      participants: count,
      costPerParticipant: programCosts[program] || 2000, // Default cost
      totalCost: (programCosts[program] || 2000) * count,
      percentOfBudget: 0, // Will calculate after getting total
    }));
    
    // Calculate total budget
    const totalBudget = programSpending.reduce((sum, item) => sum + item.totalCost, 0);
    
    // Update percent of budget
    programSpending.forEach(item => {
      item.percentOfBudget = (item.totalCost / totalBudget) * 100;
    });
    
    return {
      programSpending: programSpending.sort((a, b) => b.totalCost - a.totalCost),
      totalBudget,
      totalParticipants
    };
  }, [casesWithEvents, programCosts]);
  
  // Calculate optimized budget with cuts
  const optimizedBudget = React.useMemo(() => {
    if (!currentBudget.programSpending.length || !occupations.length) return {};
    
    // New budget after cuts
    const newTotalBudget = currentBudget.totalBudget * (1 - budgetCutPercentage / 100);
    
    // Get success rates by program
    const programSuccessRates: Record<string, { success: number; total: number }> = {};
    casesWithEvents.forEach(caseData => {
      const program = caseData.training_program;
      if (!program) return;
      
      if (!programSuccessRates[program]) {
        programSuccessRates[program] = { success: 0, total: 0 };
      }
      
      programSuccessRates[program].total++;
      if (caseData.certification_earned) {
        programSuccessRates[program].success++;
      }
    });
    
    // Calculate ROI = success rate / cost per participant
    const programROI = currentBudget.programSpending.map(item => {
      const successRate = programSuccessRates[item.program]?.total > 0
        ? (programSuccessRates[item.program].success / programSuccessRates[item.program].total)
        : 0;
      
      return {
        ...item,
        successRate: successRate * 100,
        roi: successRate / (item.costPerParticipant / 1000) // Normalize by dividing cost by 1000
      };
    }).sort((a, b) => b.roi - a.roi);
    
    // Allocate new budget based on ROI
    let remainingBudget = newTotalBudget;
    let allocatedParticipants = 0;
    
    const newAllocation = programROI.map(program => {
      // Higher ROI programs get proportionally more budget
      const allocation = Math.min(
        program.totalCost, // Don't allocate more than current
        remainingBudget * (program.roi / programROI.reduce((sum, p) => sum + p.roi, 0)) * 1.5 // Weight by ROI
      );
      
      remainingBudget -= allocation;
      
      const newParticipants = Math.floor(allocation / program.costPerParticipant);
      allocatedParticipants += newParticipants;
      
      return {
        ...program,
        newBudget: allocation,
        newParticipants,
        change: ((allocation - program.totalCost) / program.totalCost) * 100,
        newPercentOfBudget: (allocation / newTotalBudget) * 100
      };
    }).sort((a, b) => b.newBudget - a.newBudget);
    
    return {
      programAllocation: newAllocation,
      newTotalBudget,
      totalParticipantsReduction: currentBudget.totalParticipants - allocatedParticipants,
      totalParticipantsRemaining: allocatedParticipants,
      percentReduction: ((currentBudget.totalParticipants - allocatedParticipants) / currentBudget.totalParticipants) * 100
    };
  }, [currentBudget, casesWithEvents, budgetCutPercentage, occupations]);

  // For chart data
  const budgetComparisonData = React.useMemo(() => {
    if (!currentBudget.programSpending.length || !optimizedBudget.programAllocation) return [];
    
    return currentBudget.programSpending.map(program => {
      const optimized = optimizedBudget.programAllocation.find(p => p.program === program.program);
      
      return {
        program: program.program,
        current: program.totalCost,
        optimized: optimized?.newBudget || 0,
        change: optimized ? ((optimized.newBudget - program.totalCost) / program.totalCost) * 100 : -100
      };
    });
  }, [currentBudget, optimizedBudget]);
  
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
      
      <Card>
        <CardHeader>
          <CardTitle>Impact on Training Capacity</CardTitle>
          <CardDescription>
            Analysis of participant reduction by program
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Current Participants</h3>
                <p className="text-2xl font-bold">{currentBudget.totalParticipants}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">New Capacity</h3>
                <p className="text-2xl font-bold">{optimizedBudget.totalParticipantsRemaining}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Reduction</h3>
                <p className="text-2xl font-bold text-amber-600">
                  {optimizedBudget.totalParticipantsReduction} ({optimizedBudget.percentReduction?.toFixed(1)}%)
                </p>
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program</TableHead>
                  <TableHead>Current Participants</TableHead>
                  <TableHead>New Participants</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>ROI Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {optimizedBudget.programAllocation?.map((program) => (
                  <TableRow key={program.program}>
                    <TableCell className="font-medium">{program.program}</TableCell>
                    <TableCell>{program.participants}</TableCell>
                    <TableCell>{program.newParticipants}</TableCell>
                    <TableCell>
                      <span className={program.change >= 0 ? "text-green-600" : "text-red-600"}>
                        {program.change >= 0 ? "+" : ""}{program.change.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>{program.successRate.toFixed(1)}%</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="mr-2">{program.roi.toFixed(2)}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${Math.min(100, program.roi * 20)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Optimization prioritizes programs with higher ROI (success rate relative to cost)
          </p>
          <Button variant="outline" size="sm">
            Export Report <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
      
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
    </div>
  );
};

export default BudgetAnalysisPage;
