import React, { useEffect, useState } from "react";
import "./IngresoMercaderia.css";

const API_BASE = "https://tokkenback2.onrender.com/api";
const API_PRODUCTS = `${API_BASE}/products`;
const API_INGRESO = `${API_BASE}/ingresos`;

const normalizeProduct = (p) => {
  const variant = p?.variants?.[0] || {};
  return {
    _id: p?._id,
    title: p?.title || "",
    image: p?.images?.[0]?.url || "",
    stock: Number(variant?.stock) || 0
  };
};

export default function IngresoMercaderia() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔄 FETCH PRODUCTOS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(API_PRODUCTS);
        const data = await res.json();
        const raw = Array.isArray(data) ? data : data.products || [];
        setProducts(raw.map(normalizeProduct));
      } catch (err) {
        console.error("❌ Error cargando productos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 🔎 FILTRAR PRODUCTOS
  useEffect(() => {
    if (!search) return setFiltered([]);
    setFiltered(
      products.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, products]);

  // ➕ AGREGAR PRODUCTO A TABLA
  const handleSelectProduct = (p) => {
    setItems((prev) => {
      if (prev.find((i) => i._id === p._id)) return prev;
      return [...prev, { ...p, quantity: 0, costPrice: 0 }];
    });
    setSearch("");
    setFiltered([]);
  };

  // 💰 TOTAL
  const total = items.reduce(
    (acc, i) => acc + i.quantity * i.costPrice,
    0
  );

  // 💾 CONFIRMAR INGRESO
  const handleSubmit = async () => {
    if (items.length === 0) return alert("Agregá al menos un producto");

    const invalid = items.some((i) => i.quantity <= 0 || i.costPrice <= 0);
    if (invalid) return alert("Completá cantidad y costo en todos los productos");

    const payload = items.map((i) => ({
      productId: i._id,
      quantity: i.quantity,
      costPrice: i.costPrice
    }));

    setSaving(true);
    try {
      const res = await fetch(API_INGRESO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error en el servidor");

      alert("✅ Ingreso registrado correctamente");

      // 🔄 Actualizar stock en frontend
      setItems([]);
      setProducts((prev) =>
        prev.map((p) => {
          const ingreso = payload.find((i) => i.productId === p._id);
          if (!ingreso) return p;
          return { ...p, stock: p.stock + ingreso.quantity };
        })
      );
    } catch (err) {
      console.error(err);
      alert("❌ Error al registrar ingreso: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Cargando productos...</p>;

  return (
    <div className="ingreso-container">
      <h2>📦 Ingreso de Mercadería</h2>

      {/* 🔎 BUSCADOR */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filtered.length > 0 && (
          <div className="search-results">
            {filtered.map((p) => (
              <div
                key={p._id}
                className="search-item"
                onClick={() => handleSelectProduct(p)}
              >
                <img src={p.image} alt={p.title} />
                <span>{p.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 📋 TABLA DE INGRESOS */}
      {items.length > 0 && (
        <table className="tabla">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Stock actual</th>
              <th>Ingreso</th>
              <th>Stock final</th>
              <th>Costo</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td className="producto-cell">
                  <img src={item.image} alt={item.title} />
                  {item.title}
                </td>
                <td>{item.stock}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setItems((prev) =>
                        prev.map((i) =>
                          i._id === item._id ? { ...i, quantity: val } : i
                        )
                      );
                    }}
                  />
                </td>
                <td>{item.stock + item.quantity}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={item.costPrice}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setItems((prev) =>
                        prev.map((i) =>
                          i._id === item._id ? { ...i, costPrice: val } : i
                        )
                      );
                    }}
                  />
                </td>
                <td>${item.quantity * item.costPrice}</td>
                <td>
                  <button
                    className="btn red"
                    onClick={() =>
                      setItems((prev) => prev.filter((i) => i._id !== item._id))
                    }
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 💰 TOTAL Y CONFIRMAR */}
      {items.length > 0 && (
        <>
          <h3 className="total">Total: ${total}</h3>
          <button className="btn green" onClick={handleSubmit} disabled={saving}>
            {saving ? "Guardando..." : "✅ Confirmar ingreso"}
          </button>
        </>
      )}
    </div>
  );
}