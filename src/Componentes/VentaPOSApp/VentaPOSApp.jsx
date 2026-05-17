import React, { useState } from "react";
import { NavLink, Routes, Route, Navigate } from "react-router-dom";

import Venta from "./Secciones/Venta";
import IngresoMercaderia from "./Secciones/IngresoMercaderia";
import CierreCaja from "./Secciones/Caja";
import ProductManagerPOS from "./Secciones/ProductManagerPOS";

import CierreCajaModal from "../CierreCajaModal/CierreCajaModal";

import "./VentaPOSApp.css";

const API = "https://tokkenback2.onrender.com/api";

const VentaPOSApp = () => {

  /* =========================
     USER AUTH
  ========================= */
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user?.rol === "admin" || user?.rol === "owner";

  /* =========================
     MODAL STATE
  ========================= */
  const [openCash, setOpenCash] = useState(false);

  /* =========================
     LOGOUT FINAL (CON CAJA)
  ========================= */
  const handleCloseCash = async (data) => {
    const sessionId = localStorage.getItem("sessionId");

    try {
      // 1. CIERRE DE CAJA REAL
      await fetch(`${API}/cash-closure`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          ...data,
        }),
      });

      // 2. LOGOUT LIMPIO
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

    } catch (error) {
      console.error("Error cierre caja:", error);
    }

    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="venta-pos-container">

      {/* =========================
          SIDEBAR
      ========================= */}
      <aside className="sidebar">

        <h2>Panel POS</h2>

        {/* 🔥 BOTÓN ABRE MODAL */}
        <button
          className="logout-btn"
          onClick={() => setOpenCash(true)}
        >
          Cerrar sesión
        </button>

        <ul>

          {/* TODOS */}
          <li>
            <NavLink
              to="venta"
              className={({ isActive }) =>
                isActive ? "activo" : ""
              }
            >
              Venta
            </NavLink>
          </li>

          {/* SOLO ADMIN */}
          {isAdmin && (
            <>
              <li>
                <NavLink to="caja" className={({ isActive }) => isActive ? "activo" : ""}>
                  Caja
                </NavLink>
              </li>

              <li>
                <NavLink to="ingreso" className={({ isActive }) => isActive ? "activo" : ""}>
                  Ingreso Mercadería
                </NavLink>
              </li>

              <li>
                <NavLink to="gestion" className={({ isActive }) => isActive ? "activo" : ""}>
                  Gestión Productos
                </NavLink>
              </li>
            </>
          )}

        </ul>
      </aside>

      {/* =========================
          CONTENIDO
      ========================= */}
      <main className="contenido-pos">

        <Routes>

          <Route path="/" element={<Navigate to="venta" replace />} />

          <Route path="venta" element={<Venta />} />

          {isAdmin && (
            <>
              <Route path="caja" element={<CierreCaja />} />
              <Route path="ingreso" element={<IngresoMercaderia />} />
              <Route path="gestion" element={<ProductManagerPOS />} />
            </>
          )}

          {!isAdmin && (
            <Route
              path="*"
              element={<Navigate to="/venta/venta" replace />}
            />
          )}

        </Routes>

      </main>

      {/* =========================
          MODAL CIERRE DE CAJA
      ========================= */}
      <CierreCajaModal
        open={openCash}
        onClose={() => setOpenCash(false)}
        onConfirm={handleCloseCash}
      />

    </div>
  );
};

export default VentaPOSApp;