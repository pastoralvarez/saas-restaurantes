'use client'
import { useState } from 'react'

export default function TiendaCliente({ restaurante, productos }) {
  const [carrito, setCarrito] = useState([])
  const [vista, setVista] = useState('menu')
  const [categoriaActiva, setCategoriaActiva] = useState('todas')
  const [form, setForm] = useState({ nombre: '', telefono: '', direccion: '' })
  const [pedidoEnviado, setPedidoEnviado] = useState(false)
  const [loading, setLoading] = useState(false)

  const color = restaurante.color_principal || '#e63946'

  const categorias = ['todas', ...new Set(productos.map(p => p.categoria).filter(Boolean))]
  const productosFiltrados = categoriaActiva === 'todas'
    ? productos
    : productos.filter(p => p.categoria === categoriaActiva)

  const categoriasPorNombre = categoriaActiva === 'todas'
    ? [...new Set(productos.map(p => p.categoria).filter(Boolean))]
    : [categoriaActiva]

  function agregarAlCarrito(producto) {
    setCarrito(prev => {
      const existe = prev.find(i => i.id === producto.id)
      if (existe) return prev.map(i => i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i)
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

  function cantidadEnCarrito(id) {
    return carrito.find(i => i.id === id)?.cantidad || 0
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
        items: carrito.map(i => ({ id: i.id, nombre: i.nombre, precio: i.precio, cantidad: i.cantidad })),
        total,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      setPedidoEnviado(true)
      setCarrito([])
      if (data.whatsappUrl) window.open(data.whatsappUrl, '_blank')
    }
    setLoading(false)
  }

  if (pedidoEnviado) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7f7f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '24px', padding: '40px 32px', textAlign: 'center', maxWidth: '360px', width: '100%' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px' }}>
            ✓
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>¡Pedido recibido!</h2>
          <p style={{ fontSize: '14px', color: '#888', marginBottom: '24px' }}>
            Pronto te contactaremos al {form.telefono}
          </p>
          <button
            onClick={() => { setPedidoEnviado(false); setVista('menu') }}
            style={{ background: color, color: 'white', border: 'none', borderRadius: '14px', padding: '14px 32px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', width: '100%' }}
          >
            Hacer otro pedido
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f5', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* HEADER HERO */}
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
        {restaurante.imagen_url ? (
          <img src={restaurante.imagen_url} alt={restaurante.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${color}dd, ${color})` }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 20px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '20px', marginBottom: '8px', border: '2px solid rgba(255,255,255,0.3)', overflow: 'hidden' }}>
            {restaurante.logo_url
              ? <img src={restaurante.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : restaurante.nombre.charAt(0)
            }
          </div>
          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '700', margin: '0 0 4px', letterSpacing: '-0.3px' }}>{restaurante.nombre}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.75)', fontSize: '13px' }}>
            <span>Abierto ahora</span>
            <span style={{ width: '3px', height: '3px', background: 'rgba(255,255,255,0.5)', borderRadius: '50%', display: 'inline-block' }} />
            <span>Pedidos en línea</span>
            {restaurante.direccion && <>
              <span style={{ width: '3px', height: '3px', background: 'rgba(255,255,255,0.5)', borderRadius: '50%', display: 'inline-block' }} />
              <span>{restaurante.direccion}</span>
            </>}
          </div>
        </div>
      </div>

      {/* CATEGORÍAS */}
      {categorias.length > 1 && (
        <div style={{ background: 'white', borderBottom: '1px solid #f0f0f0', padding: '12px 16px', display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              style={{
                padding: '7px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
                whiteSpace: 'nowrap', cursor: 'pointer', border: `1.5px solid ${categoriaActiva === cat ? color : '#e8e8e8'}`,
                background: categoriaActiva === cat ? color : 'white',
                color: categoriaActiva === cat ? 'white' : '#555',
                transition: 'all 0.15s'
              }}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* PRODUCTOS */}
      <div style={{ padding: '8px 0 100px' }}>
        {vista === 'menu' ? (
          categoriasPorNombre.length > 0 ? categoriasPorNombre.map(cat => {
            const prods = productosFiltrados.filter(p => p.categoria === cat)
            if (!prods.length) return null
            return (
              <div key={cat}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', padding: '16px 20px 8px', letterSpacing: '-0.2px' }}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </h2>
                {prods.map(producto => {
                  const cant = cantidadEnCarrito(producto.id)
                  return (
                    <div key={producto.id} style={{ display: 'flex', gap: '12px', margin: '0 16px 10px', background: 'white', borderRadius: '16px', padding: '14px', border: '1px solid #f0f0f0' }}>
                      {producto.imagen_url ? (
                        <img src={producto.imagen_url} alt={producto.nombre} style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: color + '15', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                          🍽️
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{producto.nombre}</p>
                        {producto.descripcion && (
                          <p style={{ fontSize: '13px', color: '#888', margin: '0 0 10px', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{producto.descripcion}</p>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>${Number(producto.precio).toFixed(2)}</span>
                          {cant > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button onClick={() => quitarDelCarrito(producto.id)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1.5px solid #e0e0e0', background: 'white', color: '#555', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '500' }}>−</button>
                              <span style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a', minWidth: '18px', textAlign: 'center' }}>{cant}</span>
                              <button onClick={() => agregarAlCarrito(producto)} style={{ width: '28px', height: '28px', borderRadius: '8px', background: color, border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '500' }}>+</button>
                            </div>
                          ) : (
                            <button onClick={() => agregarAlCarrito(producto)} style={{ width: '32px', height: '32px', borderRadius: '10px', background: color, border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '300', lineHeight: 1 }}>+</button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          }) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#aaa' }}>
              <p style={{ fontSize: '15px' }}>No hay productos disponibles.</p>
            </div>
          )
        ) : null}

        {/* CARRITO */}
        {vista === 'carrito' && (
          <div style={{ maxWidth: '480px', margin: '0 auto', padding: '16px' }}>
            <button onClick={() => setVista('menu')} style={{ background: 'none', border: 'none', color: '#555', fontSize: '14px', cursor: 'pointer', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ← Volver al menú
            </button>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a', marginBottom: '16px' }}>Tu pedido</h2>

            {carrito.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
                <p>Tu carrito está vacío</p>
              </div>
            ) : (
              <>
                <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', marginBottom: '12px', border: '1px solid #f0f0f0' }}>
                  {carrito.map((item, i) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: i < carrito.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button onClick={() => quitarDelCarrito(item.id)} style={{ width: '26px', height: '26px', borderRadius: '7px', border: '1.5px solid #e0e0e0', background: 'white', color: '#555', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                          <span style={{ fontSize: '14px', fontWeight: '700', minWidth: '18px', textAlign: 'center' }}>{item.cantidad}</span>
                          <button onClick={() => agregarAlCarrito(item)} style={{ width: '26px', height: '26px', borderRadius: '7px', background: color, border: 'none', color: 'white', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                        </div>
                        <span style={{ fontSize: '14px', color: '#1a1a1a', fontWeight: '500' }}>{item.nombre}</span>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>${(item.precio * item.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderTop: '2px solid #f5f5f5', background: '#fafafa' }}>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>Total</span>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>${total.toFixed(2)}</span>
                  </div>
                </div>

                <form onSubmit={handlePedido} style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>Tus datos</p>
                  {[
                    { key: 'nombre', label: 'Nombre completo', placeholder: 'Juan García', type: 'text' },
                    { key: 'telefono', label: 'Teléfono', placeholder: '+1 234 567 8900', type: 'tel' },
                    { key: 'direccion', label: 'Dirección de entrega', placeholder: 'Calle, número, ciudad', type: 'text' },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '6px' }}>{field.label}</label>
                      <input
                        type={field.type}
                        value={form[field.key]}
                        onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        required
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #e8e8e8', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
                        onFocus={e => e.target.style.borderColor = color}
                        onBlur={e => e.target.style.borderColor = '#e8e8e8'}
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ background: loading ? '#ccc' : color, color: 'white', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px' }}
                  >
                    {loading ? 'Enviando pedido...' : `Confirmar pedido · $${total.toFixed(2)}`}
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>

      {/* BARRA CARRITO FLOTANTE */}
      {carrito.length > 0 && vista === 'menu' && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px 20px', background: 'white', borderTop: '1px solid #f0f0f0' }}>
          <button
            onClick={() => setVista('carrito')}
            style={{ width: '100%', maxWidth: '480px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: '16px', padding: '16px 20px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
          >
            <span style={{ background: color, borderRadius: '8px', padding: '2px 10px', fontSize: '14px', fontWeight: '700' }}>{totalItems}</span>
            <span>Ver carrito</span>
            <span>${total.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  )
}
