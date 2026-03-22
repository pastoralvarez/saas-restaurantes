import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import MenuCliente from './MenuCliente'

export default async function MenuPage() {
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

  const { data: productos } = await supabase
    .from('productos')
    .select('*')
    .eq('restaurante_id', restaurante.id)
    .order('categoria')

  return <MenuCliente restaurante={restaurante} productos={productos || []} />
}