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
     DATOS DEL SISTEMA
  ========================= */
  const totalExpected =
    summary?.resumen?.total || 0;

  const cantidadVentas =
    summary?.resumen?.cantidadVentas || 0;

  const porMedioPago =
    summary?.porMedioPago || {};

  const expectedCash =
    porMedioPago["Efectivo"] || 0;

  const expectedTransfer =
    porMedioPago["Transferencia"] || 0;

  const expectedDebit =
    porMedioPago["Débito"] || 0;

  const expectedCredit =
    porMedioPago["Crédito"] || 0;

  const expectedQr =
    porMedioPago["QR Openpay"] || 0;

  /* =========================
     TOTAL REAL
  ========================= */
  const realTotal =
    n(cashReal) +
    n(transferReal) +
    n(debitReal) +
    n(creditReal) +
    n(qrReal);

  const withdrawalsNum =
    n(withdrawals);

  /* =========================
     DIFERENCIA
  ========================= */
  const difference =
    realTotal -
    totalExpected -
    withdrawalsNum;

  /* =========================
     SUBMIT
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

  /* =========================
     EARLY RETURN
  ========================= */
  if (!open) return null;

  return (

    <div className="modal-overlay">

      <div className="modal-box">

        <h2>Cierre de Caja</h2>

        {/* =========================
            RESUMEN SISTEMA
        ========================= */}
        <div className="summary-box">

          <p>
            <b>Total sistema:</b>
            {" "}
            ${totalExpected}
          </p>

          <p>
            <b>Cantidad ventas:</b>
            {" "}
            {cantidadVentas}
          </p>

          <div className="mini-grid">

            <span>
              Efectivo: ${expectedCash}
            </span>

            <span>
              Transferencia: ${expectedTransfer}
            </span>

            <span>
              Débito: ${expectedDebit}
            </span>

            <span>
              Crédito: ${expectedCredit}
            </span>

            <span>
              QR Openpay: ${expectedQr}
            </span>

          </div>

        </div>

        {/* =========================
            EFECTIVO
        ========================= */}
        <div className="modal-field">

          <label>Efectivo</label>

          <input
            type="number"
            value={cashReal}
            onChange={(e) =>
              setCashReal(e.target.value)
            }
          />

        </div>

        {/* =========================
            TRANSFERENCIA
        ========================= */}
        <div className="modal-field">

          <label>Transferencia</label>

          <input
            type="number"
            value={transferReal}
            onChange={(e) =>
              setTransferReal(e.target.value)
            }
          />

        </div>

        {/* =========================
            DÉBITO
        ========================= */}
        <div className="modal-field">

          <label>Débito</label>

          <input
            type="number"
            value={debitReal}
            onChange={(e) =>
              setDebitReal(e.target.value)
            }
          />

        </div>

        {/* =========================
            CRÉDITO
        ========================= */}
        <div className="modal-field">

          <label>Crédito</label>

          <input
            type="number"
            value={creditReal}
            onChange={(e) =>
              setCreditReal(e.target.value)
            }
          />

        </div>

        {/* =========================
            QR
        ========================= */}
        <div className="modal-field">

          <label>QR / Openpay</label>

          <input
            type="number"
            value={qrReal}
            onChange={(e) =>
              setQrReal(e.target.value)
            }
          />

        </div>

        {/* =========================
            RETIROS
        ========================= */}
        <div className="modal-field">

          <label>Retiros de caja</label>

          <input
            type="number"
            value={withdrawals}
            onChange={(e) =>
              setWithdrawals(e.target.value)
            }
          />

        </div>

        {/* =========================
            RESULTADO
        ========================= */}
        <div className="summary-box">

          <p>
            <b>Total contado:</b>
            {" "}
            ${realTotal}
          </p>

          <p
            style={{
              color:
                difference >= 0
                  ? "green"
                  : "red",
            }}
          >
            <b>Diferencia:</b>
            {" "}
            ${difference}
          </p>

        </div>

        {/* =========================
            OBSERVACIONES
        ========================= */}
        <div className="modal-field">

          <label>Observaciones</label>

          <textarea
            value={observations}
            onChange={(e) =>
              setObservations(
                e.target.value
              )
            }
          />

        </div>

        {/* =========================
            ACCIONES
        ========================= */}
        <div className="modal-actions">

          <button onClick={onClose}>
            Cancelar
          </button>

          <button onClick={handleSubmit}>
            Cerrar Caja
          </button>

        </div>

      </div>

    </div>

  );

}