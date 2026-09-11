import React from 'react';
import ReporteDetalleClient from './ReporteDetalleClient';

export async function generateStaticParams() {
  return [{ id: '1' }];
}

export default function ReporteDetallePage() {
  return <ReporteDetalleClient />;
}