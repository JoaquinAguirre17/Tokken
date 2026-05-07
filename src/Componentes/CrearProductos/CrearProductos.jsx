import React, { useState } from "react";
import "./CrearProductos.css";

const API_URL = "https://tokkenback2.onrender.com/api/products";

const initialState = {
    slug: "",
    title: "",
    description: "",
    brand: "",
    category: "",
    tags: "",
    pricing: { currency: "ARS", list: "", sale: "", taxIncluded: true },
    variants: [{ sku: "", options: { color: "" }, stock: "" }],
    images: [{ url: "", alt: "" }],
    inventory: [{ store: "", qty: "" }],
    seo: { metaTitle: "", metaDesc: "" },
    status: "active",
};

export default function CrearProductos() {
    const [form, setForm] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);
    const [createdSku, setCreatedSku] = useState("");

    const setPath = (path, value) => {
        setForm(prev => {
            const copy = { ...prev };
            const keys = path.split(".");
            let obj = copy;
            for (let i = 0; i < keys.length - 1; i++) {
                const k = keys[i];
                obj[k] = obj[k] ?? {};
                obj = obj[k];
            }
            obj[keys.at(-1)] = value;
            return copy;
        });
    };

    const addArrayItem = (key, item) =>
        setForm(prev => ({ ...prev, [key]: [...prev[key], item] }));

    const removeArrayItem = (key, idx) =>
        setForm(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== idx) }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg(null);
        setCreatedSku("");

        const payload = {
            slug: form.slug || undefined,
            title: form.title,
            description: form.description || "",
            brand: form.brand || "",
            category: form.category || "",
            tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
            pricing: {
                currency: form.pricing.currency || "ARS",
                list: form.pricing.list ? Number(form.pricing.list) : undefined,
                sale: form.pricing.sale ? Number(form.pricing.sale) : undefined,
                taxIncluded: !!form.pricing.taxIncluded,
            },
            variants: form.variants.map(v => ({
                sku: v.sku || undefined,
                options: { color: v.options?.color || "" },
                stock: v.stock ? Number(v.stock) : 0,
            })),
            images: form.images.filter(i => i.url).map(i => ({ url: i.url, alt: i.alt || "" })),
            inventory: form.inventory.filter(i => i.store).map(i => ({ store: i.store, qty: i.qty ? Number(i.qty) : 0 })),
            seo: { metaTitle: form.seo.metaTitle || "", metaDesc: form.seo.metaDesc || "" },
            status: form.status || "active",
        };

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(`HTTP ${res.status} ${res.statusText} – ${text.slice(0, 140)}`);
            }

            // tolerante a respuestas sin JSON
            const ct = res.headers.get("content-type") || "";
            const created = ct.includes("application/json") ? await res.json() : null;

            setMsg({ type: "ok", text: "Producto creado con éxito." });
            setCreatedSku(created?.sku || "");
            setForm(initialState);
        } catch (err) {
            setMsg({ type: "err", text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cp">
            <form className="cp-form" onSubmit={handleSubmit}>
                <h2 className="cp-title">Crear producto</h2>

                <div className="cp-grid cp-cols-2">
                    <div className="cp-field">
                        <label className="cp-label">Título *</label>
                        <input className="cp-input" value={form.title} onChange={e => setPath("title", e.target.value)} required />
                    </div>
                    <div className="cp-field">
                        <label className="cp-label">Slug</label>
                        <input className="cp-input" value={form.slug} onChange={e => setPath("slug", e.target.value)} placeholder="parlante-soul-xk50-negro" />
                    </div>
                </div>

                <div className="cp-field">
                    <label className="cp-label">Descripción</label>
                    <textarea className="cp-textarea" value={form.description} onChange={e => setPath("description", e.target.value)} />
                </div>

                <div className="cp-grid cp-cols-3">
                    <div className="cp-field">
                        <label className="cp-label">Marca</label>
                        <input className="cp-input" value={form.brand} onChange={e => setPath("brand", e.target.value)} />
                    </div>
                    <div className="cp-field">
                        <label className="cp-label">Categoría</label>
                        <input className="cp-input" value={form.category} onChange={e => setPath("category", e.target.value)} placeholder="electronica" />
                    </div>
                    <div className="cp-field">
                        <label className="cp-label">Tags (coma)</label>
                        <input className="cp-input" value={form.tags} onChange={e => setPath("tags", e.target.value)} placeholder="parlantes, bluetooth" />
                    </div>
                </div>

                <h3 className="cp-subtitle">Precio</h3>
                <div className="cp-grid cp-cols-3">
                    <div className="cp-field">
                        <label className="cp-label">Moneda</label>
                        <select className="cp-select" value={form.pricing.currency} onChange={e => setPath("pricing.currency", e.target.value)}>
                            <option>ARS</option><option>USD</option>
                        </select>
                    </div>
                    <div className="cp-field">
                        <label className="cp-label">Lista</label>
                        <input className="cp-input" type="number" value={form.pricing.list} onChange={e => setPath("pricing.list", e.target.value)} placeholder="149999" />
                    </div>
                    <div className="cp-field">
                        <label className="cp-label">Oferta</label>
                        <input className="cp-input" type="number" value={form.pricing.sale} onChange={e => setPath("pricing.sale", e.target.value)} placeholder="139999" />
                    </div>
                </div>

                <h3 className="cp-subtitle">Variantes</h3>
                <div className="cp-repeat">
                    {form.variants.map((v, idx) => (
                        <div key={idx} className="cp-repeat-item cp-grid cp-grid-3">
                            <div className="cp-field">
                                <label className="cp-label">SKU variante (opcional)</label>
                                <input className="cp-input" value={v.sku} onChange={e => {
                                    const val = e.target.value;
                                    setForm(prev => { const arr = [...prev.variants]; arr[idx] = { ...arr[idx], sku: val }; return { ...prev, variants: arr }; });
                                }} placeholder="PARL-XK50-BLK-NEG" />
                            </div>
                            <div className="cp-field">
                                <label className="cp-label">Color</label>
                                <input className="cp-input" value={v.options?.color || ""} onChange={e => {
                                    const val = e.target.value;
                                    setForm(prev => { const arr = [...prev.variants]; arr[idx] = { ...arr[idx], options: { ...(arr[idx].options || {}), color: val } }; return { ...prev, variants: arr }; });
                                }} placeholder="Negro" />
                            </div>
                            <div className="cp-field">
                                <label className="cp-label">Stock</label>
                                <input className="cp-input" type="number" value={v.stock} onChange={e => {
                                    const val = e.target.value;
                                    setForm(prev => { const arr = [...prev.variants]; arr[idx] = { ...arr[idx], stock: val }; return { ...prev, variants: arr }; });
                                }} placeholder="10" />
                            </div>
                            <div className="cp-actions">
                                {form.variants.length > 1 && (
                                    <button type="button" className="cp-btn cp-btn-ghost" onClick={() => removeArrayItem("variants", idx)}>
                                        Quitar variante
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    <button type="button" className="cp-btn cp-btn-ghost" onClick={() => addArrayItem("variants", { sku: "", options: { color: "" }, stock: "" })}>
                        + Agregar variante
                    </button>
                </div>

                <h3 className="cp-subtitle">Imágenes</h3>
                <div className="cp-repeat">
                    {form.images.map((im, idx) => (
                        <div key={idx} className="cp-repeat-item cp-grid cp-grid-2">
                            <div className="cp-field">
                                <label className="cp-label">URL</label>
                                <input className="cp-input" value={im.url} onChange={e => {
                                    const val = e.target.value;
                                    setForm(prev => { const arr = [...prev.images]; arr[idx] = { ...arr[idx], url: val }; return { ...prev, images: arr }; });
                                }} placeholder="https://..." />
                            </div>
                            <div className="cp-field">
                                <label className="cp-label">Alt</label>
                                <input className="cp-input" value={im.alt} onChange={e => {
                                    const val = e.target.value;
                                    setForm(prev => { const arr = [...prev.images]; arr[idx] = { ...arr[idx], alt: val }; return { ...prev, images: arr }; });
                                }} placeholder="Vista frontal" />
                            </div>
                            <div className="cp-actions">
                                {form.images.length > 1 && (
                                    <button type="button" className="cp-btn cp-btn-ghost" onClick={() => removeArrayItem("images", idx)}>
                                        Quitar imagen
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    <button type="button" className="cp-btn cp-btn-ghost" onClick={() => addArrayItem("images", { url: "", alt: "" })}>
                        + Agregar imagen
                    </button>
                </div>

                <h3 className="cp-subtitle">Inventario</h3>
                <div className="cp-repeat">
                    {form.inventory.map((it, idx) => (
                        <div key={idx} className="cp-repeat-item cp-grid cp-grid-2">
                            <div className="cp-field">
                                <label className="cp-label">Tienda</label>
                                <input className="cp-input" value={it.store} onChange={e => {
                                    const val = e.target.value;
                                    setForm(prev => { const arr = [...prev.inventory]; arr[idx] = { ...arr[idx], store: val }; return { ...prev, inventory: arr }; });
                                }} placeholder="Córdoba Centro" />
                            </div>
                            <div className="cp-field">
                                <label className="cp-label">Cantidad</label>
                                <input className="cp-input" type="number" value={it.qty} onChange={e => {
                                    const val = e.target.value;
                                    setForm(prev => { const arr = [...prev.inventory]; arr[idx] = { ...arr[idx], qty: val }; return { ...prev, inventory: arr }; });
                                }} placeholder="12" />
                            </div>
                            <div className="cp-actions">
                                {form.inventory.length > 1 && (
                                    <button type="button" className="cp-btn cp-btn-ghost" onClick={() => removeArrayItem("inventory", idx)}>
                                        Quitar fila
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    <button type="button" className="cp-btn cp-btn-ghost" onClick={() => addArrayItem("inventory", { store: "", qty: "" })}>
                        + Agregar fila
                    </button>
                </div>

                <h3 className="cp-subtitle">SEO & Estado</h3>
                <div className="cp-grid cp-cols-2">
                    <div className="cp-field">
                        <label className="cp-label">Meta Title</label>
                        <input className="cp-input" value={form.seo.metaTitle} onChange={e => setPath("seo.metaTitle", e.target.value)} />
                    </div>
                    <div className="cp-field">
                        <label className="cp-label">Meta Description</label>
                        <input className="cp-input" value={form.seo.metaDesc} onChange={e => setPath("seo.metaDesc", e.target.value)} />
                    </div>
                </div>

                <div className="cp-grid cp-cols-2">
                    <div className="cp-field">
                        <label className="cp-label">Estado</label>
                        <select className="cp-select" value={form.status} onChange={e => setPath("status", e.target.value)}>
                            <option value="active">active</option>
                            <option value="draft">draft</option>
                            <option value="archived">archived</option>
                        </select>
                    </div>
                    <div className="cp-field">
                        <label className="cp-label">Impuestos incluidos</label>
                        <label className="cp-switch">
                            <input type="checkbox" checked={form.pricing.taxIncluded} onChange={e => setPath("pricing.taxIncluded", e.target.checked)} />
                            <span className="cp-dot"></span>
                        </label>
                    </div>
                </div>

                <div className="cp-actions">
                    <button className="cp-btn cp-btn-ghost" type="button" onClick={() => setForm(initialState)}>Limpiar</button>
                    <button className="cp-btn cp-btn-primary" type="submit" disabled={loading}>
                        {loading ? "Guardando..." : "Crear Producto"}
                    </button>
                </div>

                {msg && (
                    <div className={`cp-msg ${msg.type === "ok" ? "cp-ok" : "cp-err"}`}>
                        {msg.text}
                        {createdSku && msg.type === "ok" && (
                            <span style={{ marginLeft: 8 }}>• SKU generado: <strong>{createdSku}</strong></span>
                        )}
                    </div>
                )}
            </form>
        </div>
    );
}
