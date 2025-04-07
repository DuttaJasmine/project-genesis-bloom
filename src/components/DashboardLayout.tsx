
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChartBar, LineChart, Workflow, Users, AlertTriangle, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  active: boolean;
}

const SidebarItem = ({ icon, label, path, active }: SidebarItemProps) => {
  const navigate = useNavigate();
  
  return (
    <div
      onClick={() => navigate(path)}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-colors",
        active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
      )}
    >
      <div className="h-5 w-5">{icon}</div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const sidebarItems = [
    {
      icon: <AlertTriangle size={18} />,
      label: "Automation Risk",
      path: "/dashboard/automation-risk",
    },
    {
      icon: <ChartBar size={18} />,
      label: "Training Effectiveness",
      path: "/dashboard/training-effectiveness",
    },
    {
      icon: <LineChart size={18} />,
      label: "Reskilling Success",
      path: "/dashboard/reskilling-success",
    },
    {
      icon: <Coins size={18} />,
      label: "Budget Analysis",
      path: "/dashboard/budget-analysis",
    },
    {
      icon: <Users size={18} />,
      label: "Prioritize Roles",
      path: "/dashboard/prioritize-roles",
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-6 pt-2">
          <Workflow className="h-6 w-6" />
          <h1 className="text-xl font-bold">Workforce Analytics</h1>
        </div>
        <nav className="space-y-1 flex-1">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.path}
              active={currentPath === item.path}
              {...item}
            />
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
