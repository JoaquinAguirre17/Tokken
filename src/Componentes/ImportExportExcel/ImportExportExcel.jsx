import React, { useState } from "react";
import "./ImportExportExcel.css";

export default function ImportExportExcel() {

    const [excelFile, setExcelFile] = useState(null);

    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setExcelFile(e.target.files[0]);
    };

    // IMPORTAR EXCEL
    const handleImportExcel = async () => {

        if (!excelFile) {
            alert("Seleccioná un archivo Excel");
            return;
        }

        try {

            setLoading(true);

            const formData = new FormData();

            formData.append("archivo", excelFile);

            const res = await fetch(
                "https://tokkenback2.onrender.com/api/products/import-excel",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error || "Error importando Excel"
                );
            }

            alert(data.msg);

            setExcelFile(null);

        } catch (err) {

            console.log(err);

            alert(err.message);

        } finally {

            setLoading(false);
        }
    };

    // EXPORTAR EXCEL
    const handleExportExcel = () => {

        window.open(
            "https://tokkenback2.onrender.com/api/products/export-excel",
            "_blank"
        );
    };

    return (
        <div className="iee">

            <h2 className="iee-title">
                Importar / Exportar Productos
            </h2>

            <div className="iee-box">

                <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="iee-input"
                />

                <div className="iee-buttons">

                    <button
                        type="button"
                        className="iee-btn iee-primary"
                        onClick={handleImportExcel}
                        disabled={loading}
                    >
                        {loading
                            ? "Importando..."
                            : "Importar Excel"}
                    </button>

                    <button
                        type="button"
                        className="iee-btn iee-secondary"
                        onClick={handleExportExcel}
                    >
                        Descargar Excel
                    </button>

                </div>

            </div>

        </div>
    );
}