import Layout from "@/components/Layout";
import { withAuth } from "@/lib/helpers";
import React from "react";

function Dashboard() {
  return (
    <Layout activePage="dashboard">
      <div>Dashboard sc</div>
    </Layout>
  );
}

export default withAuth(Dashboard);
