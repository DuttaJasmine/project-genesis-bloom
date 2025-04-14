
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Legend,
  ScatterChart, Scatter, ZAxis, Cell
} from "recharts";
import { Button } from "@/components/ui/button";
import { fetchAutomationRiskData, fetchCasesWithEvents } from "@/services/supabaseService";
import { Users, ArrowUpRight, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const PrioritizeRolesPage = () => {
  const { toast } = useToast();
  
  const { 
    data: occupations = [],
    isLoading: isLoadingOccupations,
    refetch: refetchOccupations 
  } = useQuery({
    queryKey: ["automationRisk"],
    queryFn: fetchAutomationRiskData,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity
  });
  
  const { 
    data: casesWithEvents = [],
    isLoading: isLoadingCases,
    refetch: refetchCases
  } = useQuery({
    queryKey: ["trainingWithEvents"],
    queryFn: fetchCasesWithEvents,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity
  });
  
  // Prepare data for prioritization matrix
  const prioritizationData = React.useMemo(() => {
    if (!occupations.length) return [];
    
    // Calculate reskilling success by mapping from training programs
    const programSuccessRates = {};
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
    
    // For this example, we'll simulate reskilling ease with a simple calculation
    // In a real scenario, this would be based on actual data
    const simulateReskillingEase = (occupationId) => {
      // Simple pseudo-random generation based on occupation ID for demo purposes
      return 20 + (((occupationId * 17) % 60));
    };
    
    // Get roles with automation risk data and calculate priority scores
    return occupations
      .filter(occ => occ.automation_probability) // Filter out nulls
      .map((occ) => {
        const automationRisk = parseFloat(String(occ.automation_probability || "0"));
        const reskillingEase = simulateReskillingEase(occ.soc_code);
        
        // Calculate priority score - higher for roles with high risk and ease of reskilling
        const priorityScore = (automationRisk * 0.6) + (reskillingEase * 0.4);
        
        return {
          id: occ.soc_code,
          name: occ.job_title || `Occupation ${occ.soc_code}`,
          automationRisk: automationRisk * 100,
          reskillingEase,
          priorityScore,
          quadrant: automationRisk > 0.5 && reskillingEase > 50 ? 'High Priority' :
                  automationRisk > 0.5 && reskillingEase <= 50 ? 'Medium Priority' :
                  automationRisk <= 0.5 && reskillingEase > 50 ? 'Low Priority' :
                  'Lowest Priority'
        };
      })
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }, [occupations, casesWithEvents]);
  
  // Extract top priority roles
  const topPriorityRoles = React.useMemo(() => {
    return prioritizationData
      .filter(role => role.quadrant === 'High Priority')
      .slice(0, 10);
  }, [prioritizationData]);
  
  // Data for visualization
  const scatterData = React.useMemo(() => {
    return prioritizationData.map(role => ({
      name: role.name,
      x: role.automationRisk,
      y: role.reskillingEase,
      z: role.priorityScore,
      quadrant: role.quadrant
    }));
  }, [prioritizationData]);
  
  const getQuadrantColor = (quadrant) => {
    switch(quadrant) {
      case 'High Priority': return '#ef4444';
      case 'Medium Priority': return '#f59e0b';
      case 'Low Priority': return '#3b82f6';
      case 'Lowest Priority': return '#6b7280';
      default: return '#6b7280';
    }
  };
  
  // Top 10 priority roles for chart
  const priorityRolesChart = React.useMemo(() => {
    return prioritizationData
      .slice(0, 10)
      .map(role => ({
        name: role.name.length > 20 ? `${role.name.substring(0, 20)}...` : role.name,
        score: role.priorityScore,
        risk: role.automationRisk,
        quadrant: role.quadrant
      }));
  }, [prioritizationData]);
  
  const chartConfig = {
    highPriority: {
      label: "High Priority",
      theme: { light: "#ef4444", dark: "#ef5350" },
    },
    mediumPriority: {
      label: "Medium Priority",
      theme: { light: "#f59e0b", dark: "#fb8c00" },
    },
    lowPriority: {
      label: "Low Priority",
      theme: { light: "#3b82f6", dark: "#42a5f5" },
    },
    lowestPriority: {
      label: "Lowest Priority",
      theme: { light: "#6b7280", dark: "#9e9e9e" },
    },
  };

  const handleRefresh = async () => {
    try {
      toast({
        title: "Refreshing data...",
        description: "Fetching the latest data"
      });
      
      await Promise.all([refetchOccupations(), refetchCases()]);
      
      toast({
        title: "Data refreshed",
        description: "Prioritization dashboard now shows the latest data"
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

  const isLoading = isLoadingOccupations || isLoadingCases;
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading prioritization data...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-purple-500" />
          <h1 className="text-2xl font-bold">Prioritize Roles for Reskilling</h1>
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
      
      <Card>
        <CardHeader>
          <CardTitle>Prioritization Matrix</CardTitle>
          <CardDescription>
            Mapping roles by automation risk vs reskilling ease
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Automation Risk" 
                    domain={[0, 100]}
                    label={{ value: 'Automation Risk (%)', position: 'bottom' }} 
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Reskilling Ease" 
                    domain={[0, 100]}
                    label={{ value: 'Reskilling Ease', angle: -90, position: 'left' }} 
                  />
                  <ZAxis type="number" dataKey="z" range={[50, 400]} />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    cursor={{ strokeDasharray: '3 3' }}
                  />
                  <Scatter name="Roles" data={scatterData}>
                    {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getQuadrantColor(entry.quadrant)} />
                    ))}
                  </Scatter>
                  <Legend />
                </ScatterChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="p-3 border-l-4 border-red-500 bg-red-50 rounded">
              <h3 className="text-xs font-medium text-red-800">High Priority</h3>
              <p className="text-xs text-red-700 mt-1">
                High risk & Easy to reskill
              </p>
            </div>
            <div className="p-3 border-l-4 border-amber-500 bg-amber-50 rounded">
              <h3 className="text-xs font-medium text-amber-800">Medium Priority</h3>
              <p className="text-xs text-amber-700 mt-1">
                High risk & Difficult to reskill
              </p>
            </div>
            <div className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
              <h3 className="text-xs font-medium text-blue-800">Low Priority</h3>
              <p className="text-xs text-blue-700 mt-1">
                Low risk & Easy to reskill
              </p>
            </div>
            <div className="p-3 border-l-4 border-gray-500 bg-gray-50 rounded">
              <h3 className="text-xs font-medium text-gray-800">Lowest Priority</h3>
              <p className="text-xs text-gray-700 mt-1">
                Low risk & Difficult to reskill
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Priority Roles</CardTitle>
          <CardDescription>
            Roles that should be prioritized for reskilling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={priorityRolesChart} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category"
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="score" name="Priority Score" radius={[0, 4, 4, 0]}>
                    {priorityRolesChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getQuadrantColor(entry.quadrant)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Detailed Prioritization List</CardTitle>
          <CardDescription>
            Comprehensive ranking of roles for reskilling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Priority Rank</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Automation Risk</TableHead>
                <TableHead>Reskilling Ease</TableHead>
                <TableHead>Priority Score</TableHead>
                <TableHead>Quadrant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prioritizationData.slice(0, 20).map((role, index) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.automationRisk.toFixed(1)}%</TableCell>
                  <TableCell>{role.reskillingEase.toFixed(1)}%</TableCell>
                  <TableCell>{role.priorityScore.toFixed(1)}</TableCell>
                  <TableCell>
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        role.quadrant === 'High Priority' ? 'bg-red-100 text-red-800' : 
                        role.quadrant === 'Medium Priority' ? 'bg-amber-100 text-amber-800' : 
                        role.quadrant === 'Low Priority' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {role.quadrant}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" size="sm">
            Export Full List <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
          <CardDescription>
            Strategic steps for addressing high-priority roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded">
              <h3 className="font-medium text-red-800">High Priority Action Plan</h3>
              <p className="text-sm text-red-700 mt-1">
                These {topPriorityRoles.length} roles should be the immediate focus of reskilling efforts due to high automation risk and relative ease of reskilling.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Short-term Actions</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="h-5 w-5 text-red-500 shrink-0">1.</span>
                    <span>Develop targeted reskilling programs for high-priority roles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-5 w-5 text-red-500 shrink-0">2.</span>
                    <span>Conduct skills gaps analysis for employees in high-risk roles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-5 w-5 text-red-500 shrink-0">3.</span>
                    <span>Create fast-track certification options for high-priority roles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-5 w-5 text-red-500 shrink-0">4.</span>
                    <span>Allocate 60% of reskilling budget to high-priority quadrant</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Long-term Strategy</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="h-5 w-5 text-purple-500 shrink-0">1.</span>
                    <span>Engage with training providers to design specialized courses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-5 w-5 text-purple-500 shrink-0">2.</span>
                    <span>Implement workforce planning that phases out high-risk roles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-5 w-5 text-purple-500 shrink-0">3.</span>
                    <span>Establish career pathways from high-risk to low-risk roles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-5 w-5 text-purple-500 shrink-0">4.</span>
                    <span>Reassess priority matrix annually to adapt to changing technology</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrioritizeRolesPage;
