import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import ConfiguracionCliente from './ConfiguracionCliente'

export default async function ConfiguracionPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*, restaurantes(*)')
    .eq('auth_id', user.id)
    .single()

  if (!usuario || usuario.rol !== 'restaurante') redirect('/login')

  return <ConfiguracionCliente restaurante={usuario.restaurantes} />
}