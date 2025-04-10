
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { fetchAutomationRiskData } from "@/services/supabaseService";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const AutomationRiskPage = () => {
  const { toast } = useToast();
  
  const { 
    data: occupations = [], 
    isLoading,
    refetch 
  } = useQuery({
    queryKey: ["automationRisk"],
    queryFn: fetchAutomationRiskData,
  });

  // Format for chart and get top 10
  const topRiskOccupations = React.useMemo(() => {
    if (!occupations.length) return [];
    
    return occupations
      .filter(occ => occ["Probability of automation"]) // Filter out nulls
      .map(occ => ({
        name: occ.occupation_name || `Occupation ${occ.occupation_id}`,
        risk: parseFloat(occ["Probability of automation"] || "0"),
        id: occ.occupation_id,
      }))
      .sort((a, b) => b.risk - a.risk)
      .slice(0, 10);
  }, [occupations]);

  const handleRefresh = async () => {
    try {
      toast({
        title: "Refreshing data...",
        description: "Fetching the latest automation risk data"
      });
      
      await refetch();
      
      toast({
        title: "Data refreshed",
        description: "Risk dashboard now shows the latest data"
      });
    } catch (error) {
      console.error("Error refreshing automation risk data:", error);
      toast({
        title: "Refresh failed",
        description: "There was an error refreshing the data",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading risk data...</div>;
  }
  
  const getColorByRisk = (risk: number) => {
    if (risk > 70) return "#ef4444"; // Red for high risk
    if (risk > 40) return "#f59e0b"; // Amber for medium risk
    return "#22c55e"; // Green for low risk
  };

  const chartConfig = {
    highRisk: {
      label: "High Risk (>70%)",
      theme: { light: "#ef4444", dark: "#ef5350" },
    },
    mediumRisk: {
      label: "Medium Risk (40-70%)",
      theme: { light: "#f59e0b", dark: "#fb8c00" },
    },
    lowRisk: {
      label: "Low Risk (<40%)",
      theme: { light: "#22c55e", dark: "#4caf50" },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <h1 className="text-2xl font-bold">Roles at High Risk of Automation</h1>
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
          <CardTitle>Top 10 Roles Most Vulnerable to Automation</CardTitle>
          <CardDescription>
            Based on probability scores from occupation data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={topRiskOccupations} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    label={{ value: 'Automation Risk (%)', angle: -90, position: 'insideLeft' }} 
                    domain={[0, 100]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="risk" name="Automation Risk">
                    {topRiskOccupations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColorByRisk(entry.risk)} />
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
          <CardTitle>Detailed Risk Assessment</CardTitle>
          <CardDescription>
            Complete list of roles with automation risk scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Occupation ID</TableHead>
                <TableHead>Occupation Name</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Risk Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {occupations.slice(0, 20).map((occ) => {
                const riskScore = parseFloat(occ["Probability of automation"] || "0");
                let riskLevel = "Low";
                if (riskScore > 70) riskLevel = "High";
                else if (riskScore > 40) riskLevel = "Medium";
                
                return (
                  <TableRow key={occ.occupation_id}>
                    <TableCell>{occ.occupation_id}</TableCell>
                    <TableCell>{occ.occupation_name || "Unknown"}</TableCell>
                    <TableCell>{occ["Probability of automation"] || "N/A"}</TableCell>
                    <TableCell>
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          riskLevel === "High" ? "bg-red-100 text-red-800" : 
                          riskLevel === "Medium" ? "bg-amber-100 text-amber-800" : 
                          "bg-green-100 text-green-800"
                        }`}
                      >
                        {riskLevel}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationRiskPage;
