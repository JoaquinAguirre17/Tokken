// ProductManagerPOS.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./ProductManagerPOS.css";
import ImportExportExcel from "../../ImportExportExcel/ImportExportExcel";

const API_URL = "https://tokkenback2.onrender.com/api/products";

const emptyForm = {
  sku: "",
  slug: "",
  title: "",
  description: "",
  brand: "",
  category: "",
  tags: "",
  pricing: { currency: "ARS", list: "", sale: "", taxIncluded: true },
  variants: [{ sku: "", options: { color: "" }, stock: 0, stockMinimo: 0, stockIdeal: 0 }],
  images: [{ url: "", alt: "" }],
  inventory: [{ store: "", qty: "" }],
  seo: { metaTitle: "", metaDesc: "" },
  status: "active",
};

const unitPrice = (p) => p?.pricing?.sale ?? p?.pricing?.list ?? p?.variants?.[0]?.price ?? 0;
const unitStock = (p) => p?.variants?.[0]?.stock ?? p?.inventory?.[0]?.qty ?? 0;
const firstImage = (p) => {
  if (Array.isArray(p?.images) && p.images.length) {
    const f = p.images[0];
    return typeof f === "string" ? f : f.url || f.src || "";
  }
  return "";
};

export default function ProductManagerPOS() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // ----- data -----
  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.products || []);
    } catch (e) {
      setError("No se pudieron cargar los productos.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (p) =>
        (p.title || "").toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (Array.isArray(p.tags) ? p.tags.join(",") : String(p.tags || "")).toLowerCase().includes(q)
    );
  }, [items, query]);

  // ----- form helpers -----
  const setPath = (path, value) => {
    setForm((prev) => {
      const copy = { ...prev };
      const keys = path.split(".");
      let obj = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = obj[keys[i]] ?? {};
        obj = obj[keys[i]];
      }
      obj[keys.at(-1)] = value;
      return copy;
    });
  };

  const addRow = (key, row) => setForm((prev) => ({ ...prev, [key]: [...prev[key], row] }));
  const removeRow = (key, idx) => setForm((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== idx) }));
  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  const fillFormForEdit = (doc) => {
    setEditingId(doc._id || doc.id);
    setForm({
      sku: doc.sku || "",
      slug: doc.slug || "",
      title: doc.title || "",
      description: doc.description || "",
      brand: doc.brand || "",
      category: doc.category || "",
      tags: Array.isArray(doc.tags) ? doc.tags.join(", ") : doc.tags || "",
      pricing: {
        currency: doc.pricing?.currency || "ARS",
        list: doc.pricing?.list ?? "",
        sale: doc.pricing?.sale ?? "",
        taxIncluded: !!doc.pricing?.taxIncluded,
      },
      variants:
        doc.variants?.length > 0
          ? doc.variants.map((v) => ({
            sku: v.sku || "",
            options: { color: v.options?.color || "" },
            stock: v.stock ?? 0,
            stockMinimo: v.stockMinimo ?? 0,
            stockIdeal: v.stockIdeal ?? 0,
          }))
          : [{ sku: "", options: { color: "" }, stock: 0, stockMinimo: 0, stockIdeal: 0 }],
      images:
        doc.images?.length > 0
          ? doc.images.map((i) => ({ url: typeof i === "string" ? i : i.url || "", alt: typeof i === "string" ? "" : i.alt || "" }))
          : [{ url: "", alt: "" }],
      inventory:
        doc.inventory?.length > 0
          ? doc.inventory.map((it) => ({ store: it.store || "", qty: it.qty ?? "" }))
          : [{ store: "", qty: "" }],
      seo: { metaTitle: doc.seo?.metaTitle || "", metaDesc: doc.seo?.metaDesc || "" },
      status: doc.status || "active",
    });
  };

  // ----- submit -----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      sku: form.sku || undefined,
      slug: form.slug || undefined,
      title: form.title,
      description: form.description || "",
      brand: form.brand || "",
      category: form.category || "",
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      pricing: {
        currency: form.pricing.currency || "ARS",
        list: form.pricing.list !== "" ? Number(form.pricing.list) : undefined,
        sale: form.pricing.sale !== "" ? Number(form.pricing.sale) : undefined,
        taxIncluded: !!form.pricing.taxIncluded,
      },
      variants: (form.variants || []).map((v) => ({
        sku: v.sku || undefined,
        options: { color: v.options?.color || "" },
        stock: v.stock !== "" ? Number(v.stock) : 0,
        stockMinimo: v.stockMinimo !== "" ? Number(v.stockMinimo) : 0,
        stockIdeal: v.stockIdeal !== "" ? Number(v.stockIdeal) : 0,
      })),
      images: (form.images || []).filter((i) => i.url).map((i) => ({ url: i.url, alt: i.alt || "" })),
      inventory: (form.inventory || []).filter((it) => it.store).map((it) => ({ store: it.store, qty: it.qty !== "" ? Number(it.qty) : 0 })),
      seo: { metaTitle: form.seo.metaTitle || "", metaDesc: form.seo.metaDesc || "" },
      status: form.status || "active",
    };

    try {
      let res;
      if (editingId) {
        res = await fetch(`${API_URL}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${txt}`);
      }

      await loadProducts();
      resetForm();
    } catch (e) {
      console.error(e);
      setError("No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadProducts();
      if (editingId === id) resetForm();
    } catch (e) {
      console.error(e);
      setError("No se pudo eliminar el producto.");
    }
  };

  // ----- stock bajo -----
  const revisarStock = () => {
    const nuevasAlertas = [];
    items.forEach((producto) => {
      producto.variants.forEach((v) => {
        if ((v.stock ?? 0) <= (v.stockMinimo ?? 0)) {
          const faltante = (v.stockIdeal ?? 0) - (v.stock ?? 0);
          nuevasAlertas.push({
            producto: producto.title,
            variante: v.options?.color || "sin color",
            faltante,
          });
        }
      });
    });
    setAlertas(nuevasAlertas);
  };

  useEffect(() => { revisarStock(); }, [items]);

  return (
    <div className="posgm">

      {/* HEADER, FORM, TABLA (tu JSX existente) */}
      <div className="posgm-head">
        <h2 className="posgm-title">Gestión de productos</h2>
        <div className="posgm-actions">
          <input
            className="posgm-input posgm-search"
            placeholder="Buscar por título, marca, categoría o tag…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="posgm-btn posgm-btn-ghost" onClick={loadProducts} disabled={loading}>
            {loading ? "Cargando…" : "Refrescar"}
          </button>
          <button className="posgm-btn posgm-btn-primary" onClick={resetForm}>
            Nuevo
          </button>

        </div>

        {error && <div className="posgm-alert posgm-alert-err">{error}</div>}


        <div className="posgm-grid">
          {/* LISTA */}
          <div className="posgm-card">
            <div className="posgm-table-wrap">
              <table className="posgm-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Stock</th>

                    <th style={{ width: 140 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => {
                    const id = p._id || p.id;
                    const price = unitPrice(p);
                    const stock = unitStock(p);
                    const img = firstImage(p);
                    return (
                      <tr key={id}>
                        <td>
                          <div className="posgm-prod">
                            <div className="posgm-thumb" style={{ backgroundImage: `url(${img})` }} />
                            <div className="posgm-prod-info">
                              <div className="posgm-name">{p.title}</div>
                              <div className="posgm-sub">{p.brand} • {p.category}</div>
                            </div>
                          </div>
                        </td>
                        <td>${Number(price || 0).toLocaleString()}</td>
                        <td>{Number(stock || 0).toLocaleString()}</td>

                        <td className="posgm-row-actions">
                          <button className="posgm-btn posgm-btn-ghost" onClick={() => fillFormForEdit(p)}>Editar</button>
                          <button className="posgm-btn posgm-btn-danger" onClick={() => handleDelete(id)}>Borrar</button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan="5" className="posgm-empty">Sin resultados</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* FORM */}
          <div className="posgm-card">
            <form onSubmit={handleSubmit} className="posgm-form">
              <div className="posgm-form-head">
                <h3>{editingId ? "Editar producto" : "Crear producto"}</h3>
                {editingId && <span className="posgm-tag">ID: {editingId}</span>}
              </div>

              <div className="posgm-grid-2">
                <div className="posgm-field">
                  <label className="posgm-label">Título *</label>
                  <input className="posgm-input" required value={form.title} onChange={e => setPath("title", e.target.value)} />
                </div>
                <div className="posgm-field">
                  <label className="posgm-label">Slug</label>
                  <input className="posgm-input" value={form.slug} onChange={e => setPath("slug", e.target.value)} placeholder="parlante-soul-xk50" />
                </div>
              </div>

              <div className="posgm-field">
                <label className="posgm-label">Descripción</label>
                <textarea className="posgm-textarea" value={form.description} onChange={e => setPath("description", e.target.value)} />
              </div>

              <div className="posgm-grid-3">
                <div className="posgm-field">
                  <label className="posgm-label">Marca</label>
                  <input className="posgm-input" value={form.brand} onChange={e => setPath("brand", e.target.value)} />
                </div>
                <div className="posgm-field">
                  <label className="posgm-label">Categoría</label>
                  <input className="posgm-input" value={form.category} onChange={e => setPath("category", e.target.value)} />
                </div>
                <div className="posgm-field">
                  <label className="posgm-label">Tags (coma)</label>
                  <input className="posgm-input" value={form.tags} onChange={e => setPath("tags", e.target.value)} placeholder="parlantes, bluetooth" />
                </div>
              </div>

              <h4 className="posgm-sub">Precio</h4>
              <div className="posgm-grid-3">
                <div className="posgm-field">
                  <label className="posgm-label">Moneda</label>
                  <select className="posgm-select" value={form.pricing.currency} onChange={e => setPath("pricing.currency", e.target.value)}>
                    <option>ARS</option><option>USD</option>
                  </select>
                </div>
                <div className="posgm-field">
                  <label className="posgm-label">Lista</label>
                  <input className="posgm-input" type="number" value={form.pricing.list} onChange={e => setPath("pricing.list", e.target.value)} />
                </div>
                <div className="posgm-field">
                  <label className="posgm-label">Oferta</label>
                  <input className="posgm-input" type="number" value={form.pricing.sale} onChange={e => setPath("pricing.sale", e.target.value)} />
                </div>
              </div>

              <h4 className="posgm-sub">Variantes</h4>
              <div className="posgm-repeat">
                {form.variants.map((v, idx) => (
                  <div key={idx} className="posgm-repeat-item posgm-grid-5">

                    {/* SKU */}
                    <div className="posgm-field">
                      <label className="posgm-label">SKU (opcional)</label>
                      <input className="posgm-input" value={v.sku} onChange={e => {
                        const val = e.target.value;
                        setForm(prev => {
                          const arr = [...prev.variants];
                          arr[idx] = { ...arr[idx], sku: val };
                          return { ...prev, variants: arr };
                        });
                      }} />
                    </div>

                    {/* Color */}
                    <div className="posgm-field">
                      <label className="posgm-label">Color</label>
                      <input className="posgm-input" value={v.options?.color || ""} onChange={e => {
                        const val = e.target.value;
                        setForm(prev => {
                          const arr = [...prev.variants];
                          arr[idx] = { ...arr[idx], options: { ...(arr[idx].options || {}), color: val } };
                          return { ...prev, variants: arr };
                        });
                      }} />
                    </div>

                    {/* Stock actual */}
                    <div className="posgm-field">
                      <label className="posgm-label">Stock</label>
                      <input className="posgm-input" type="number" value={v.stock} onChange={e => {
                        const val = e.target.value;
                        setForm(prev => {
                          const arr = [...prev.variants];
                          arr[idx] = { ...arr[idx], stock: Number(val) };
                          return { ...prev, variants: arr };
                        });
                      }} />
                    </div>

                    {/* Stock mínimo */}
                    <div className="posgm-field">
                      <label className="posgm-label">Stock mínimo</label>
                      <input className="posgm-input" type="number" value={v.stockMinimo || ""} onChange={e => {
                        const val = e.target.value;
                        setForm(prev => {
                          const arr = [...prev.variants];
                          arr[idx] = { ...arr[idx], stockMinimo: Number(val) };
                          return { ...prev, variants: arr };
                        });
                      }} />
                    </div>

                    {/* Stock ideal */}
                    <div className="posgm-field">
                      <label className="posgm-label">Stock ideal</label>
                      <input className="posgm-input" type="number" value={v.stockIdeal || ""} onChange={e => {
                        const val = e.target.value;
                        setForm(prev => {
                          const arr = [...prev.variants];
                          arr[idx] = { ...arr[idx], stockIdeal: Number(val) };
                          return { ...prev, variants: arr };
                        });
                      }} />
                    </div>

                    {/* Botón quitar variante */}
                    <div className="posgm-row-tools">
                      {form.variants.length > 1 && (
                        <button type="button" className="posgm-btn posgm-btn-ghost" onClick={() => removeRow("variants", idx)}>Quitar</button>
                      )}
                    </div>

                  </div>
                ))}

                <button type="button" className="posgm-btn posgm-btn-ghost" onClick={() => addRow("variants", {
                  sku: "",
                  options: { color: "" },
                  stock: 0,
                  stockMinimo: 0,
                  stockIdeal: 0
                })}>
                  + Agregar variante
                </button>
              </div>

              <h4 className="posgm-sub">Imágenes</h4>
              <div className="posgm-repeat">
                {form.images.map((im, idx) => (
                  <div key={idx} className="posgm-repeat-item posgm-grid-2">
                    <div className="posgm-field">
                      <label className="posgm-label">URL</label>
                      <input className="posgm-input" value={im.url} onChange={e => {
                        const val = e.target.value;
                        setForm(prev => {
                          const arr = [...prev.images];
                          arr[idx] = { ...arr[idx], url: val };
                          return { ...prev, images: arr };
                        });
                      }} placeholder="https://..." />
                    </div>
                    <div className="posgm-field">
                      <label className="posgm-label">Alt</label>
                      <input className="posgm-input" value={im.alt} onChange={e => {
                        const val = e.target.value;
                        setForm(prev => {
                          const arr = [...prev.images];
                          arr[idx] = { ...arr[idx], alt: val };
                          return { ...prev, images: arr };
                        });
                      }} />
                    </div>
                    <div className="posgm-row-tools">
                      {form.images.length > 1 && (
                        <button type="button" className="posgm-btn posgm-btn-ghost" onClick={() => removeRow("images", idx)}>Quitar</button>
                      )}
                    </div>
                  </div>
                ))}
                <button type="button" className="posgm-btn posgm-btn-ghost" onClick={() => addRow("images", { url: "", alt: "" })}>
                  + Agregar imagen
                </button>
              </div>

              <h4 className="posgm-sub">Inventario</h4>
              <div className="posgm-repeat">
                {form.inventory.map((it, idx) => (
                  <div key={idx} className="posgm-repeat-item posgm-grid-2">
                    <div className="posgm-field">
                      <label className="posgm-label">Tienda</label>
                      <input className="posgm-input" value={it.store} onChange={e => {
                        const val = e.target.value;
                        setForm(prev => {
                          const arr = [...prev.inventory];
                          arr[idx] = { ...arr[idx], store: val };
                          return { ...prev, inventory: arr };
                        });
                      }} />
                    </div>
                    <div className="posgm-field">
                      <label className="posgm-label">Cantidad</label>
                      <input className="posgm-input" type="number" value={it.qty} onChange={e => {
                        const val = e.target.value;
                        setForm(prev => {
                          const arr = [...prev.inventory];
                          arr[idx] = { ...arr[idx], qty: val };
                          return { ...prev, inventory: arr };
                        });
                      }} />
                    </div>
                    <div className="posgm-row-tools">
                      {form.inventory.length > 1 && (
                        <button type="button" className="posgm-btn posgm-btn-ghost" onClick={() => removeRow("inventory", idx)}>Quitar</button>
                      )}
                    </div>
                  </div>
                ))}
                <button type="button" className="posgm-btn posgm-btn-ghost" onClick={() => addRow("inventory", { store: "", qty: "" })}>
                  + Agregar fila
                </button>
              </div>

              <h4 className="posgm-sub">SEO & Estado</h4>
              <div className="posgm-grid-2">
                <div className="posgm-field">
                  <label className="posgm-label">Meta Title</label>
                  <input className="posgm-input" value={form.seo.metaTitle} onChange={e => setPath("seo.metaTitle", e.target.value)} />
                </div>
                <div className="posgm-field">
                  <label className="posgm-label">Meta Description</label>
                  <input className="posgm-input" value={form.seo.metaDesc} onChange={e => setPath("seo.metaDesc", e.target.value)} />
                </div>
              </div>

              <div className="posgm-grid-2">
                <div className="posgm-field">
                  <label className="posgm-label">Estado</label>
                  <select className="posgm-select" value={form.status} onChange={e => setPath("status", e.target.value)}>
                    <option value="active">active</option>
                    <option value="draft">draft</option>
                    <option value="archived">archived</option>
                  </select>
                </div>
                <div className="posgm-field posgm-inline">
                  <label className="posgm-label">Impuestos incluidos</label>
                  <label className="posgm-switch">
                    <input
                      type="checkbox"
                      checked={!!form.pricing.taxIncluded}
                      onChange={e => setPath("pricing.taxIncluded", e.target.checked)}
                    />
                    <span className="posgm-knob"></span>
                  </label>
                </div>
              </div>

              <div className="posgm-form-actions">
                <button type="button" className="posgm-btn posgm-btn-ghost" onClick={resetForm}>Limpiar</button>
                <button type="submit" className="posgm-btn posgm-btn-primary" disabled={saving}>
                  {saving ? "Guardando…" : (editingId ? "Guardar cambios" : "Crear producto")}
                </button>
              </div>
            </form>
          </div>
          <div className="componte1">
            <ImportExportExcel />
          </div>
          {alertas.length > 0 && (
            <>
              <div className="alerta-flotante" onClick={() => setModalOpen(true)} title="Productos con stock bajo">
                <img src="https://www.shutterstock.com/image-vector/out-stock-vector-sign-isolated-260nw-1960153762.jpg" alt="Alertas" className="alerta-icono" />
                <span className="alerta-contador">{alertas.length}</span>
              </div>

              {modalOpen && (
                <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <h3>Productos con stock bajo</h3>
                    <ul>
                      {alertas.map((a, i) => (
                        <li key={i}>
                          {a.producto} ({a.variante}) - Faltan {a.faltante} unidades
                        </li>
                      ))}
                    </ul>
                    <button
                      className="btn-whatsapp"
                      onClick={() => {
                        const mensaje = alertas.map(a => `(${a.faltante}) x ${a.producto} (${a.variante})`).join("\n");
                        window.open(`https://wa.me/3516210828?text=${encodeURIComponent(mensaje)}`, "_blank");
                      }}
                    >
                      Pedir todos por WhatsApp
                    </button>
                    <button className="btn-cerrar" onClick={() => setModalOpen(false)}>Cerrar</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
