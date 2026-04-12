import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminCliente from './AdminCliente'

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('auth_id', user.id)
    .single()

  if (!usuario || usuario.rol !== 'superadmin') redirect('/login')

  const { data: restaurantes } = await supabase
    .from('restaurantes')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: pedidos } = await supabase
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return <AdminCliente restaurantes={restaurantes || []} pedidos={pedidos || []} />
}