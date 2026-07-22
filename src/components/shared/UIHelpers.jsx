import { useState, useCallback, createContext, useContext } from "react";
import { X } from "lucide-react";

/* ═══════════ MODAL ═══════════ */
export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className={`relative bg-white rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto ${wide ? "w-full max-w-2xl" : "w-full max-w-md"}`} onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b z-10">
          <h3 className="font-bold text-dark-brown text-lg">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-warm-gray cursor-pointer transition"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ═══════════ CONFIRM DIALOG ═══════════ */
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = "Konfirmasi", variant = "accent" }) {
  if (!open) return null;
  const btnClass = variant === "red" ? "bg-red-500 hover:bg-red-600" : "bg-accent hover:bg-accent-dark";
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-warm-gray text-sm mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2 border rounded-lg text-sm font-medium text-warm-gray hover:bg-gray-50 cursor-pointer transition">Batal</button>
        <button onClick={() => { onConfirm(); onClose(); }} className={`px-4 py-2 ${btnClass} text-white rounded-lg text-sm font-semibold cursor-pointer transition`}>{confirmText}</button>
      </div>
    </Modal>
  );
}

/* ═══════════ TOAST SYSTEM ═══════════ */
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);
  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className={`px-5 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2 animate-slide-up ${t.type === "success" ? "bg-green-600 text-white" : t.type === "error" ? "bg-red-500 text-white" : t.type === "info" ? "bg-blue-500 text-white" : "bg-dark-brown text-white"}`}>
            <span>{t.type === "success" ? "✓" : t.type === "error" ? "✗" : "ℹ"}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return () => {};
  return ctx;
}

/* ═══════════ DETAIL MODAL ═══════════ */
export function DetailModal({ open, onClose, title, data }) {
  return (
    <Modal open={open} onClose={onClose} title={title} wide>
      {data && (
        <div className="space-y-4">
          {Object.entries(data).map(([key, val]) => (
            <div key={key} className="flex justify-between border-b border-gray-100 pb-2 last:border-0">
              <span className="text-sm text-warm-gray">{key}</span>
              <span className="text-sm font-semibold text-dark-brown">{String(val)}</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

/* ═══════════ EXPORT HELPERS ═══════════ */
export function exportToCSV(data, filename) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csv = [headers.join(","), ...data.map(row => headers.map(h => `"${row[h] || ""}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
}

export function exportToPDF(title) {
  return new Promise((resolve) => setTimeout(resolve, 800));
}
