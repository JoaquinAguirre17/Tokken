import React, { useState, useEffect } from 'react';
import { Button, Table } from 'react-bootstrap';
import { FaFileExcel } from 'react-icons/fa';
import SelectorVendedor from './SelectorVendedor'; // Asegúrate de que la ruta sea correcta

const Caja = () => {
  // Estado para las ventas del turno
  const [ventas, setVentas] = useState([]);
  
  // Estado para el total de las ventas
  const [totalVentas, setTotalVentas] = useState(0);

  // Estado para el vendedor seleccionado
  const [vendedor, setVendedor] = useState(null);

  // Simulación de obtener las ventas desde una API
  useEffect(() => {
    const ventasSimuladas = [
      { id: 1, producto: 'Producto 1', cantidad: 2, precio: 500, total: 1000, vendedor: 'Juan' },
      { id: 2, producto: 'Producto 2', cantidad: 1, precio: 300, total: 300, vendedor: 'Maria' },
    ];
    setVentas(ventasSimuladas);
    setTotalVentas(ventasSimuladas.reduce((acc, venta) => acc + venta.total, 0));
  }, []);

  // Función para exportar a Excel
  const exportarExcel = () => {
    const XLSX = require("xlsx");
    const ws = XLSX.utils.json_to_sheet(ventasFiltradas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ventas");
    XLSX.writeFile(wb, "ventas.xlsx");
  };

  // Filtrar las ventas por vendedor
  const ventasFiltradas = vendedor
    ? ventas.filter(venta => venta.vendedor === vendedor)
    : ventas;

  // Recalcular el total de ventas cuando cambian las ventas filtradas
  useEffect(() => {
    setTotalVentas(ventasFiltradas.reduce((acc, venta) => acc + venta.total, 0));
  }, [ventasFiltradas]);

  return (
    <div className="caja">
      <h2>Ventas del Turno</h2>

      {/* Selector de vendedor */}
      <SelectorVendedor onSelectVendedor={setVendedor} />

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Total</th>
            <th>Vendedor</th>
          </tr>
        </thead>
        <tbody>
          {/* Verificamos que 'ventasFiltradas' es un array antes de usar map */}
          {Array.isArray(ventasFiltradas) && ventasFiltradas.map(venta => (
            <tr key={venta.id}>
              <td>{venta.id}</td>
              <td>{venta.producto}</td>
              <td>{venta.cantidad}</td>
              <td>${venta.precio}</td>
              <td>${venta.total}</td>
              <td>{venta.vendedor}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="total">
        <h3>Total: ${totalVentas}</h3>
      </div>

      <Button variant="success" onClick={exportarExcel}>
        <FaFileExcel /> Exportar a Excel
      </Button>
    </div>
  );
};

export default Caja;
