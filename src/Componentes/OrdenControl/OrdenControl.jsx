// src/Components/OrdenControl/OrdenControl.jsx
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import './OrdenControl.css';

const OrdenControl = () => {
  const { draftOrderId } = useParams();
  const [mensaje, setMensaje] = useState('');

  const confirmar = async (accion) => {
    try {
      const res = await fetch('https://tokkenback2.onrender.com/api/shopify/confirm-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftOrderId,
          action: accion,
        }),
      });

      const data = await res.json();
      setMensaje(data.message);
    } catch (error) {
      console.error('❌ Error al confirmar:', error);
      setMensaje('Error al procesar la solicitud');
    }
  };

  return (
    <div className="orden-control-container">
      <h2>¿Se concretó la venta?</h2>
      <button className="btn-confirmar" onClick={() => confirmar('vendido')}>✅ Se vendió</button>
      <button className="btn-cancelar" onClick={() => confirmar('no-vendido')}>❌ No se vendió</button>
      {mensaje && <p className="orden-mensaje">{mensaje}</p>}
    </div>
  );
};

export default OrdenControl;
