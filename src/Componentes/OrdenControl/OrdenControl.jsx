import { useParams } from 'react-router-dom';
import { useState } from 'react';
import './OrdenControl.css'; // Asegúrate de tener este archivo CSS para estilos
const OrdenControl = () => {
  const { draftOrderId } = useParams();
  const [mensaje, setMensaje] = useState('');

  console.log('draftOrderId del useParams:', draftOrderId);
  const confirmar = async (accion) => {
    if (!draftOrderId) {
      setMensaje('Error: draftOrderId no está definido');
      return;
    }
    console.log('Fetch cuerpo:', JSON.stringify({ draftOrderId, action: accion }));

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
      setMensaje('Error al procesar la solicitud');
    }
  };
  return (
    <div className="orden-control-container">
      <h2>¿Se concretó la venta?</h2>
      <button onClick={() => confirmar('vendido')}>✅ Se vendió</button>
      <button onClick={() => confirmar('no-vendido')}>❌ No se vendió</button>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default OrdenControl;
