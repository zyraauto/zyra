import React from 'react';

export default function VentasWireframe() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Ventas y Facturación</h1>
            <p className="text-slate-500 mt-1">Historial de órdenes pagadas y emisión de CFDI.</p>
          </div>
          <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl shadow-md font-bold hover:bg-slate-800 transition-all">
            Exportar Reporte
          </button>
        </header>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                <th className="px-6 py-4">Folio / Fecha</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4 text-right">Total Pagado</th>
                <th className="px-6 py-4 text-center">Método</th>
                <th className="px-6 py-4 text-center">Factura (CFDI)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-800">#00123</p>
                  <p className="text-xs text-slate-500">20 Sep 2026</p>
                </td>
                <td className="px-6 py-4 text-sm font-medium">Carlos Mendoza</td>
                <td className="px-6 py-4 text-right font-bold text-emerald-600">$1,624.00</td>
                <td className="px-6 py-4 text-center text-sm">Tarjeta</td>
                <td className="px-6 py-4 text-center">
                  <button className="text-blue-600 hover:underline text-sm font-semibold">Generar CFDI</button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-800">#00122</p>
                  <p className="text-xs text-slate-500">19 Sep 2026</p>
                </td>
                <td className="px-6 py-4 text-sm font-medium">Ana Lucía Garza</td>
                <td className="px-6 py-4 text-right font-bold text-emerald-600">$4,500.00</td>
                <td className="px-6 py-4 text-center text-sm">Transferencia</td>
                <td className="px-6 py-4 text-center">
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">Timbrada</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}