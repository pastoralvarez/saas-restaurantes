import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { restaurante_id, whatsapp, cliente, items, total } = await request.json()

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Guardar o encontrar cliente
    let cliente_id = null
    if (cliente.telefono) {
      const { data: clienteExiste } = await supabaseAdmin
        .from('clientes')
        .select('id')
        .eq('restaurante_id', restaurante_id)
        .eq('telefono', cliente.telefono)
        .single()

      if (clienteExiste) {
        cliente_id = clienteExiste.id
      } else {
        const { data: nuevoCliente } = await supabaseAdmin
          .from('clientes')
          .insert({
            restaurante_id,
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            direccion: cliente.direccion,
          })
          .select()
          .single()
        cliente_id = nuevoCliente?.id
      }
    }

    // Guardar pedido
    const { data: pedido, error } = await supabaseAdmin
      .from('pedidos')
      .insert({
        restaurante_id,
        cliente_id,
        items,
        total,
        direccion_entrega: cliente.direccion,
        estado: 'pendiente',
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    // Enviar WhatsApp si hay número configurado
    if (whatsapp) {
      const numero = whatsapp.replace(/\D/g, '')
      const mensaje = encodeURIComponent(
        `🍽️ *Nuevo pedido*\n\n` +
        `👤 *Cliente:* ${cliente.nombre}\n` +
        `📞 *Teléfono:* ${cliente.telefono}\n` +
        `📍 *Dirección:* ${cliente.direccion}\n\n` +
        `*Productos:*\n` +
        items.map(i => `• ${i.cantidad}x ${i.nombre} — $${(i.precio * i.cantidad).toFixed(2)}`).join('\n') +
        `\n\n*Total: $${total.toFixed(2)}*`
      )

      // URL de WhatsApp (se abre en el navegador del cliente)
      const whatsappUrl = `https://wa.me/${numero}?text=${mensaje}`

      return NextResponse.json({ ok: true, pedido_id: pedido.id, whatsappUrl })
    }

    return NextResponse.json({ ok: true, pedido_id: pedido.id })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}