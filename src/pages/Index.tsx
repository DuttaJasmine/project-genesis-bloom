
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChartBar, LineChart, Workflow, Users, AlertTriangle, Coins } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center">
            <Workflow className="h-8 w-8 mr-3 text-primary" />
            <h1 className="text-2xl font-bold">Workforce Reskilling Analytics</h1>
          </div>
          <Button asChild>
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </header>
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Workforce Optimization Dashboard</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Analytics platform for identifying automation risk and optimizing reskilling investments 
              in government departments.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="p-6 border-b">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                    <h3 className="text-lg font-semibold">Automation Risk</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Identify the top 10 roles most vulnerable to automation based on ONS risk scores.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 flex justify-end">
                  <Button variant="outline" asChild>
                    <Link to="/dashboard/automation-risk">View Analysis</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="p-6 border-b">
                  <div className="flex items-center gap-3 mb-3">
                    <ChartBar className="h-6 w-6 text-blue-500" />
                    <h3 className="text-lg font-semibold">Training Effectiveness</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Evaluate completion and success rates of existing training programs.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 flex justify-end">
                  <Button variant="outline" asChild>
                    <Link to="/dashboard/training-effectiveness">View Analysis</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="p-6 border-b">
                  <div className="flex items-center gap-3 mb-3">
                    <LineChart className="h-6 w-6 text-green-500" />
                    <h3 className="text-lg font-semibold">Reskilling Success</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Predict the likelihood of successful course completion with predictive models.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 flex justify-end">
                  <Button variant="outline" asChild>
                    <Link to="/dashboard/reskilling-success">View Analysis</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="p-6 border-b">
                  <div className="flex items-center gap-3 mb-3">
                    <Coins className="h-6 w-6 text-amber-500" />
                    <h3 className="text-lg font-semibold">Budget Analysis</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Assess the impact of budget cuts on training capacity and optimize resource allocation.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 flex justify-end">
                  <Button variant="outline" asChild>
                    <Link to="/dashboard/budget-analysis">View Analysis</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="p-6 border-b">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="h-6 w-6 text-purple-500" />
                    <h3 className="text-lg font-semibold">Prioritize Roles</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Identify which roles should be prioritized for reskilling based on risk and opportunity.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 flex justify-end">
                  <Button variant="outline" asChild>
                    <Link to="/dashboard/prioritize-roles">View Analysis</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-8">
            <Button size="lg" asChild>
              <Link to="/dashboard">
                Launch Full Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            Workforce Analytics Dashboard | Oxford Capstone Project | {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
