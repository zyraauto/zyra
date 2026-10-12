import React from 'react';

export default function ClientesWireframe() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabecera */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Directorio de Clientes</h1>
            <p className="text-slate-500 mt-1">Gestiona tu cartera de clientes y su historial automotriz.</p>
          </div>
          <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-md shadow-blue-200 font-bold hover:bg-blue-700 transition-all flex items-center gap-2">
            <span>+</span> Nuevo Cliente
          </button>
        </header>

        {/* Filtros y Buscador */}
        <div className="bg-white p-4 rounded-t-2xl border border-slate-200 border-b-0 flex gap-4 items-center">
          <div className="relative flex-grow">
            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
            <input type="text" placeholder="Buscar por nombre, teléfono o placas..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-50 flex items-center gap-2">
            ⚙️ Filtros
          </button>
        </div>

        {/* Tabla CRM */}
        <div className="bg-white rounded-b-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                <th className="px-6 py-4">Cliente / Contacto</th>
                <th className="px-6 py-4">Vehículos</th>
                <th className="px-6 py-4">Último Servicio</th>
                <th className="px-6 py-4">Estatus</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              
              {/* Cliente 1 */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">CM</div>
                    <div>
                      <p className="font-bold text-slate-800">Carlos Mendoza</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">📱 963-123-4567</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200">
                    🚗 Toyota Corolla
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-slate-700">Hace 2 días</p>
                  <p className="text-xs text-slate-400">Cambio de Aceite</p>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">Activo</span>
                </td>
                <td className="px-6 py-4 text-right text-slate-400">
                  <button className="hover:text-blue-600 font-medium text-sm">Ver Perfil</button>
                </td>
              </tr>

              {/* Cliente 2 */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">AG</div>
                    <div>
                      <p className="font-bold text-slate-800">Ana Lucía Garza</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">📱 963-987-6543</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 flex gap-1 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200">
                    🚙 Honda CR-V
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200">
                    🚗 VW Jetta
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-red-600">Hace 7 meses</p>
                  <p className="text-xs text-slate-400">Afinación Mayor</p>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">Requiere Seguimiento</span>
                </td>
                <td className="px-6 py-4 text-right text-slate-400">
                  <button className="hover:text-blue-600 font-medium text-sm">Ver Perfil</button>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}