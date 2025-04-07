
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { fetchCasesWithEvents } from "@/services/supabaseService";
import { LineChart as LineChartIcon, TrendingUp } from "lucide-react";

const ReskillingSuccessPage = () => {
  const { data: casesWithEvents = [], isLoading } = useQuery({
    queryKey: ["trainingWithEvents"],
    queryFn: fetchCasesWithEvents,
  });

  const skillCategoryStats = React.useMemo(() => {
    if (!casesWithEvents.length) return [];
    
    const skillMap = new Map();
    
    // Extract all unique skill categories
    casesWithEvents.forEach(caseData => {
      if (!caseData.events) return;
      
      caseData.events.forEach(event => {
        const category = event.skill_category || "Uncategorized";
        
        if (!skillMap.has(category)) {
          skillMap.set(category, {
            category,
            totalEvents: 0,
            completed: 0,
            passed: 0,
            failed: 0,
            avgScore: 0,
            scores: []
          });
        }
        
        const stats = skillMap.get(category);
        stats.totalEvents++;
        
        if (event.completion_status === "completed") stats.completed++;
        if (event.completion_status === "passed") stats.passed++;
        if (event.completion_status === "failed") stats.failed++;
        
        // Parse score if available
        if (event.score) {
          let score = parseFloat(event.score);
          if (!isNaN(score)) {
            stats.scores.push(score);
          }
        }
      });
    });
    
    // Calculate average scores and success rates
    return Array.from(skillMap.values()).map(skill => ({
      ...skill,
      avgScore: skill.scores.length ? 
        skill.scores.reduce((sum, score) => sum + score, 0) / skill.scores.length : 0,
      successRate: skill.totalEvents ? 
        ((skill.completed + skill.passed) / skill.totalEvents) * 100 : 0
    })).sort((a, b) => b.successRate - a.successRate);
  }, [casesWithEvents]);

  // Calculate prediction factors based on patterns in the data
  const predictionFactors = React.useMemo(() => {
    if (!casesWithEvents.length) return [];
    
    const programSuccessRates = {};
    const certificationCountsByProgram = {};
    
    casesWithEvents.forEach(caseData => {
      const program = caseData.training_program || "Unknown";
      
      if (!programSuccessRates[program]) {
        programSuccessRates[program] = { success: 0, total: 0 };
        certificationCountsByProgram[program] = { certified: 0, total: 0 };
      }
      
      programSuccessRates[program].total++;
      certificationCountsByProgram[program].total++;
      
      if (caseData.completion_date) {
        programSuccessRates[program].success++;
      }
      
      if (caseData.certification_earned) {
        certificationCountsByProgram[program].certified++;
      }
    });
    
    // Calculate success rates by program
    return Object.keys(programSuccessRates).map(program => ({
      factor: program,
      successRate: programSuccessRates[program].total > 0 ? 
        (programSuccessRates[program].success / programSuccessRates[program].total) * 100 : 0,
      certificationRate: certificationCountsByProgram[program].total > 0 ?
        (certificationCountsByProgram[program].certified / certificationCountsByProgram[program].total) * 100 : 0
    })).sort((a, b) => b.successRate - a.successRate);
  }, [casesWithEvents]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading reskilling data...</div>;
  }
  
  const chartConfig = {
    success: {
      label: "Success Rate",
      theme: { light: "#22c55e", dark: "#4caf50" },
    },
    certification: {
      label: "Certification Rate",
      theme: { light: "#3b82f6", dark: "#42a5f5" },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-green-500" />
        <h1 className="text-2xl font-bold">Predict Reskilling Success</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Success Predictions by Training Program</CardTitle>
          <CardDescription>
            Comparing completion and certification rates by program
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={predictionFactors} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="factor" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }} 
                    domain={[0, 100]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="successRate" name="Success Rate" fill="#22c55e" />
                  <Bar dataKey="certificationRate" name="Certification Rate" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Success Rates by Skill Category</CardTitle>
          <CardDescription>
            Analysis of which skill areas have the highest success rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Skill Category</TableHead>
                <TableHead>Total Events</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Avg. Score</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Failed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skillCategoryStats.map((skill) => (
                <TableRow key={skill.category}>
                  <TableCell className="font-medium">{skill.category}</TableCell>
                  <TableCell>{skill.totalEvents}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className={`mr-2 ${skill.successRate > 60 ? 'text-green-500' : skill.successRate > 40 ? 'text-amber-500' : 'text-red-500'}`}>
                        {skill.successRate.toFixed(1)}%
                      </span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${skill.successRate > 60 ? 'bg-green-500' : skill.successRate > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${skill.successRate}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{skill.avgScore.toFixed(1)}</TableCell>
                  <TableCell>{skill.completed + skill.passed}</TableCell>
                  <TableCell>{skill.failed}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Success Prediction Model</CardTitle>
          <CardDescription>
            Key factors that predict successful reskilling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2">Top Success Indicators</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    <span>Program type - {predictionFactors[0]?.factor || "N/A"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    <span>Skill category - {skillCategoryStats[0]?.category || "N/A"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    <span>Consistent participation in events</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2">Risk Factors</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                    <span>Program type - {predictionFactors[predictionFactors.length - 1]?.factor || "N/A"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                    <span>Skill category - {skillCategoryStats[skillCategoryStats.length - 1]?.category || "N/A"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                    <span>Low initial assessment scores</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Recommendations for Improving Success</h3>
              <ul className="space-y-1 text-sm">
                <li>• Focus resources on programs with higher success rates</li>
                <li>• Provide additional support for participants in high-risk categories</li>
                <li>• Consider restructuring low-performing programs</li>
                <li>• Implement early assessment to identify candidates likely to succeed</li>
                <li>• Develop targeted interventions based on skill category performance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReskillingSuccessPage;
