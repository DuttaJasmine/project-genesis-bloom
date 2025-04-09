
import React from "react";

interface CaseWithEvents {
  training_program: string;
  certification_earned?: boolean;
}

interface BudgetData {
  programSpending: Array<{
    program: string;
    participants: number;
    costPerParticipant: number;
    totalCost: number;
    percentOfBudget: number;
  }>;
  totalBudget: number;
  totalParticipants: number;
}

interface OptimizedBudgetData {
  programAllocation: Array<{
    program: string;
    participants: number;
    costPerParticipant: number;
    totalCost: number;
    percentOfBudget: number;
    successRate: number;
    roi: number;
    newBudget: number;
    newParticipants: number;
    change: number;
    newPercentOfBudget: number;
  }>;
  newTotalBudget: number;
  totalParticipantsReduction: number;
  totalParticipantsRemaining: number;
  percentReduction: number;
}

interface ChartData {
  program: string;
  current: number;
  optimized: number;
  change: number;
}

interface BudgetCalculationsProps {
  casesWithEvents: CaseWithEvents[];
  occupations: any[];
  budgetCutPercentage: number;
}

export const useBudgetCalculations = ({
  casesWithEvents,
  occupations,
  budgetCutPercentage
}: BudgetCalculationsProps) => {
  // Assign arbitrary costs to different training programs for simulation
  const programCosts = React.useMemo(() => {
    const programs = [...new Set(casesWithEvents.map(c => c.training_program))].filter(Boolean);
    
    // Assign costs between 1000 and 5000
    return programs.reduce((acc, program, index) => {
      acc[program] = 1000 + (index * 1000) % 4001; // Range from 1000 to 5000
      return acc;
    }, {} as Record<string, number>);
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

  return {
    currentBudget,
    optimizedBudget,
    budgetComparisonData
  };
};
