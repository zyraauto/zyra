import React from 'react';

export default function ConfiguracionWireframe() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Configuración del Taller</h1>
          <p className="text-slate-500 mt-1">Administra la información pública y los usuarios de tu negocio.</p>
        </header>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">🏢 Perfil del Negocio</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Nombre del Taller</label>
              <input type="text" defaultValue="Zyra AutoService" className="w-full border border-slate-300 rounded-lg p-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Teléfono (WhatsApp)</label>
              <input type="text" defaultValue="963 123 4567" className="w-full border border-slate-300 rounded-lg p-2 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">Dirección</label>
              <input type="text" defaultValue="Av. Principal #123, Comitán de Domínguez" className="w-full border border-slate-300 rounded-lg p-2 text-sm" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
            <h2 className="text-lg font-bold text-slate-800">👥 Usuarios y Roles</h2>
            <button className="text-sm text-blue-600 font-bold">+ Invitar Usuario</button>
          </div>
          <ul className="space-y-3">
            <li className="flex justify-between items-center text-sm">
              <div>
                <p className="font-bold">Luis</p>
                <p className="text-slate-500">luis@taller.com</p>
              </div>
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">Administrador</span>
            </li>
            <li className="flex justify-between items-center text-sm">
              <div>
                <p className="font-bold">Carlos M.</p>
                <p className="text-slate-500">carlos@taller.com</p>
              </div>
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">Mecánico</span>
            </li>
          </ul>
        </div>
        
        <div className="flex justify-end">
          <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl shadow-md font-bold hover:bg-blue-700 transition-all">
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}