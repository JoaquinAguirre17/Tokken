import { Navigate } from "react-router-dom";

import { useAuth }
from "../Contex/AuthContext";

export default function ProtectedRoute({

  children,

  roles = [],

}) {

  const { user } =
    useAuth();

  // ❌ no logueado

  if (!user) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }

  // ❌ sin permisos

  if (

    roles.length > 0 &&

    !roles.includes(user.rol)

  ) {

    return (
      <Navigate
        to="/venta/venta"
        replace
      />
    );

  }

  return children;

}