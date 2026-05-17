import { useState } from "react";
import "./CierreCajaModal.css";

export default function CierreCajaModal({
  open,
  onClose,
  onConfirm,
  summary,
}) {
  /* =========================
     STATE CAJERO
  ========================= */
  const [cashReal, setCashReal] = useState("");
  const [transferReal, setTransferReal] = useState("");
  const [debitReal, setDebitReal] = useState("");
  const [creditReal, setCreditReal] = useState("");
  const [qrReal, setQrReal] = useState("");
  const [withdrawals, setWithdrawals] = useState("");
  const [observations, setObservations] = useState("");

  const n = (v) => Number(v || 0);

  /* =========================
     DATOS DEL SISTEMA (BACKEND)
  ========================= */
  const totalExpected = summary?.resumen?.totalSales || 0;

  const porMedioPago = summary?.porMedioPago || {};

  const expectedCash = porMedioPago["Efectivo"] || 0;
  const expectedTransfer = porMedioPago["Transferencia"] || 0;
  const expectedDebit = porMedioPago["Débito"] || 0;
  const expectedCredit = porMedioPago["Crédito"] || 0;
  const expectedQr = porMedioPago["QR Openpay"] || 0;

  /* =========================
     LO REAL INGRESADO POR CAJERO
  ========================= */
  const realTotal =
    n(cashReal) +
    n(transferReal) +
    n(debitReal) +
    n(creditReal) +
    n(qrReal);

  const withdrawalsNum = n(withdrawals);

  /* =========================
     DIFERENCIA
  ========================= */
  const difference = realTotal - totalExpected - withdrawalsNum;

  /* =========================
     GUARDAR
  ========================= */
  const handleSubmit = () => {
    onConfirm({
      realByPayment: {
        "Efectivo": n(cashReal),
        "Transferencia": n(transferReal),
        "Débito": n(debitReal),
        "Crédito": n(creditReal),
        "QR Openpay": n(qrReal),
      },
      withdrawals: withdrawalsNum,
      observations,
      difference,
    });
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        <h2>Cierre de Caja</h2>

        {/* =========================
            SISTEMA
        ========================= */}
        <div className="summary-box">
          <p><b>Total sistema:</b> ${totalExpected}</p>

          <div className="mini-grid">
            <span>Efectivo: ${expectedCash}</span>
            <span>Transferencia: ${expectedTransfer}</span>
            <span>Débito: ${expectedDebit}</span>
            <span>Crédito: ${expectedCredit}</span>
            <span>QR: ${expectedQr}</span>
          </div>
        </div>

        {/* =========================
            INGRESO CAJERO
        ========================= */}
        <div className="modal-field">
          <label>Efectivo</label>
          <input type="number" value={cashReal} onChange={(e) => setCashReal(e.target.value)} />
        </div>

        <div className="modal-field">
          <label>Transferencia</label>
          <input type="number" value={transferReal} onChange={(e) => setTransferReal(e.target.value)} />
        </div>

        <div className="modal-field">
          <label>Débito</label>
          <input type="number" value={debitReal} onChange={(e) => setDebitReal(e.target.value)} />
        </div>

        <div className="modal-field">
          <label>Crédito</label>
          <input type="number" value={creditReal} onChange={(e) => setCreditReal(e.target.value)} />
        </div>

        <div className="modal-field">
          <label>QR / OpenPay</label>
          <input type="number" value={qrReal} onChange={(e) => setQrReal(e.target.value)} />
        </div>

        {/* =========================
            RETIROS
        ========================= */}
        <div className="modal-field">
          <label>Retiros de caja</label>
          <input type="number" value={withdrawals} onChange={(e) => setWithdrawals(e.target.value)} />
        </div>

        {/* =========================
            RESULTADO
        ========================= */}
        <div className="summary-box">
          <p><b>Total contado:</b> ${realTotal}</p>

          <p style={{ color: difference >= 0 ? "green" : "red" }}>
            <b>Diferencia:</b> ${difference}
          </p>
        </div>

        {/* =========================
            OBSERVACIONES
        ========================= */}
        <div className="modal-field">
          <label>Observaciones</label>
          <textarea value={observations} onChange={(e) => setObservations(e.target.value)} />
        </div>

        {/* =========================
            ACCIONES
        ========================= */}
        <div className="modal-actions">
          <button onClick={onClose}>Cancelar</button>
          <button onClick={handleSubmit}>Cerrar Caja</button>
        </div>

      </div>
    </div>
  );
}