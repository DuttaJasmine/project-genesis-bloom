
import { supabase } from "@/integrations/supabase/client";

// Fetch occupations with automation risk
export async function fetchAutomationRiskData() {
  const { data, error } = await supabase
    .from("Occupation")
    .select("*")
    .order("Probability of automation", { ascending: false });
  
  if (error) {
    console.error("Error fetching automation risk data:", error);
    throw new Error(error.message);
  }
  
  return data || [];
}

// Fetch training cases
export async function fetchTrainingCases() {
  const { data, error } = await supabase
    .from("WorkforceReskilling_Caes")
    .select("*");
  
  if (error) {
    console.error("Error fetching training cases:", error);
    throw new Error(error.message);
  }
  
  return data || [];
}

// Fetch training events
export async function fetchTrainingEvents() {
  const { data, error } = await supabase
    .from("WorkforceReskilling_events")
    .select("*");
  
  if (error) {
    console.error("Error fetching training events:", error);
    throw new Error(error.message);
  }
  
  return data || [];
}

// Fetch training events by case ID
export async function fetchEventsByCaseId(caseId: number) {
  const { data, error } = await supabase
    .from("WorkforceReskilling_events")
    .select("*")
    .eq("case_id", caseId);
  
  if (error) {
    console.error(`Error fetching events for case ${caseId}:`, error);
    throw new Error(error.message);
  }
  
  return data || [];
}

// Helper function to join cases with events
export async function fetchCasesWithEvents() {
  const cases = await fetchTrainingCases();
  const events = await fetchTrainingEvents();
  
  return cases.map(trainingCase => {
    const relatedEvents = events.filter(event => event.case_id === trainingCase.case_id);
    return {
      ...trainingCase,
      events: relatedEvents
    };
  });
}
