'use client'
import { useState } from 'react'

export default function TiendaCliente({ restaurante, productos }) {
  const [carrito, setCarrito] = useState([])
  const [vista, setVista] = useState('menu')
  const [categoriaActiva, setCategoriaActiva] = useState('todas')
  const [form, setForm] = useState({ nombre: '', telefono: '', direccion: '' })
  const [pedidoEnviado, setPedidoEnviado] = useState(false)
  const [loading, setLoading] = useState(false)

  const color = restaurante.color_principal || '#ef4444'

  const categorias = ['todas', ...new Set(productos.map(p => p.categoria).filter(Boolean))]

  const productosFiltrados = categoriaActiva === 'todas'
    ? productos
    : productos.filter(p => p.categoria === categoriaActiva)

  function agregarAlCarrito(producto) {
    setCarrito(prev => {
      const existe = prev.find(i => i.id === producto.id)
      if (existe) {
        return prev.map(i => i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i)
      }
      return [...prev, { ...producto, cantidad: 1 }]
    })
  }

  function quitarDelCarrito(id) {
    setCarrito(prev => {
      const existe = prev.find(i => i.id === id)
      if (existe.cantidad === 1) return prev.filter(i => i.id !== id)
      return prev.map(i => i.id === id ? { ...i, cantidad: i.cantidad - 1 } : i)
    })
  }

  const total = carrito.reduce((sum, i) => sum + i.precio * i.cantidad, 0)
  const totalItems = carrito.reduce((sum, i) => sum + i.cantidad, 0)

  async function handlePedido(e) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurante_id: restaurante.id,
        whatsapp: restaurante.whatsapp,
        cliente: form,
        items: carrito.map(i => ({
          id: i.id,
          nombre: i.nombre,
          precio: i.precio,
          cantidad: i.cantidad,
        })),
        total,
      }),
    })

    if (res.ok) {
  const data = await res.json()
  setPedidoEnviado(true)
  setCarrito([])
  if (data.whatsappUrl) {
    window.open(data.whatsappUrl, '_blank')
  }
}

    setLoading(false)
  }

  if (pedidoEnviado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-md">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
            style={{ backgroundColor: color + '20' }}>
            ✓
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">¡Pedido recibido!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Te contactaremos pronto al {form.telefono}
          </p>
          <button
            onClick={() => { setPedidoEnviado(false); setVista('menu') }}
            className="text-white px-6 py-3 rounded-xl font-medium transition"
            style={{ backgroundColor: color }}
          >
            Hacer otro pedido
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="text-white px-6 py-5 sticky top-0 z-10" style={{ backgroundColor: color }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {restaurante.logo_url ? (
              <img src={restaurante.logo_url} alt={restaurante.nombre} className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-white bg-opacity-20 flex items-center justify-center font-bold text-lg">
                {restaurante.nombre.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="font-bold text-lg leading-tight">{restaurante.nombre}</h1>
              {restaurante.direccion && (
                <p className="text-xs opacity-75">{restaurante.direccion}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setVista(vista === 'menu' ? 'carrito' : 'menu')}
            className="relative bg-white bg-opacity-20 px-4 py-2 rounded-xl text-sm font-medium"
          >
            Carrito
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-white rounded-full text-xs font-bold flex items-center justify-center"
                style={{ color }}>
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {vista === 'menu' ? (
          <>
            {/* Categorías */}
            {categorias.length > 1 && (
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {categorias.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoriaActiva(cat)}
                    className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition"
                    style={categoriaActiva === cat
                      ? { backgroundColor: color, color: 'white' }
                      : { backgroundColor: 'white', color: '#6b7280', border: '1px solid #e5e7eb' }
                    }
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            )}

            {/* Productos */}
            {productosFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productosFiltrados.map(producto => {
                  const enCarrito = carrito.find(i => i.id === producto.id)
                  return (
                    <div key={producto.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex">
                      {producto.imagen_url && (
                        <img
                          src={producto.imagen_url}
                          alt={producto.nombre}
                          className="w-28 h-28 object-cover flex-shrink-0"
                        />
                      )}
                      <div className="p-4 flex flex-col justify-between flex-1">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{producto.nombre}</p>
                          {producto.descripcion && (
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{producto.descripcion}</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-bold text-gray-900">${producto.precio.toFixed(2)}</span>
                          {enCarrito ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => quitarDelCarrito(producto.id)}
                                className="w-7 h-7 rounded-full border flex items-center justify-center text-gray-600 hover:bg-gray-50"
                              >
                                −
                              </button>
                              <span className="text-sm font-medium w-4 text-center">{enCarrito.cantidad}</span>
                              <button
                                onClick={() => agregarAlCarrito(producto)}
                                className="w-7 h-7 rounded-full text-white flex items-center justify-center"
                                style={{ backgroundColor: color }}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => agregarAlCarrito(producto)}
                              className="text-white px-3 py-1.5 rounded-xl text-xs font-medium"
                              style={{ backgroundColor: color }}
                            >
                              Agregar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <p>No hay productos disponibles aún.</p>
              </div>
            )}

            {/* Botón ir al carrito */}
            {carrito.length > 0 && (
              <div className="fixed bottom-6 left-0 right-0 px-4">
                <button
                  onClick={() => setVista('carrito')}
                  className="w-full max-w-4xl mx-auto flex items-center justify-between text-white px-6 py-4 rounded-2xl font-medium shadow-lg"
                  style={{ backgroundColor: color }}
                >
                  <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-lg text-sm">{totalItems}</span>
                  <span>Ver carrito</span>
                  <span>${total.toFixed(2)}</span>
                </button>
              </div>
            )}
          </>
        ) : (
          /* Carrito */
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => setVista('menu')}
              className="text-gray-500 text-sm mb-4 hover:text-gray-700"
            >
              ← Volver al menú
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Tu pedido</h2>

            {carrito.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>Tu carrito está vacío</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4">
                  {carrito.map((item, i) => (
                    <div key={item.id} className={"flex items-center justify-between px-4 py-3" + (i > 0 ? " border-t border-gray-50" : "")}>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => quitarDelCarrito(item.id)}
                            className="w-6 h-6 rounded-full border flex items-center justify-center text-gray-500 text-xs">−</button>
                          <span className="text-sm font-medium w-4 text-center">{item.cantidad}</span>
                          <button onClick={() => agregarAlCarrito(item)}
                            className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs"
                            style={{ backgroundColor: color }}>+</button>
                        </div>
                        <span className="text-sm text-gray-900">{item.nombre}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        ${(item.precio * item.cantidad).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-gray-900">${total.toFixed(2)}</span>
                  </div>
                </div>

                <form onSubmit={handlePedido} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
                  <h3 className="font-medium text-gray-900">Tus datos</h3>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Nombre *</label>
                    <input
                      value={form.nombre}
                      onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': color }}
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Teléfono *</label>
                    <input
                      value={form.telefono}
                      onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                      placeholder="+1 234 567 8900"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Dirección de entrega *</label>
                    <input
                      value={form.direccion}
                      onChange={e => setForm(p => ({ ...p, direccion: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                      placeholder="Calle, número, ciudad"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="text-white py-3 rounded-xl font-medium transition disabled:opacity-50"
                    style={{ backgroundColor: color }}
                  >
                    {loading ? 'Enviando pedido...' : 'Confirmar pedido'}
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}