import React from 'react';

export default function CotizacionProfesional() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER CON DEGRADADO */}
        <header className="flex justify-between items-end bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                Pendiente de Aprobación
              </span>
              <span className="text-slate-400 text-sm font-medium">Cotización #00025</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Presupuesto de Servicio</h1>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
              Descargar PDF
            </button>
            <button className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-md shadow-emerald-200 hover:shadow-lg transition-all flex items-center gap-2">
              <span className="text-xl">💬</span> Enviar por WhatsApp
            </button>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          {/* SECCIÓN PRINCIPAL: TABLA DE CONCEPTOS (8 Columnas) */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800">Detalle de Conceptos</h2>
                <button className="text-blue-600 text-sm font-bold hover:text-blue-700 flex items-center gap-1">
                  + Agregar Concepto Libre
                </button>
              </div>
              
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100">
                    <th className="px-6 py-4 font-semibold">Descripción (Refacción / Servicio)</th>
                    <th className="px-6 py-4 font-semibold text-center">Cant.</th>
                    <th className="px-6 py-4 font-semibold text-right">P. Unitario</th>
                    <th className="px-6 py-4 font-semibold text-right">Total</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Item 1 */}
                  <tr className="group hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-800">Aceite Sintético 5W-30 (Garrafa 5L)</p>
                      <p className="text-sm text-slate-500">Refacción - SKU: AC-5W30</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <input type="number" defaultValue="1" className="w-16 text-center border border-slate-200 rounded-lg py-1.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </td>
                    <td className="px-6 py-5 text-right font-medium text-slate-600">$850.00</td>
                    <td className="px-6 py-5 text-right font-bold text-slate-800">$850.00</td>
                    <td className="px-6 py-5 text-center text-slate-300 group-hover:text-red-500 cursor-pointer">🗑️</td>
                  </tr>
                  {/* Item 2 */}
                  <tr className="group hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-800">Filtro de Aceite Original</p>
                      <p className="text-sm text-slate-500">Refacción - SKU: FL-098</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <input type="number" defaultValue="1" className="w-16 text-center border border-slate-200 rounded-lg py-1.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </td>
                    <td className="px-6 py-5 text-right font-medium text-slate-600">$250.00</td>
                    <td className="px-6 py-5 text-right font-bold text-slate-800">$250.00</td>
                    <td className="px-6 py-5 text-center text-slate-300 group-hover:text-red-500 cursor-pointer">🗑️</td>
                  </tr>
                  {/* Item 3 */}
                  <tr className="group hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-800">Mano de Obra: Cambio de Aceite</p>
                      <p className="text-sm text-slate-500">Servicio Interno</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <input type="number" defaultValue="1" className="w-16 text-center border border-slate-200 rounded-lg py-1.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </td>
                    <td className="px-6 py-5 text-right font-medium text-slate-600">$300.00</td>
                    <td className="px-6 py-5 text-right font-bold text-slate-800">$300.00</td>
                    <td className="px-6 py-5 text-center text-slate-300 group-hover:text-red-500 cursor-pointer">🗑️</td>
                  </tr>
                </tbody>
              </table>
              
              {/* Buscador de catálogo rápido */}
              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
                  <input type="text" placeholder="Buscar refacción o servicio en el catálogo..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA LATERAL: RESUMEN Y CLIENTE (4 Columnas) */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* Tarjeta de Totales */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Resumen de Cotización</h3>
              
              <div className="space-y-3 text-sm text-slate-600 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal Conceptos</span>
                  <span className="font-medium">$1,400.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Descuento Aplicado</span>
                  <span className="font-medium text-emerald-600">-$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (16%)</span>
                  <span className="font-medium">$224.00</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-800">Total a Pagar</span>
                  <span className="text-3xl font-extrabold text-blue-600">$1,624.00</span>
                </div>
              </div>

              <button className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-md shadow-blue-200 hover:shadow-lg transition-all mb-3">
                Aprobar Orden de Servicio
              </button>
            </div>

            {/* Tarjeta de Cliente/Vehículo mini */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Datos del Servicio</h3>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl">👨🏽</div>
                <div>
                  <p className="font-bold text-slate-800">Carlos Mendoza</p>
                  <p className="text-xs text-slate-500">Cliente Frecuente</p>
                </div>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="font-bold text-slate-700 text-sm">Toyota Corolla 2022</p>
                <p className="text-xs text-slate-500">Placas: ABC-123 • 45,000 km</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}