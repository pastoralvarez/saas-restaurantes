import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Dashboard() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*, restaurantes(*)')
    .eq('auth_id', user.id)
    .single()

  if (!usuario || usuario.rol !== 'restaurante') redirect('/login')

  const restaurante = usuario.restaurantes

  const { data: pedidos } = await supabase
    .from('pedidos')
    .select('*')
    .eq('restaurante_id', restaurante.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const { count: totalClientes } = await supabase
    .from('clientes')
    .select('*', { count: 'exact', head: true })
    .eq('restaurante_id', restaurante.id)

  const { count: totalProductos } = await supabase
    .from('productos')
    .select('*', { count: 'exact', head: true })
    .eq('restaurante_id', restaurante.id)

  const totalVentas = pedidos?.reduce((sum, p) => sum + Number(p.total), 0) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: restaurante.color_principal }}
          >
            {restaurante.nombre.charAt(0)}
          </div>
          <span className="font-bold text-gray-900">{restaurante.nombre}</span>
          <span className="text-gray-400 text-sm">/ Panel</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/menu"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Menú
          </Link>
          <Link href="/api/auth/logout" className="text-sm text-gray-500 hover:text-gray-700">
            Cerrar sesión
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Pedidos totales</p>
            <p className="text-2xl font-bold text-gray-900">{pedidos?.length || 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Clientes</p>
            <p className="text-2xl font-bold text-gray-900">{totalClientes || 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Productos</p>
            <p className="text-2xl font-bold text-gray-900">{totalProductos || 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Ventas totales</p>
            <p className="text-2xl font-bold text-gray-900">${totalVentas.toFixed(2)}</p>
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-4">Pedidos recientes</h2>

        {pedidos && pedidos.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Pedido</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Dirección</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Total</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Hora</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      #{p.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {p.direccion_entrega || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ${Number(p.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <EstadoBadge estado={p.estado} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(p.created_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm">No hay pedidos aún.</p>
            <p className="text-gray-400 text-xs mt-1">Los pedidos aparecerán aquí cuando tus clientes ordenen.</p>
          </div>
        )}

      </div>
    </div>
  )
}

function EstadoBadge({ estado }) {
  const estilos = {
    pendiente: 'bg-yellow-100 text-yellow-700',
    en_proceso: 'bg-blue-100 text-blue-700',
    entregado: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-700',
  }
  return (
    <span className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium " + (estilos[estado] || estilos.pendiente)}>
      {estado.replace('_', ' ')}
    </span>
  )
}