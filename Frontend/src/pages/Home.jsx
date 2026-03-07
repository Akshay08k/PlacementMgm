import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Homepage from "../components/Homepage";

export default function HomePage() {
  const { isAuthenticated, role, mustChangePassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (mustChangePassword && role === "company") {
      navigate("/change-password", { replace: true });
      return;
    }
    navigate("/dashboard", { replace: true });
  }, [isAuthenticated, role, mustChangePassword, navigate]);

  return <Homepage />;
}
