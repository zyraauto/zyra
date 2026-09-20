import React from 'react';

export default function OrdenServicioWireframe() {
  return (
    <div className="min-h-screen bg-slate-50 p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Cabecera */}
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                En Diagnóstico
              </span>
              <span className="text-slate-400 font-medium">Folio: #00126</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Nueva Orden de Servicio</h1>
          </div>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md shadow-blue-200 font-bold hover:bg-blue-700 transition-all">
            Guardar Orden
          </button>
        </header>

        <div className="grid grid-cols-12 gap-6">
          {/* Columna Izquierda: Cliente y Vehículo (4 columnas) */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* Tarjeta Cliente */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                <span>👤</span> Datos del Cliente
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Buscar o Crear Cliente</label>
                  <input type="text" placeholder="Ej. Juan Pérez..." className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Teléfono (WhatsApp)</label>
                  <input type="text" placeholder="963..." className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" />
                </div>
              </div>
            </div>

            {/* Tarjeta Vehículo */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                <span>🚘</span> Vehículo
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Seleccionar Vehículo</label>
                  <select className="w-full border border-slate-300 rounded-xl p-2.5 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50">
                    <option>+ Agregar nuevo vehículo...</option>
                    <option>Toyota Corolla 2022 (ABC-123)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Kilometraje Actual</label>
                  <div className="relative">
                    <input type="number" placeholder="Ej. 45000" className="w-full border border-slate-300 rounded-xl p-2.5 pr-10 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" />
                    <span className="absolute right-3 top-2.5 text-slate-400 text-sm font-medium">km</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Diagnóstico y Evidencia (8 columnas) */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* Tarjeta Diagnóstico */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                <span>📝</span> Diagnóstico y Problemas
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Problemas Reportados por el Cliente</label>
                  <textarea rows={3} placeholder="Describe las fallas, ruidos o motivos de ingreso..." className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">Técnico Asignado</label>
                    <select className="w-full border border-slate-300 rounded-xl p-2.5 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50">
                      <option>Seleccionar mecánico...</option>
                      <option>Carlos (Mecánico Principal)</option>
                      <option>Roberto (Eléctrico)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">Fecha de Promesa</label>
                    <input type="date" className="w-full border border-slate-300 rounded-xl p-2.5 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjeta Evidencia Fotográfica */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                <span>📸</span> Evidencia Fotográfica (Cloudinary)
              </h2>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 flex flex-col items-center justify-center text-slate-500 bg-slate-50 cursor-pointer hover:bg-slate-100 hover:border-blue-400 transition-all">
                <span className="text-5xl mb-3">📥</span>
                <p className="text-sm font-bold text-slate-700">Haz clic o arrastra imágenes aquí</p>
                <p className="text-xs text-slate-400 mt-1">Soporta JPG, PNG (Max 5MB por foto)</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}