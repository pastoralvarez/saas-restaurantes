import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { nombre, subdominio, telefono, whatsapp, color_principal, direccion, email, password } = await request.json()

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Crear restaurante con service role (sin restricciones de RLS)
    const { data: restaurante, error: errRest } = await supabaseAdmin
      .from('restaurantes')
      .insert({
        nombre,
        subdominio,
        telefono,
        whatsapp,
        color_principal,
        direccion,
      })
      .select()
      .single()

    if (errRest) throw new Error(errRest.message)

    // Crear usuario en Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      // Si falla el usuario, eliminar el restaurante creado
      await supabaseAdmin.from('restaurantes').delete().eq('id', restaurante.id)
      throw new Error(authError.message)
    }

    // Insertar en tabla usuarios
    const { error: userError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        auth_id: authUser.user.id,
        email,
        rol: 'restaurante',
        restaurante_id: restaurante.id,
      })

    if (userError) throw new Error(userError.message)

    return NextResponse.json({ ok: true, restaurante_id: restaurante.id })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}