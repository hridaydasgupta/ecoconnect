import React, { useState, useCallback, useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────
   Toast item component
───────────────────────────────────────────── */
function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // slide-in
    requestAnimationFrame(() => setVisible(true));
    // auto-dismiss
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration ?? 3500);
    return () => clearTimeout(timerRef.current);
  }, [toast.id, toast.duration, onRemove]);

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const colors = {
    success: { bg: 'rgba(0,214,143,0.12)',  border: 'rgba(0,214,143,0.3)',  color: '#6ee7b7' },
    error:   { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  color: '#fca5a5' },
    info:    { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', color: '#93c5fd' },
    warning: { bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.3)',  color: '#fde68a' },
  };
  const c = colors[toast.type] ?? colors.info;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '12px 16px',
        borderRadius: '10px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
        minWidth: '280px',
        maxWidth: '380px',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        transform: visible ? 'translateX(0) scale(1)' : 'translateX(100%) scale(0.95)',
        opacity: visible ? 1 : 0,
        cursor: 'pointer',
      }}
      onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300); }}
    >
      <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }}>
        {icons[toast.type] ?? icons.info}
      </span>
      <div style={{ flex: 1 }}>
        {toast.title && (
          <div style={{ fontWeight: 700, fontSize: '13px', color: c.color, marginBottom: '2px' }}>
            {toast.title}
          </div>
        )}
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          {toast.message}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); setVisible(false); setTimeout(() => onRemove(toast.id), 300); }}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', padding: '0 2px', flexShrink: 0 }}
      >✕</button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Toast container (render at bottom-right)
───────────────────────────────────────────── */
export function ToastContainer({ toasts, onRemove }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'all' }}>
          <ToastItem toast={t} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   useToast hook — use this in any component
───────────────────────────────────────────── */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, message, duration }]);
    return id;
  }, []);

  const toast = {
    success: (message, title, duration) => addToast({ type: 'success', title, message, duration }),
    error:   (message, title, duration) => addToast({ type: 'error',   title, message, duration }),
    info:    (message, title, duration) => addToast({ type: 'info',    title, message, duration }),
    warning: (message, title, duration) => addToast({ type: 'warning', title, message, duration }),
  };

  return { toasts, removeToast, toast };
}
