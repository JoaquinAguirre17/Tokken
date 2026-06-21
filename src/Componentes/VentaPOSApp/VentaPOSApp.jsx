import React, { useState } from "react";
import {
  NavLink,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Venta from "./Secciones/Venta";
import IngresoMercaderia from "./Secciones/IngresoMercaderia";
import CierreCaja from "./Secciones/Caja";
import ProductManagerPOS from "./Secciones/ProductManagerPOS";

import CierreCajaModal from "../CierreCajaModal/CierreCajaModal";
import ControlPersonal from "./Secciones/ControlPersonal";

import "./VentaPOSApp.css";

const API =
  "https://tokkenback2.onrender.com/api";

const VentaPOSApp = () => {

  /* =========================
     USER AUTH
  ========================= */
  const user = JSON.parse(
    localStorage.getItem("user")
  );

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const isAdmin =
    user?.rol === "admin" ||
    user?.rol === "owner";

  /* =========================
     MODAL STATE
  ========================= */
  const [openCash, setOpenCash] =
    useState(false);

  const [summary, setSummary] =
    useState(null);

  const [loadingCash, setLoadingCash] =
    useState(false);

  /* =========================
     ABRIR MODAL + FETCH
  ========================= */
  const openCashModal = async () => {

    try {

      setLoadingCash(true);

      const fecha = new Date()
        .toISOString()
        .split("T")[0];

      const sessionId =
        localStorage.getItem(
          "sessionId"
        );

      console.log(
        "🆔 SESSION FRONT:",
        sessionId
      );

      const res = await fetch(
        `${API}/orders/cash-closure?fecha=${fecha}&sessionId=${sessionId}`
      );

      const data = await res.json();

      console.log(
        "💰 SUMMARY:",
        data
      );

      setSummary(data);

      setOpenCash(true);

    } catch (error) {

      console.error(
        "❌ Error obteniendo cierre:",
        error
      );

    } finally {

      setLoadingCash(false);

    }

  };

  /* =========================
     LOGOUT FINAL
  ========================= */
  const handleCloseCash =
    async (data) => {

      const sessionId =
        localStorage.getItem(
          "sessionId"
        );

      try {

        /* =========================
           GUARDAR CIERRE
        ========================= */
        await fetch(
          `${API}/cash-closure`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              sessionId,
              ...data,
            }),
          }
        );

        /* =========================
           LOGOUT
        ========================= */
        await fetch(
          `${API}/auth/logout`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              sessionId,
            }),
          }
        );

      } catch (error) {

        console.error(
          "❌ Error cierre caja:",
          error
        );

      }

      localStorage.clear();

      window.location.href =
        "/login";

    };

  return (

    <div className="venta-pos-container">

      {/* =========================
          SIDEBAR
      ========================= */}
      <aside className="sidebar">

        <h2>Panel POS</h2>

        {/* =========================
            BOTÓN CIERRE
        ========================= */}
        <button
          className="logout-btn"
          onClick={openCashModal}
          disabled={loadingCash}
        >

          {loadingCash
            ? "Cargando..."
            : "Cerrar sesión"}

        </button>

        <ul>

          {/* =========================
              TODOS
          ========================= */}
          <li>

            <NavLink
              to="venta"
              className={({
                isActive,
              }) =>
                isActive
                  ? "activo"
                  : ""
              }
            >
              Venta
            </NavLink>

          </li>

          {/* =========================
              SOLO ADMIN
          ========================= */}
          {isAdmin && (
            <>

              <li>

                <NavLink
                  to="caja"
                  className={({
                    isActive,
                  }) =>
                    isActive
                      ? "activo"
                      : ""
                  }
                >
                  Caja
                </NavLink>

              </li>

              <li>

                <NavLink
                  to="ingreso"
                  className={({
                    isActive,
                  }) =>
                    isActive
                      ? "activo"
                      : ""
                  }
                >
                  Ingreso Mercadería
                </NavLink>

              </li>

              <li>

                <NavLink
                  to="gestion"
                  className={({
                    isActive,
                  }) =>
                    isActive
                      ? "activo"
                      : ""
                  }
                >
                  Gestión Productos
                </NavLink>

              </li>
              <li>

                <NavLink
                  to="personal"
                  className={({ isActive }) =>
                    isActive ? "activo" : ""
                  }
                >
                  Control Personal
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

          <Route
            path="/"
            element={
              <Navigate
                to="venta"
                replace
              />
            }
          />

          <Route
            path="venta"
            element={<Venta />}
          />

          {isAdmin && (
            <>

              <Route
                path="caja"
                element={
                  <CierreCaja />
                }
              />

              <Route
                path="ingreso"
                element={
                  <IngresoMercaderia />
                }
              />

              <Route
                path="gestion"
                element={
                  <ProductManagerPOS />
                }
              />
              <Route
                path="personal"
                element={<ControlPersonal />}
              />

            </>
          )}

          {!isAdmin && (
            <Route
              path="*"
              element={
                <Navigate
                  to="/venta/venta"
                  replace
                />
              }
            />
          )}

        </Routes>

      </main>

      {/* =========================
          MODAL CIERRE CAJA
      ========================= */}
      <CierreCajaModal
        open={openCash}
        onClose={() =>
          setOpenCash(false)
        }
        onConfirm={
          handleCloseCash
        }
        summary={summary}
      />

    </div>

  );

};

export default VentaPOSApp;