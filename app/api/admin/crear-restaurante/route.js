import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { restaurante_id, email, password } = await request.json()

    // Usar service role para crear usuarios sin restricciones
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Crear usuario en Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) throw new Error(authError.message)

    // Insertar en tabla usuarios
    const { error: userError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        auth_id: authUser.user.id,
        email,
        rol: 'restaurante',
        restaurante_id,
      })

    if (userError) throw new Error(userError.message)

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}