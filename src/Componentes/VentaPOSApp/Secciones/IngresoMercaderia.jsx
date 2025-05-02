import React, { useState, useEffect } from 'react';
import { Button, Form, Table } from 'react-bootstrap';

const IngresoMercaderia = () => {
  const [productos, setProductos] = useState([]);
  const [productoBuscado, setProductoBuscado] = useState('');
  const [productoNuevo, setProductoNuevo] = useState({ nombre: '', precio: '', stock: '' });

  useEffect(() => {
    // Aquí iría la lógica para obtener productos desde el backend.
    const productosSimulados = [
      { id: 1, nombre: 'Producto 1', precio: 500, stock: 10 },
      { id: 2, nombre: 'Producto 2', precio: 300, stock: 5 },
    ];
    setProductos(productosSimulados);
  }, []);

  const actualizarProducto = (id, campo, valor) => {
    const productosActualizados = productos.map(p =>
      p.id === id ? { ...p, [campo]: valor } : p
    );
    setProductos(productosActualizados);
  };

  const agregarProducto = () => {
    const nuevoProducto = { id: productos.length + 1, ...productoNuevo };
    setProductos([...productos, nuevoProducto]);
    setProductoNuevo({ nombre: '', precio: '', stock: '' });
  };

  return (
    <div className="ingreso-mercaderia">
      <h2>Ingreso de Mercadería</h2>
      <Form>
        <Form.Group controlId="buscadorProducto">
          <Form.Label>Buscar Producto</Form.Label>
          <Form.Control
            type="text"
            placeholder="Buscar por nombre"
            value={productoBuscado}
            onChange={e => setProductoBuscado(e.target.value)}
          />
        </Form.Group>
      </Form>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Producto</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos
            .filter(p => p.nombre.toLowerCase().includes(productoBuscado.toLowerCase()))
            .map(producto => (
              <tr key={producto.id}>
                <td>{producto.id}</td>
                <td>{producto.nombre}</td>
                <td>
                  <Form.Control
                    type="number"
                    value={producto.precio}
                    onChange={e => actualizarProducto(producto.id, 'precio', e.target.value)}
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    value={producto.stock}
                    onChange={e => actualizarProducto(producto.id, 'stock', e.target.value)}
                  />
                </td>
                <td>
                  <Button variant="danger">Eliminar</Button>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>

      <h4>Agregar Nuevo Producto</h4>
      <Form>
        <Form.Group controlId="nombreProducto">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nombre del producto"
            value={productoNuevo.nombre}
            onChange={e => setProductoNuevo({ ...productoNuevo, nombre: e.target.value })}
          />
        </Form.Group>
        <Form.Group controlId="precioProducto">
          <Form.Label>Precio</Form.Label>
          <Form.Control
            type="number"
            placeholder="Precio"
            value={productoNuevo.precio}
            onChange={e => setProductoNuevo({ ...productoNuevo, precio: e.target.value })}
          />
        </Form.Group>
        <Form.Group controlId="stockProducto">
          <Form.Label>Stock</Form.Label>
          <Form.Control
            type="number"
            placeholder="Stock"
            value={productoNuevo.stock}
            onChange={e => setProductoNuevo({ ...productoNuevo, stock: e.target.value })}
          />
        </Form.Group>
        <Button variant="primary" onClick={agregarProducto}>Agregar Producto</Button>
      </Form>
    </div>
  );
};

export default IngresoMercaderia;
