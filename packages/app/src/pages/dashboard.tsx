import { withAuth } from "@/lib/helpers";
import React from "react";

function Dashboard() {
  return <div>Dashboard</div>;
}

export default withAuth(Dashboard);
