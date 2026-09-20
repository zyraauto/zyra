import React from 'react';

export default function VehiculosWireframe() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Padrón Vehicular</h1>
            <p className="text-slate-500 mt-1">Historial y expediente de los vehículos atendidos.</p>
          </div>
          <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-slate-800 transition-all flex items-center gap-2">
            <span>+</span> Registrar Vehículo
          </button>
        </header>

        {/* Buscador */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex gap-4">
          <div className="relative flex-grow">
            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
            <input type="text" placeholder="Buscar por Placas, VIN o Modelo..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <select className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-medium text-sm bg-slate-50 outline-none">
            <option>Todas las marcas</option>
            <option>Toyota</option>
            <option>Honda</option>
            <option>Volkswagen</option>
          </select>
        </div>

        {/* Grid de Vehículos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Tarjeta Auto 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
            <div className="bg-slate-800 p-5 flex justify-between items-start relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-10 translate-x-10 blur-xl"></div>
              <div className="relative z-10">
                <h3 className="text-white font-extrabold text-xl">Corolla LE</h3>
                <p className="text-slate-300 text-sm font-medium">Toyota • 2022</p>
              </div>
              <div className="relative z-10 bg-white/20 px-3 py-1 rounded-lg text-white font-mono text-sm tracking-widest backdrop-blur-md border border-white/30 font-bold shadow-sm">
                ABC-123
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                <span className="text-slate-500 font-medium">Propietario</span>
                <span className="font-bold text-slate-700">Carlos Mendoza</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                <span className="text-slate-500 font-medium">Kilometraje</span>
                <span className="font-bold text-slate-700">45,000 km</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Próx. Servicio</span>
                <span className="font-bold text-amber-600">En 500 km (Aceite)</span>
              </div>
              <button className="w-full mt-3 py-2.5 bg-slate-50 border border-slate-200 text-blue-600 font-bold rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors">
                Ver Bitácora Completa
              </button>
            </div>
          </div>

          {/* Tarjeta Auto 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
            <div className="bg-blue-900 p-5 flex justify-between items-start relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-10 translate-x-10 blur-xl"></div>
              <div className="relative z-10">
                <h3 className="text-white font-extrabold text-xl">CR-V Turbo</h3>
                <p className="text-blue-200 text-sm font-medium">Honda • 2020</p>
              </div>
              <div className="relative z-10 bg-white/20 px-3 py-1 rounded-lg text-white font-mono text-sm tracking-widest backdrop-blur-md border border-white/30 font-bold shadow-sm">
                XYZ-987
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                <span className="text-slate-500 font-medium">Propietario</span>
                <span className="font-bold text-slate-700">Ana Lucía Garza</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                <span className="text-slate-500 font-medium">Kilometraje</span>
                <span className="font-bold text-slate-700">82,300 km</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Próx. Servicio</span>
                <span className="font-bold text-slate-400">Al día</span>
              </div>
              <button className="w-full mt-3 py-2.5 bg-slate-50 border border-slate-200 text-blue-600 font-bold rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors">
                Ver Bitácora Completa
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}