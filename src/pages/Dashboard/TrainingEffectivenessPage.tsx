
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, ResponsiveContainer, Cell, Legend } from "recharts";
import { fetchCasesWithEvents } from "@/services/supabaseService";
import { ChartBar, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const TrainingEffectivenessPage = () => {
  const { data: casesWithEvents = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["trainingWithEvents"],
    queryFn: fetchCasesWithEvents,
  });

  const programStats = React.useMemo(() => {
    if (!casesWithEvents.length) return { programs: [], certificationRate: 0, completionRate: 0 };
    
    // Group by program
    const programMap = new Map();
    casesWithEvents.forEach(caseData => {
      const program = caseData.training_program || "Unknown";
      
      if (!programMap.has(program)) {
        programMap.set(program, {
          program,
          totalCases: 0,
          completed: 0,
          certified: 0,
          successEvents: 0,
          totalEvents: 0,
        });
      }
      
      const stats = programMap.get(program);
      stats.totalCases += 1;
      
      if (caseData.completion_date) {
        stats.completed += 1;
      }
      
      if (caseData.certification_earned) {
        stats.certified += 1;
      }
      
      // Count successful events
      if (caseData.events && caseData.events.length) {
        stats.totalEvents += caseData.events.length;
        stats.successEvents += caseData.events.filter(
          e => e.completion_status === "completed" || e.completion_status === "passed"
        ).length;
      }
    });
    
    // Convert map to array and calculate rates
    const programs = Array.from(programMap.values()).map(p => ({
      ...p,
      completionRate: (p.completed / p.totalCases) * 100,
      certificationRate: (p.certified / p.totalCases) * 100,
      successRate: p.totalEvents ? (p.successEvents / p.totalEvents) * 100 : 0,
    }));
    
    // Overall rates
    const totalCases = casesWithEvents.length;
    const totalCompleted = casesWithEvents.filter(c => c.completion_date).length;
    const totalCertified = casesWithEvents.filter(c => c.certification_earned).length;
    
    return {
      programs,
      completionRate: (totalCompleted / totalCases) * 100,
      certificationRate: (totalCertified / totalCases) * 100,
    };
  }, [casesWithEvents]);

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading training data...</div>;
  }
  
  // Data for certification pie chart
  const certificationData = [
    { name: "Certified", value: programStats.certificationRate },
    { name: "Not Certified", value: 100 - programStats.certificationRate },
  ];
  
  // Data for completion pie chart
  const completionData = [
    { name: "Completed", value: programStats.completionRate },
    { name: "Not Completed", value: 100 - programStats.completionRate },
  ];
  
  const COLORS = ["#22c55e", "#ef4444"];
  
  const chartConfig = {
    certified: {
      label: "Certified",
      theme: { light: "#22c55e", dark: "#4caf50" },
    },
    notCertified: {
      label: "Not Certified",
      theme: { light: "#ef4444", dark: "#ef5350" },
    },
    completed: {
      label: "Completed",
      theme: { light: "#3b82f6", dark: "#42a5f5" },
    },
    notCompleted: {
      label: "Not Completed",
      theme: { light: "#f59e0b", dark: "#fb8c00" },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChartBar className="h-6 w-6 text-blue-500" />
          <h1 className="text-2xl font-bold">Training Program Effectiveness</h1>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm"
          disabled={isRefetching}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          {isRefetching ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Certification Rate</CardTitle>
            <CardDescription>
              Percentage of participants who earned certification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={certificationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {certificationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Completion Rate</CardTitle>
            <CardDescription>
              Percentage of participants who completed training
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={completionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {completionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "#3b82f6" : "#f59e0b"} />
                      ))}
                    </Pie>
                    <Legend />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Training Program Performance</CardTitle>
          <CardDescription>
            Detailed breakdown by training program
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program Name</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead>Certification Rate</TableHead>
                <TableHead>Success Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programStats.programs.map((program) => (
                <TableRow key={program.program}>
                  <TableCell className="font-medium">{program.program}</TableCell>
                  <TableCell>{program.totalCases}</TableCell>
                  <TableCell>{program.completionRate.toFixed(1)}%</TableCell>
                  <TableCell>{program.certificationRate.toFixed(1)}%</TableCell>
                  <TableCell>{program.successRate.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Certification Success Rate
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programStats.certificationRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {programStats.programs.length} training programs analyzed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Success Rate
            </CardTitle>
            <XCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programStats.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Based on {casesWithEvents.length} participants
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainingEffectivenessPage;
