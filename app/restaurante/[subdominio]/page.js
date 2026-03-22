import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import TiendaCliente from './TiendaCliente'

export default async function RestaurantePage({ params }) {
  const { subdominio } = await params
  const supabase = await createServerSupabaseClient()

  const { data: restaurante } = await supabase
    .from('restaurantes')
    .select('*')
    .eq('subdominio', subdominio)
    .eq('activo', true)
    .single()

  if (!restaurante) return notFound()

  const { data: productos } = await supabase
    .from('productos')
    .select('*')
    .eq('restaurante_id', restaurante.id)
    .eq('disponible', true)
    .order('categoria')

  return <TiendaCliente restaurante={restaurante} productos={productos || []} />
}