'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function MenuCliente({ restaurante, productos: inicial }) {
  const supabase = createClient()
  const [productos, setProductos] = useState(inicial)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: '',
    disponible: true,
  })

  function abrirNuevo() {
    setEditando(null)
    setForm({ nombre: '', descripcion: '', precio: '', categoria: '', disponible: true })
    setError('')
    setModalAbierto(true)
  }

  function abrirEditar(producto) {
    setEditando(producto)
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      categoria: producto.categoria || '',
      disponible: producto.disponible,
    })
    setError('')
    setModalAbierto(true)
  }

  async function handleGuardar(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const datos = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: parseFloat(form.precio),
      categoria: form.categoria,
      disponible: form.disponible,
      restaurante_id: restaurante.id,
    }

    if (editando) {
      const { data, error } = await supabase
        .from('productos')
        .update(datos)
        .eq('id', editando.id)
        .select()
        .single()

      if (error) { setError(error.message); setLoading(false); return }
      setProductos(prev => prev.map(p => p.id === editando.id ? data : p))
    } else {
      const { data, error } = await supabase
        .from('productos')
        .insert(datos)
        .select()
        .single()

      if (error) { setError(error.message); setLoading(false); return }
      setProductos(prev => [...prev, data])
    }

    setModalAbierto(false)
    setLoading(false)
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar este producto?')) return
    const { error } = await supabase.from('productos').delete().eq('id', id)
    if (!error) setProductos(prev => prev.filter(p => p.id !== id))
  }

  async function toggleDisponible(producto) {
    const { data } = await supabase
      .from('productos')
      .update({ disponible: !producto.disponible })
      .eq('id', producto.id)
      .select()
      .single()
    if (data) setProductos(prev => prev.map(p => p.id === producto.id ? data : p))
  }

  const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: restaurante.color_principal }}
          >
            {restaurante.nombre.charAt(0)}
          </div>
          <span className="font-bold text-gray-900">{restaurante.nombre}</span>
          <span className="text-gray-400 text-sm">/ Menú</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← Panel
          </Link>
          <button
            onClick={abrirNuevo}
            className="text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition"
            style={{ backgroundColor: restaurante.color_principal }}
          >
            + Agregar producto
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {productos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm mb-4">No tienes productos aún.</p>
            <button
              onClick={abrirNuevo}
              className="text-white px-6 py-2.5 rounded-xl text-sm font-medium"
              style={{ backgroundColor: restaurante.color_principal }}
            >
              Agregar primer producto
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {categorias.length > 0 ? (
              categorias.map(cat => (
                <div key={cat}>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">{cat}</h3>
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    {productos.filter(p => p.categoria === cat).map((p, i, arr) => (
                      <ProductoFila
                        key={p.id}
                        producto={p}
                        ultimo={i === arr.length - 1}
                        color={restaurante.color_principal}
                        onEditar={() => abrirEditar(p)}
                        onEliminar={() => handleEliminar(p.id)}
                        onToggle={() => toggleDisponible(p)}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {productos.map((p, i, arr) => (
                  <ProductoFila
                    key={p.id}
                    producto={p}
                    ultimo={i === arr.length - 1}
                    color={restaurante.color_principal}
                    onEditar={() => abrirEditar(p)}
                    onEliminar={() => handleEliminar(p.id)}
                    onToggle={() => toggleDisponible(p)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {editando ? 'Editar producto' : 'Nuevo producto'}
            </h2>
            <form onSubmit={handleGuardar} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Nombre *</label>
                <input
                  value={form.nombre}
                  onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  placeholder="Pizza Margherita"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                  placeholder="Tomate, mozzarella y albahaca"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Precio *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.precio}
                    onChange={e => setForm(p => ({ ...p, precio: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    placeholder="12.99"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Categoría</label>
                  <input
                    value={form.categoria}
                    onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    placeholder="Pizzas"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="disponible"
                  checked={form.disponible}
                  onChange={e => setForm(p => ({ ...p, disponible: e.target.checked }))}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="disponible" className="text-sm text-gray-700">Disponible para pedidos</label>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
                  style={{ backgroundColor: restaurante.color_principal }}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function ProductoFila({ producto, ultimo, color, onEditar, onEliminar, onToggle }) {
  return (
    <div className={"flex items-center justify-between px-5 py-4" + (ultimo ? '' : ' border-b border-gray-50')}>
      <div className="flex items-center gap-4 flex-1">
        <div>
          <p className="text-sm font-medium text-gray-900">{producto.nombre}</p>
          {producto.descripcion && (
            <p className="text-xs text-gray-400 mt-0.5">{producto.descripcion}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-bold text-gray-900">${Number(producto.precio).toFixed(2)}</span>
        <button
          onClick={onToggle}
          className={"text-xs px-2.5 py-1 rounded-full font-medium " + (producto.disponible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}
        >
          {producto.disponible ? 'Disponible' : 'Oculto'}
        </button>
        <button onClick={onEditar} className="text-xs text-gray-400 hover:text-gray-600">Editar</button>
        <button onClick={onEliminar} className="text-xs text-red-400 hover:text-red-600">Eliminar</button>
      </div>
    </div>
  )
}