import React, { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  const [page, setPage] = useState<"login" | "dashboard">("login");

  useEffect(() => {
    const path = window.location.pathname;
    setPage(path === "/dashboard" ? "dashboard" : "login");
  }, []);

  return page === "dashboard" ? <DashboardPage /> : <LoginPage />;
}
