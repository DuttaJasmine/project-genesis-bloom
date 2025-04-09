
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

interface OptimizedProgram {
  program: string;
  participants: number;
  newParticipants: number;
  change: number;
  successRate: number;
  roi: number;
}

interface TrainingCapacityTableProps {
  currentBudget: {
    totalParticipants: number;
  };
  optimizedBudget: {
    totalParticipantsRemaining?: number;
    totalParticipantsReduction?: number;
    percentReduction?: number;
    programAllocation?: OptimizedProgram[];
  };
}

export const TrainingCapacityTable: React.FC<TrainingCapacityTableProps> = ({
  currentBudget,
  optimizedBudget
}) => {
  return (
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
  );
};
