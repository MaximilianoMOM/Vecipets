'use client';

import React, { ReactNode } from 'react';
import { ToastProvider } from '@/context/ToastContext';

export default function ToastProviderWrapper({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
