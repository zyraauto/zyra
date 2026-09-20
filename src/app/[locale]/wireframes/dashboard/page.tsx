import React from 'react';

export default function DashboardWireframe() {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-10 text-blue-400 tracking-tight">Zyra AutoSaaS</h1>
        <nav className="space-y-4">
          <div className="p-2 bg-blue-600 rounded-lg text-sm font-semibold shadow-md shadow-blue-900/50 flex items-center gap-2">
            <span>📊</span> Dashboard
          </div>
          <div className="p-2 hover:bg-slate-800 rounded-lg text-sm text-gray-300 cursor-pointer transition-colors flex items-center gap-2">
            <span>👥</span> Clientes
          </div>
          <div className="p-2 hover:bg-slate-800 rounded-lg text-sm text-gray-300 cursor-pointer transition-colors flex items-center gap-2">
            <span>🚘</span> Vehículos
          </div>
          <div className="p-2 hover:bg-slate-800 rounded-lg text-sm text-gray-300 cursor-pointer transition-colors flex items-center gap-2">
            <span>📝</span> Órdenes de Servicio
          </div>
          <div className="p-2 hover:bg-slate-800 rounded-lg text-sm text-gray-300 cursor-pointer transition-colors flex items-center gap-2">
            <span>💰</span> Cotizaciones
          </div>
          <div className="p-2 hover:bg-slate-800 rounded-lg text-sm text-gray-300 cursor-pointer transition-colors flex items-center gap-2">
            <span>📦</span> Inventario
          </div>
          <div className="p-2 hover:bg-slate-800 rounded-lg text-sm text-gray-300 cursor-pointer transition-colors flex items-center gap-2">
            <span>⚙️</span> Configuración
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Taller Automotriz Central</h2>
            <p className="text-gray-500 mt-1">Resumen de operaciones de hoy</p>
          </div>
          <div className="flex items-center gap-5">
            <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-md shadow-blue-200 font-bold hover:bg-blue-700 transition-all">
              + Nueva Orden
            </button>
            <div className="w-11 h-11 bg-slate-200 rounded-full border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-500">
              VP
            </div>
          </div>
        </header>

        {/* KPI CARDS (Basado en el documento de requerimientos) */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition-shadow">
            <div>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Citas de hoy</p>
              <p className="text-4xl font-extrabold text-slate-800">8</p>
            </div>
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 text-3xl">📅</div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition-shadow">
            <div>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">En servicio</p>
              <p className="text-4xl font-extrabold text-slate-800">5</p>
            </div>
            <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 text-3xl">🔧</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition-shadow">
            <div>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Ventas del día</p>
              <p className="text-4xl font-extrabold text-emerald-600">$8,450</p>
            </div>
            <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 text-3xl">💵</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition-shadow">
            <div>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Cotiz. Pendientes</p>
              <p className="text-4xl font-extrabold text-slate-800">3</p>
            </div>
            <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 text-3xl">⏱️</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition-shadow">
            <div>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Clientes nuevos</p>
              <p className="text-4xl font-extrabold text-slate-800">4</p>
            </div>
            <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500 text-3xl">👥</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition-shadow">
            <div>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Próx. Servicios</p>
              <p className="text-4xl font-extrabold text-slate-800">12</p>
            </div>
            <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 text-3xl">📣</div>
          </div>
        </div>

        {/* RECENT ORDERS TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-lg">Órdenes Activas Recientes</h3>
            <button className="text-sm text-blue-600 font-bold hover:text-blue-700 transition-colors">Ver todas las órdenes →</button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
                <th className="px-6 py-4">Folio</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Vehículo</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-5 font-bold text-slate-800">#00124</td>
                <td className="px-6 py-5 font-medium text-slate-700">Carlos Mendoza</td>
                <td className="px-6 py-5 text-slate-500">Toyota Corolla 2022</td>
                <td className="px-6 py-5">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100">
                    En Diagnóstico
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-5 font-bold text-slate-800">#00125</td>
                <td className="px-6 py-5 font-medium text-slate-700">Ana Lucía Garza</td>
                <td className="px-6 py-5 text-slate-500">Honda CR-V 2020</td>
                <td className="px-6 py-5">
                  <span className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-100">
                    Esperando Aprobación
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-5 font-bold text-slate-800">#00121</td>
                <td className="px-6 py-5 font-medium text-slate-700">Roberto Juárez</td>
                <td className="px-6 py-5 text-slate-500">Ford Ranger 2018</td>
                <td className="px-6 py-5">
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100">
                    Trabajo Finalizado
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}