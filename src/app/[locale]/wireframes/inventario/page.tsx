import React from 'react';

export default function InventarioWireframe() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Inventario y Refacciones</h1>
            <p className="text-slate-500 mt-1">Control de stock, consumibles y piezas del taller.</p>
          </div>
          <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-md font-bold hover:bg-blue-700 transition-all flex items-center gap-2">
            <span>+</span> Nuevo Producto
          </button>
        </header>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm">Valor del Inventario</p>
            <p className="text-2xl font-bold text-slate-800">$124,500.00</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm">Productos Bajos en Stock</p>
            <p className="text-2xl font-bold text-red-500">12</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                <th className="px-6 py-4">SKU / Producto</th>
                <th className="px-6 py-4 text-center">Categoría</th>
                <th className="px-6 py-4 text-right">Precio Venta</th>
                <th className="px-6 py-4 text-center">Stock Actual</th>
                <th className="px-6 py-4 text-center">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-800">Aceite Sintético 5W-30</p>
                  <p className="text-xs text-slate-500">AC-5W30</p>
                </td>
                <td className="px-6 py-4 text-center text-sm">Lubricantes</td>
                <td className="px-6 py-4 text-right font-medium">$850.00</td>
                <td className="px-6 py-4 text-center font-bold text-slate-800">24</td>
                <td className="px-6 py-4 text-center">
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">Óptimo</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-800">Balatas Delanteras Cerámicas</p>
                  <p className="text-xs text-slate-500">FR-CER-01</p>
                </td>
                <td className="px-6 py-4 text-center text-sm">Frenos</td>
                <td className="px-6 py-4 text-right font-medium">$1,200.00</td>
                <td className="px-6 py-4 text-center font-bold text-red-600">2</td>
                <td className="px-6 py-4 text-center">
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Reabastecer</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}