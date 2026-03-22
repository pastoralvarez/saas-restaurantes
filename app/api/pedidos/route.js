import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { restaurante_id, whatsapp, cliente, items, total, metodo_envio, metodo_pago, referencia } = await request.json()

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

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
          .insert({ restaurante_id, nombre: cliente.nombre, telefono: cliente.telefono, direccion: cliente.direccion })
          .select()
          .single()
        cliente_id = nuevoCliente?.id
      }
    }

    const { data: pedido, error } = await supabaseAdmin
      .from('pedidos')
      .insert({
        restaurante_id,
        cliente_id,
        items,
        total,
        direccion_entrega: metodo_envio === 'domicilio' ? cliente.direccion : 'Recoger en establecimiento',
        estado: 'pendiente',
        notas: `Envío: ${metodo_envio} | Pago: ${metodo_pago}${referencia ? ' | Ref: ' + referencia : ''}`,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    if (whatsapp) {
      const numero = whatsapp.replace(/\D/g, '')
      const mensaje = encodeURIComponent(
        `🍽️ *Nuevo pedido #${pedido.id.slice(0, 8)}*\n\n` +
        `👤 *Cliente:* ${cliente.nombre}\n` +
        `📞 *Teléfono:* ${cliente.telefono}\n` +
        `📦 *Envío:* ${metodo_envio === 'domicilio' ? 'A domicilio' : 'Recoger en establecimiento'}\n` +
        (metodo_envio === 'domicilio' ? `📍 *Dirección:* ${cliente.direccion}\n` : '') +
        `💳 *Pago:* ${metodo_pago}\n` +
        (referencia ? `🔖 *Referencia:* ${referencia}\n` : '') +
        `\n*Productos:*\n` +
        items.map(i => `• ${i.cantidad}x ${i.nombre} — $${(i.precio * i.cantidad).toFixed(2)}`).join('\n') +
        `\n\n*Total: $${total.toFixed(2)}*`
      )
      const whatsappUrl = `https://wa.me/${numero}?text=${mensaje}`
      return NextResponse.json({ ok: true, pedido_id: pedido.id, whatsappUrl })
    }

    return NextResponse.json({ ok: true, pedido_id: pedido.id })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}