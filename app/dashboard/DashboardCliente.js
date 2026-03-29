'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

const ESTADOS = ['pendiente', 'en_proceso', 'entregado', 'cancelado']

const ESTADO_CONFIG = {
  pendiente:   { label: 'Pendiente',   bg: '#fff8e6', color: '#b45309', dot: '#f59e0b' },
  en_proceso:  { label: 'En proceso',  bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
  entregado:   { label: 'Entregado',   bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
  cancelado:   { label: 'Cancelado',   bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
}

export default function DashboardCliente({ restaurante, pedidosIniciales, totalClientes, totalProductos }) {
  const supabase = createClient()
  const [pedidos, setPedidos] = useState(pedidosIniciales)
  const [pedidoActivo, setPedidoActivo] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [nuevoPedido, setNuevoPedido] = useState(false)

  const color = restaurante.color_principal || '#e63946'

  useEffect(() => {
    const channel = supabase
      .channel('pedidos-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'pedidos',
        filter: `restaurante_id=eq.${restaurante.id}`,
      }, payload => {
        setPedidos(prev => [payload.new, ...prev])
        setNuevoPedido(true)
        setTimeout(() => setNuevoPedido(false), 3000)
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'pedidos',
        filter: `restaurante_id=eq.${restaurante.id}`,
      }, payload => {
        setPedidos(prev => prev.map(p => p.id === payload.new.id ? payload.new : p))
        if (pedidoActivo?.id === payload.new.id) setPedidoActivo(payload.new)
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [restaurante.id])

  async function cambiarEstado(pedidoId, nuevoEstado) {
    await supabase
      .from('pedidos')
      .update({ estado: nuevoEstado })
      .eq('id', pedidoId)
  }

  const pedidosFiltrados = filtroEstado === 'todos'
    ? pedidos
    : pedidos.filter(p => p.estado === filtroEstado)

  const totalVentas = pedidos.reduce((sum, p) => sum + Number(p.total), 0)
  const pedidosHoy = pedidos.filter(p => new Date(p.created_at).toDateString() === new Date().toDateString())

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f5', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #f0f0f0', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px' }}>
            {restaurante.nombre.charAt(0)}
          </div>
          <span style={{ fontWeight: '700', color: '#1a1a1a', fontSize: '16px' }}>{restaurante.nombre}</span>
          {nuevoPedido && (
            <span style={{ background: '#f0fdf4', color: '#166534', fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', animation: 'pulse 1s infinite' }}>
              ¡Nuevo pedido!
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard/menu" style={{ fontSize: '14px', color: '#555', textDecoration: 'none', fontWeight: '500' }}>Menú</Link>
          <Link href="/dashboard/configuracion" style={{ fontSize: '14px', color: '#555', textDecoration: 'none', fontWeight: '500' }}>Configuración</Link>
          <Link href="/api/auth/logout" style={{ fontSize: '14px', color: '#aaa', textDecoration: 'none' }}>Salir</Link>
        </div>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Pedidos hoy', value: pedidosHoy.length, color: color },
            { label: 'Pendientes', value: pedidos.filter(p => p.estado === 'pendiente').length, color: '#f59e0b' },
            { label: 'Ventas totales', value: '$' + totalVentas.toFixed(2), color: '#22c55e' },
            { label: 'Clientes', value: totalClientes, color: '#3b82f6' },
            { label: 'Productos', value: totalProductos, color: '#8b5cf6' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #f0f0f0' }}>
              <p style={{ fontSize: '12px', color: '#aaa', margin: '0 0 6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: stat.color, margin: 0 }}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: pedidoActivo ? '1fr 380px' : '1fr', gap: '16px' }}>

          {/* Lista pedidos */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>Pedidos</h2>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['todos', ...ESTADOS].map(estado => (
                  <button
                    key={estado}
                    onClick={() => setFiltroEstado(estado)}
                    style={{
                      padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                      cursor: 'pointer', border: `1.5px solid ${filtroEstado === estado ? color : '#e8e8e8'}`,
                      background: filtroEstado === estado ? color : 'white',
                      color: filtroEstado === estado ? 'white' : '#555'
                    }}
                  >
                    {estado === 'todos' ? 'Todos' : ESTADO_CONFIG[estado].label}
                  </button>
                ))}
              </div>
            </div>

            {pedidosFiltrados.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '20px', padding: '48px', textAlign: 'center', border: '1px solid #f0f0f0' }}>
                <p style={{ color: '#aaa', fontSize: '15px' }}>No hay pedidos aún.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pedidosFiltrados.map(pedido => {
                  const cfg = ESTADO_CONFIG[pedido.estado] || ESTADO_CONFIG.pendiente
                  const activo = pedidoActivo?.id === pedido.id
                  return (
                    <div
                      key={pedido.id}
                      onClick={() => setPedidoActivo(activo ? null : pedido)}
                      style={{ background: 'white', borderRadius: '16px', padding: '16px', border: `1.5px solid ${activo ? color : '#f0f0f0'}`, cursor: 'pointer', transition: 'all 0.15s' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a1a', fontFamily: 'monospace' }}>#{pedido.id.slice(0, 8)}</span>
                          <span style={{ background: cfg.bg, color: cfg.color, fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
                            {cfg.label}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>${Number(pedido.total).toFixed(2)}</span>
                          <span style={{ fontSize: '12px', color: '#aaa' }}>
                            {new Date(pedido.created_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
                          {pedido.direccion_entrega || 'Sin dirección'}
                        </p>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {ESTADOS.filter(e => e !== pedido.estado).map(e => (
                            <button
                              key={e}
                              onClick={ev => { ev.stopPropagation(); cambiarEstado(pedido.id, e) }}
                              style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600', border: `1px solid ${ESTADO_CONFIG[e].dot}`, background: ESTADO_CONFIG[e].bg, color: ESTADO_CONFIG[e].color, cursor: 'pointer' }}
                            >
                              {ESTADO_CONFIG[e].label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Panel detalle pedido */}
          {pedidoActivo && (
            <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #f0f0f0', height: 'fit-content', position: 'sticky', top: '80px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>
                  Pedido #{pedidoActivo.id.slice(0, 8)}
                </h3>
                <button onClick={() => setPedidoActivo(null)} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#aaa', cursor: 'pointer' }}>×</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#f7f7f5', borderRadius: '12px', padding: '14px' }}>
                  <p style={{ fontSize: '12px', color: '#aaa', fontWeight: '600', margin: '0 0 8px', textTransform: 'uppercase' }}>Productos</p>
                  {(pedidoActivo.items || []).map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: i < pedidoActivo.items.length - 1 ? '1px solid #efefef' : 'none' }}>
                      <span style={{ fontSize: '14px', color: '#333' }}>{item.cantidad}x {item.nombre}</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>${(item.precio * item.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '2px solid #e8e8e8' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700' }}>Total</span>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: color }}>${Number(pedidoActivo.total).toFixed(2)}</span>
                  </div>
                </div>

                {pedidoActivo.direccion_entrega && (
                  <div style={{ background: '#f7f7f5', borderRadius: '12px', padding: '14px' }}>
                    <p style={{ fontSize: '12px', color: '#aaa', fontWeight: '600', margin: '0 0 4px', textTransform: 'uppercase' }}>Entrega</p>
                    <p style={{ fontSize: '14px', color: '#333', margin: 0 }}>{pedidoActivo.direccion_entrega}</p>
                  </div>
                )}

                {pedidoActivo.notas && (
                  <div style={{ background: '#f7f7f5', borderRadius: '12px', padding: '14px' }}>
                    <p style={{ fontSize: '12px', color: '#aaa', fontWeight: '600', margin: '0 0 4px', textTransform: 'uppercase' }}>Notas</p>
                    <p style={{ fontSize: '14px', color: '#333', margin: 0, whiteSpace: 'pre-wrap' }}>{pedidoActivo.notas}</p>
                  </div>
                )}

                <div>
                  <p style={{ fontSize: '12px', color: '#aaa', fontWeight: '600', margin: '0 0 8px', textTransform: 'uppercase' }}>Cambiar estado</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {ESTADOS.map(e => {
                      const cfg = ESTADO_CONFIG[e]
                      const activo = pedidoActivo.estado === e
                      return (
                        <button
                          key={e}
                          onClick={() => cambiarEstado(pedidoActivo.id, e)}
                          style={{
                            padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
                            cursor: activo ? 'default' : 'pointer',
                            border: `1.5px solid ${activo ? cfg.dot : '#e8e8e8'}`,
                            background: activo ? cfg.bg : 'white',
                            color: activo ? cfg.color : '#555',
                            textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px'
                          }}
                        >
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: activo ? cfg.dot : '#ddd', display: 'inline-block' }} />
                          {cfg.label}
                          {activo && <span style={{ marginLeft: 'auto', fontSize: '11px' }}>Estado actual</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}