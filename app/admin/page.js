import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient()

  const { data: restaurantes } = await supabase
    .from('restaurantes')
    .select('*')
    .order('created_at', { ascending: false })

  const { count: totalPedidos } = await supabase
    .from('pedidos')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-500 rounded-lg"></div>
          <span className="font-bold text-gray-900">Camia</span>
          <span className="text-gray-400 text-sm">/ Admin</span>
        </div>
        <Link href="/api/auth/logout" className="text-sm text-gray-500 hover:text-gray-700">
          Cerrar sesión
        </Link>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Restaurantes</p>
            <p className="text-2xl font-bold text-gray-900">{restaurantes?.length || 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Pedidos totales</p>
            <p className="text-2xl font-bold text-gray-900">{totalPedidos || 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Ingresos hoy</p>
            <p className="text-2xl font-bold text-gray-900">$0</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Comisiones</p>
            <p className="text-2xl font-bold text-gray-900">$0</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Restaurantes</h2>
          <Link href="/admin/restaurantes/nuevo" className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-600 transition">
            + Nuevo restaurante
          </Link>
        </div>

        {restaurantes && restaurantes.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Restaurante</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Subdominio</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">WhatsApp</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {restaurantes.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: r.color_principal }}>
                          {r.nombre.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{r.nombre}</p>
                          <p className="text-xs text-gray-400">{r.direccion}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a href={"http://" + r.subdominio + ".localhost:3000"} target="_blank" className="text-sm text-red-500 hover:underline">
                        {r.subdominio}.tuplataforma.com
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{r.whatsapp || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={r.activo ? "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700" : "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"}>
                        {r.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={"/admin/restaurantes/" + r.id} className="text-sm text-gray-500 hover:text-gray-700">
                        Ver detalle →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm">No hay restaurantes registrados aún.</p>
            <Link href="/admin/restaurantes/nuevo" className="inline-block mt-4 bg-red-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 transition">
              Crear primer restaurante
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}