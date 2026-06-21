import { Navigate } from "react-router-dom";

import { useAuth }
  from "../Contex/AuthContext";

export default function ProtectedRoute({

  children,

  roles = [],

}) {

  const { user, loading } = useAuth();

  console.log("🔐 PROTECTED ROUTE", {
    user,
    loading
  });

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}