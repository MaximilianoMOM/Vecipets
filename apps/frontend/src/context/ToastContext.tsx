'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type TipoToast = 'exito' | 'error' | 'advertencia' | 'info';

export interface ToastItem {
  id: string;
  mensaje: string;
  tipo: TipoToast;
}

interface ToastContextType {
  mostrarToast: (mensaje: string, tipo?: TipoToast) => void;
  removerToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removerToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const mostrarToast = useCallback((mensaje: string, tipo: TipoToast = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, mensaje, tipo }]);

    setTimeout(() => {
      removerToast(id);
    }, 4000);
  }, [removerToast]);

  return (
    <ToastContext.Provider value={{ mostrarToast, removerToast }}>
      {children}
      {/* Toast Container Floating UI */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          let bgColor = 'bg-blue-600 text-white';
          let icon = 'ℹ️';

          if (toast.tipo === 'exito') {
            bgColor = 'bg-emerald-600 text-white';
            icon = '✅';
          } else if (toast.tipo === 'error') {
            bgColor = 'bg-rose-600 text-white';
            icon = '🚨';
          } else if (toast.tipo === 'advertencia') {
            bgColor = 'bg-amber-500 text-white';
            icon = '⚠️';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg font-medium text-sm border border-white/20 animate-slide-down transition-all ${bgColor}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{icon}</span>
                <span>{toast.mensaje}</span>
              </div>
              <button
                onClick={() => removerToast(toast.id)}
                className="ml-3 hover:opacity-75 focus:outline-none text-white font-bold p-1"
                aria-label="Cerrar notificación"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser utilizado dentro de un ToastProvider');
  }
  return context;
};
