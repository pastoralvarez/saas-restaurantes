'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NuevoRestaurante() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nombre: '',
    subdominio: '',
    telefono: '',
    whatsapp: '',
    color_principal: '#ef4444',
    direccion: '',
    email_owner: '',
    password_owner: '',
  })

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'nombre' && !prev.subdominio_editado
        ? { subdominio: value.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') }
        : {})
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Crear restaurante
      const { data: restaurante, error: errRest } = await supabase
        .from('restaurantes')
        .insert({
          nombre: form.nombre,
          subdominio: form.subdominio,
          telefono: form.telefono,
          whatsapp: form.whatsapp,
          color_principal: form.color_principal,
          direccion: form.direccion,
        })
        .select()
        .single()

      if (errRest) throw new Error(errRest.message)

      // 2. Crear usuario owner via API
      const res = await fetch('/api/admin/crear-restaurante', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurante_id: restaurante.id,
          email: form.email_owner,
          password: form.password_owner,
        }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error)

      router.push('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-red-500 rounded-lg"></div>
        <span className="font-bold text-gray-900">RestaurantOS</span>
        <span className="text-gray-400 text-sm">/ Admin /</span>
        <span className="text-gray-600 text-sm">Nuevo restaurante</span>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="text-gray-400 hover:text-gray-600 text-sm">← Volver</Link>
          <h1 className="text-xl font-bold text-gray-900">Registrar restaurante</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-5">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Nombre del restaurante *</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="Pizza Roma"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Subdominio *</label>
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-red-400">
                <input
                  name="subdominio"
                  value={form.subdominio}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2.5 text-sm outline-none"
                  placeholder="pizzaroma"
                  required
                />
                <span className="px-3 text-gray-400 text-sm bg-gray-50 h-full flex items-center border-l border-gray-300 py-2.5">.tuplataforma.com</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Teléfono</label>
              <input
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">WhatsApp</label>
              <input
                name="whatsapp"
                value={form.whatsapp}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Dirección</label>
            <input
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="Calle 123, Ciudad"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Color principal</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="color_principal"
                value={form.color_principal}
                onChange={handleChange}
                className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
              />
              <span className="text-sm text-gray-500">{form.color_principal}</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-medium text-gray-900 mb-4">Acceso del restaurante</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Email *</label>
                <input
                  name="email_owner"
                  type="email"
                  value={form.email_owner}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  placeholder="owner@pizzaroma.com"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Contraseña *</label>
                <input
                  name="password_owner"
                  type="password"
                  value={form.password_owner}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 transition disabled:opacity-50"
          >
            {loading ? 'Creando restaurante...' : 'Crear restaurante'}
          </button>
        </form>
      </div>
    </div>
  )
}