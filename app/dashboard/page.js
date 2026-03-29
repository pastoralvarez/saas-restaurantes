import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DashboardCliente from './DashboardCliente'

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

  const { data: pedidosIniciales } = await supabase
    .from('pedidos')
    .select('*')
    .eq('restaurante_id', restaurante.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const { count: totalClientes } = await supabase
    .from('clientes')
    .select('*', { count: 'exact', head: true })
    .eq('restaurante_id', restaurante.id)

  const { count: totalProductos } = await supabase
    .from('productos')
    .select('*', { count: 'exact', head: true })
    .eq('restaurante_id', restaurante.id)

  return (
    <DashboardCliente
      restaurante={restaurante}
      pedidosIniciales={pedidosIniciales || []}
      totalClientes={totalClientes || 0}
      totalProductos={totalProductos || 0}
    />
  )
}