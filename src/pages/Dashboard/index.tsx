
import React from "react";
import { Navigate } from "react-router-dom";

// This component redirects from /dashboard to the default dashboard page
const DashboardIndex = () => {
  return <Navigate to="/dashboard/automation-risk" replace />;
};

export default DashboardIndex;
