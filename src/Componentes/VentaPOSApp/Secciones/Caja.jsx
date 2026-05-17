import React, { useState } from "react";
import "./Caja.css";

const API = "https://tokkenback2.onrender.com/api";

export default function CierreCaja() {

  const [modo, setModo] = useState("dia");
  const [fecha, setFecha] = useState("");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState(new Date().getFullYear());

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const obtenerVentasDia = async () => {
    if (!fecha) return alert("Seleccioná una fecha");
    setLoading(true);
    const res = await fetch(`${API}/orders/cierre-caja?fecha=${fecha}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  const obtenerVentasMes = async () => {
    if (!mes || !anio) return alert("Seleccioná mes y año");
    setLoading(true);
    const res = await fetch(
      `${API}/orders/cierre-mes?mes=${mes}&anio=${anio}`
    );
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  const obtenerVentas = () => {
    modo === "dia" ? obtenerVentasDia() : obtenerVentasMes();
  };

  const exportarExcel = async () => {
    const res = await fetch(`${API}/orders/export-excel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporte_ventas.xlsx";
    a.click();
  };
  const eliminarVenta = async (id) => {

    const confirmar = window.confirm(
      "¿Seguro que querés eliminar esta venta?"
    );

    if (!confirmar) return;

    try {

      const res = await fetch(
        `${API}/orders/${id}`,
        {
          method: "DELETE",
        }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json.error || "Error al eliminar"
        );
      }

      alert("Venta eliminada");

      // 🔄 RECARGAR DATOS
      obtenerVentas();

    } catch (error) {

      console.error(error);

      alert(error.message);

    }

  };

  return (
    <div className="tokken-cierre-container">
      <h2 className="tokken-cierre-title">Dashboard de Ventas</h2>

      <div className="tokken-cierre-controls">
        <select
          className="tokken-cierre-input"
          value={modo}
          onChange={(e) => setModo(e.target.value)}
        >
          <option value="dia">Ventas por día</option>
          <option value="mes">Ventas por mes</option>
        </select>

        {modo === "dia" && (
          <input
            type="date"
            className="tokken-cierre-input"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        )}

        {modo === "mes" && (
          <>
            <select
              className="tokken-cierre-input"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
            >
              <option value="">Mes</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("es-AR", { month: "long" })}
                </option>
              ))}
            </select>

            <input
              className="tokken-cierre-input"
              type="number"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
            />
          </>
        )}

        <button className="tokken-cierre-btn" onClick={obtenerVentas}>
          {loading ? "Cargando..." : "Obtener ventas"}
        </button>

        {data && (
          <button
            className="tokken-cierre-btn tokken-cierre-excel"
            onClick={exportarExcel}
          >
            Exportar Excel
          </button>
        )}
      </div>

      {data && (
        <>
          <div className="tokken-cierre-resumen">
            <div className="tokken-cierre-card">
              <h4>Total vendido</h4>
              <p>${data.resumen.total}</p>
            </div>
            <div className="tokken-cierre-card">
              <h4>Comisiones</h4>
              <p>${data.resumen.comisiones}</p>
            </div>
            <div className="tokken-cierre-card">
              <h4>Ventas</h4>
              <p>{data.resumen.cantidadVentas}</p>
            </div>
            <div className="tokken-cierre-card">
              <h4>Total ingresos</h4>
              <p>${data.resumen.totalIngresos || 0}</p>
            </div>
          </div>

          <div className="tokken-cierre-grid">
            <div className="tokken-cierre-box">
              <h4>Por vendedor</h4>
              {Object.entries(data.porVendedor).map(([v, total]) => (
                <p key={v}>
                  {v}: ${total}
                </p>
              ))}
            </div>

            <div className="tokken-cierre-box">
              <h4>Por medio de pago</h4>
              {Object.entries(data.porMedioPago).map(([m, total]) => (
                <p key={m}>
                  {m}: ${total}
                </p>
              ))}
            </div>

            <div className="tokken-cierre-box">
              <h4>Ventas por hora</h4>
              {Object.entries(data.porHora).map(([h, total]) => (
                <p key={h}>
                  {h}:00 - ${total}
                </p>
              ))}
            </div>
          </div>

          {modo === "mes" && data?.porDia && (
            <div className="tokken-cierre-box tokken-cierre-dia">
              <h4>Ventas por día</h4>
              {Object.entries(data.porDia)
                .sort((a, b) => new Date(a[0]) - new Date(b[0]))
                .map(([dia, total]) => (
                  <div className="tokken-dia-row" key={dia}>
                    <span>{new Date(dia).toLocaleDateString()}</span>
                    <span>${total}</span>
                  </div>
                ))}
            </div>
          )}

          {data.productosIngresados?.length > 0 && (
            <div className="tokken-cierre-box tokken-cierre-ingresos">
              <h4>Productos ingresados</h4>
              <table className="tokken-cierre-tabla">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Fecha y Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {data.productosIngresados.map((i, idx) => (
                    <tr key={idx}>
                      <td>{i.nombre}</td>
                      <td>{i.cantidad}</td>
                      <td>{i.fecha}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <table className="tokken-cierre-tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Vendedor</th>
                <th>Medio</th>
                <th>Monto</th>
                <th>Hora</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {data.ventas.map((v, index) => (
                <tr key={index}>
                  <td>{v.producto}</td>
                  <td>{v.vendedor}</td>
                  <td>{v.medioPago}</td>
                  <td>${v.monto}</td>
                  <td>{v.hora}</td>

                  <td>
                    <button
                      className="tokken-delete-btn"
                      onClick={() => eliminarVenta(v.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}