import { useEffect, useState } from "react";
import "./controlPersonal.css";

const API =
  "https://tokkenback2.onrender.com/api";

export default function ControlPersonal() {

  /* =========================
     FECHAS POR DEFECTO
     Primer día del mes actual
     y fecha de hoy
  ========================= */
  const hoy = new Date()
    .toISOString()
    .split("T")[0];

  const primerDiaMes =
    new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    )
      .toISOString()
      .split("T")[0];

  const [desde, setDesde] =
    useState(primerDiaMes);

  const [hasta, setHasta] =
    useState(hoy);

  /* =========================
     DATOS DEL REPORTE
  ========================= */
  const [usuarios, setUsuarios] =
    useState([]);

  const [detalle, setDetalle] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  /* =========================
     CARGAR REPORTE GENERAL
  ========================= */
  const cargarReporte =
    async () => {

      try {

        setLoading(true);

        const res =
          await fetch(
            `${API}/personal/report?desde=${desde}&hasta=${hasta}`
          );

        const data =
          await res.json();

        console.log(
          "📊 REPORTE PERSONAL:",
          data
        );

        /* =========================
           SI EL BACKEND DEVUELVE:
           [ ... ]
        ========================= */
        if (Array.isArray(data)) {

          setUsuarios(data);

        }

        /* =========================
           SI EL BACKEND DEVUELVE:
           { usuarios:[...] }
        ========================= */
        else if (
          Array.isArray(data.usuarios)
        ) {

          setUsuarios(
            data.usuarios
          );

        }

        else {

          setUsuarios([]);

        }

      } catch (error) {

        console.error(
          "Error reporte:",
          error
        );

        setUsuarios([]);

      } finally {

        setLoading(false);

      }

    };

  /* =========================
     CARGAR DETALLE USUARIO
  ========================= */
  const cargarDetalle =
    async (usuario) => {

      try {

        const res =
          await fetch(
            `${API}/personal/detail/${usuario}?desde=${desde}&hasta=${hasta}`
          );

        const data =
          await res.json();

        console.log(
          "👤 DETALLE:",
          data
        );

        setDetalle(data);

      } catch (error) {

        console.error(
          "Error detalle:",
          error
        );

      }

    };

  /* =========================
     CARGA INICIAL
  ========================= */
  useEffect(() => {

    cargarReporte();

  }, []);

  return (

    <div className="personal-container">

      <h2>
        Control de Personal
      </h2>

      {/* =========================
         FILTROS
      ========================= */}
      <div className="personal-filtros">

        <div>

          <label>
            Desde
          </label>

          <input
            type="date"
            value={desde}
            onChange={(e) =>
              setDesde(
                e.target.value
              )
            }
          />

        </div>

        <div>

          <label>
            Hasta
          </label>

          <input
            type="date"
            value={hasta}
            onChange={(e) =>
              setHasta(
                e.target.value
              )
            }
          />

        </div>

        <button
          onClick={
            cargarReporte
          }
        >
          Buscar
        </button>

      </div>

      {/* =========================
         TABLA GENERAL
      ========================= */}
      {loading ? (

        <p>Cargando...</p>

      ) : (

        <table className="personal-table">

          <thead>

            <tr>

              <th>Usuario</th>
              <th>Días</th>
              <th>Sesiones</th>
              <th>Horas</th>
              <th>Abandonadas</th>

            </tr>

          </thead>

          <tbody>

            {usuarios.length === 0 ? (

              <tr>

                <td
                  colSpan="5"
                  style={{
                    textAlign: "center"
                  }}
                >
                  No hay registros
                </td>

              </tr>

            ) : (

              usuarios.map((u) => (

                <tr
                  key={u.usuario}
                  onClick={() =>
                    cargarDetalle(
                      u.usuario
                    )
                  }
                  style={{
                    cursor: "pointer"
                  }}
                >

                  <td>
                    {u.usuario}
                  </td>

                  <td>
                    {u.diasTrabajados}
                  </td>

                  <td>
                    {u.sesiones}
                  </td>

                  <td>
                    {u.horas}
                  </td>

                  <td>

                    {u.abandonadas > 0
                      ? `⚠ ${u.abandonadas}`
                      : "0"}

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      )}

      {/* =========================
         DETALLE DEL USUARIO
      ========================= */}
      {detalle && (

        <div className="personal-detalle">

          <h3>
            Detalle de {
              detalle.usuario
            }
          </h3>

          <table>

            <thead>

              <tr>

                <th>Fecha</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>Horas</th>
                <th>Estado</th>

              </tr>

            </thead>

            <tbody>

              {detalle.sesiones?.map(
                (s) => (

                  <tr
                    key={
                      s.sessionId
                    }
                  >

                    <td>
                      {s.fecha}
                    </td>

                    <td>

                      {new Date(
                        s.entrada
                      ).toLocaleTimeString(
                        "es-AR"
                      )}

                    </td>

                    <td>

                      {s.salida
                        ? new Date(
                            s.salida
                          ).toLocaleTimeString(
                            "es-AR"
                          )
                        : "-"}

                    </td>

                    <td>
                      {s.horas}
                    </td>

                    <td>

                      {s.activa
                        ? "🟢 Activa"
                        : "🔴 Cerrada"}

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );

}