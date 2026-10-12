import React from 'react';

export default function ServiciosWireframe() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Catálogo de Servicios</h1>
            <p className="text-slate-500 mt-1">Configura la mano de obra y servicios que ofreces en el taller.</p>
          </div>
          <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-md shadow-blue-200 font-bold hover:bg-blue-700 transition-all flex items-center gap-2">
            <span>+</span> Nuevo Servicio
          </button>
        </header>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Tabs de Categorías */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-4">
            <button className="px-5 py-3.5 border-b-2 border-blue-600 text-blue-600 font-bold text-sm tracking-wide">Mantenimiento (8)</button>
            <button className="px-5 py-3.5 border-b-2 border-transparent text-slate-500 font-bold text-sm hover:text-slate-700 transition-colors tracking-wide">Frenos (4)</button>
            <button className="px-5 py-3.5 border-b-2 border-transparent text-slate-500 font-bold text-sm hover:text-slate-700 transition-colors tracking-wide">Suspensión (6)</button>
            <button className="px-5 py-3.5 border-b-2 border-transparent text-slate-500 font-bold text-sm hover:text-slate-700 transition-colors tracking-wide">Diagnóstico (2)</button>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-slate-400 font-extrabold border-b border-slate-100 bg-white">
                <th className="px-6 py-4">Servicio / Descripción</th>
                <th className="px-6 py-4 text-center">Tiempo Estimado</th>
                <th className="px-6 py-4 text-right">Precio Base (M.O.)</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              
              <tr className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-5">
                  <p className="font-bold text-slate-800 text-base">Afinación Mayor (4 Cilindros)</p>
                  <p className="text-sm text-slate-500 mt-0.5">Incluye lavado de inyectores, cambio de bujías y filtros.</p>
                </td>
                <td className="px-6 py-5 text-center text-sm text-slate-600 font-bold">3.5 hrs</td>
                <td className="px-6 py-5 text-right">
                  <span className="font-extrabold text-emerald-600 text-base">$1,200.00</span>
                </td>
                <td className="px-6 py-5 text-center">
                  <div className="w-11 h-6 bg-blue-600 rounded-full relative mx-auto cursor-pointer shadow-inner">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                  </div>
                </td>
                <td className="px-6 py-5 text-right text-slate-400 text-sm">
                  <button className="hover:text-blue-600 mx-2 transition-colors">✏️</button>
                  <button className="hover:text-red-500 transition-colors">🗑️</button>
                </td>
              </tr>

              <tr className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-5">
                  <p className="font-bold text-slate-800 text-base">Cambio de Aceite Sintético</p>
                  <p className="text-sm text-slate-500 mt-0.5">Revisión de 10 puntos de seguridad incluida.</p>
                </td>
                <td className="px-6 py-5 text-center text-sm text-slate-600 font-bold">1.0 hrs</td>
                <td className="px-6 py-5 text-right">
                  <span className="font-extrabold text-emerald-600 text-base">$300.00</span>
                </td>
                <td className="px-6 py-5 text-center">
                  <div className="w-11 h-6 bg-blue-600 rounded-full relative mx-auto cursor-pointer shadow-inner">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                  </div>
                </td>
                <td className="px-6 py-5 text-right text-slate-400 text-sm">
                  <button className="hover:text-blue-600 mx-2 transition-colors">✏️</button>
                  <button className="hover:text-red-500 transition-colors">🗑️</button>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}