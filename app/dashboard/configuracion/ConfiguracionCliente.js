'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

const METODOS_PRESET = ['Efectivo', 'Tarjeta']

export default function ConfiguracionCliente({ restaurante }) {
  const supabase = createClient()
  const [color, setColor] = useState(restaurante.color_principal || '#e63946')
  const [imagenUrl, setImagenUrl] = useState(restaurante.imagen_url || '')
  const [metodos, setMetodos] = useState(restaurante.metodos_pago || [])
  const [nuevoMetodo, setNuevoMetodo] = useState({ nombre: '', datos: '', tipo: 'personalizado' })
  const [guardando, setGuardando] = useState(false)
  const [exito, setExito] = useState(false)

  function agregarMetodoPreset(nombre) {
    if (metodos.find(m => m.nombre === nombre)) return
    setMetodos(prev => [...prev, { nombre, tipo: 'simple', activo: true }])
  }

  function agregarMetodoPersonalizado() {
    if (!nuevoMetodo.nombre.trim()) return
    setMetodos(prev => [...prev, { ...nuevoMetodo, activo: true, id: Date.now().toString() }])
    setNuevoMetodo({ nombre: '', datos: '', tipo: 'personalizado' })
  }

  function eliminarMetodo(index) {
    setMetodos(prev => prev.filter((_, i) => i !== index))
  }

  function toggleMetodo(index) {
    setMetodos(prev => prev.map((m, i) => i === index ? { ...m, activo: !m.activo } : m))
  }

  async function guardar() {
    setGuardando(true)
    setExito(false)
    const { error } = await supabase
      .from('restaurantes')
      .update({
        color_principal: color,
        imagen_url: imagenUrl,
        metodos_pago: metodos,
      })
      .eq('id', restaurante.id)

    if (!error) setExito(true)
    setGuardando(false)
  }

  const c = color

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f5', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <header style={{ background: 'white', borderBottom: '1px solid #f0f0f0', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px' }}>
            {restaurante.nombre.charAt(0)}
          </div>
          <span style={{ fontWeight: '700', color: '#1a1a1a' }}>{restaurante.nombre}</span>
          <span style={{ color: '#aaa', fontSize: '14px' }}>/ Configuración</span>
        </div>
        <Link href="/dashboard" style={{ fontSize: '14px', color: '#888', textDecoration: 'none' }}>← Panel</Link>
      </header>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Apariencia */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #f0f0f0' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', marginBottom: '20px' }}>Apariencia</h2>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '8px' }}>Color principal</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                style={{ width: '48px', height: '48px', borderRadius: '12px', border: '1.5px solid #e8e8e8', cursor: 'pointer', padding: '2px' }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', margin: '0 0 2px' }}>{color}</p>
                <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>Se aplica en botones, categorías y acentos del sitio</p>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: color }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '8px' }}>Imagen de portada (URL)</label>
            <input
              type="url"
              value={imagenUrl}
              onChange={e => setImagenUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #e8e8e8', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            {imagenUrl && (
              <img src={imagenUrl} alt="portada" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '12px', marginTop: '10px' }} />
            )}
            <p style={{ fontSize: '12px', color: '#aaa', marginTop: '6px' }}>Pega una URL de imagen de Unsplash, Google u otra fuente</p>
          </div>
        </div>

        {/* Métodos de pago */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #f0f0f0' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', marginBottom: '6px' }}>Métodos de pago</h2>
          <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '20px' }}>Activa los que aceptas. Los métodos con datos muestran información al cliente para transferir.</p>

          {/* Presets */}
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '10px' }}>Métodos simples</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {METODOS_PRESET.map(nombre => {
                const yaAgregado = metodos.find(m => m.nombre === nombre)
                return (
                  <button
                    key={nombre}
                    onClick={() => yaAgregado ? null : agregarMetodoPreset(nombre)}
                    style={{
                      padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
                      border: `1.5px solid ${yaAgregado ? color : '#e8e8e8'}`,
                      background: yaAgregado ? color + '15' : 'white',
                      color: yaAgregado ? color : '#555',
                      cursor: yaAgregado ? 'default' : 'pointer'
                    }}
                  >
                    {yaAgregado ? '✓ ' : '+ '}{nombre}
                  </button>
                )
              })}
            </div>
            {METODOS_PRESET.map(nombre => nombre === 'Tarjeta' && metodos.find(m => m.nombre === 'Tarjeta') ? (
              <p key="tarjeta-aviso" style={{ fontSize: '12px', color: '#aaa', marginTop: '6px' }}>
                Tarjeta: el cliente paga en el establecimiento al recibir el pedido.
              </p>
            ) : null)}
          </div>

          {/* Métodos personalizados existentes */}
          {metodos.length > 0 && (
            <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {metodos.map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f7f7f5', borderRadius: '12px', padding: '12px 14px' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', margin: '0 0 2px' }}>{m.nombre}</p>
                    {m.datos && <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{m.datos}</p>}
                    {m.tipo === 'simple' && <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>Método simple</p>}
                  </div>
                  <button
                    onClick={() => toggleMetodo(i)}
                    style={{
  padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
  border: 'none', cursor: 'pointer',
  background: m.activo ? '#e8faf0' : '#f0f0f0',
  color: m.activo ? '#1a7a4a' : '#aaa'
}}
                  >
                    {m.activo ? 'Activo' : 'Inactivo'}
                  </button>
                  <button
                    onClick={() => eliminarMetodo(i)}
                    style={{ background: 'none', border: 'none', color: '#e63946', fontSize: '16px', cursor: 'pointer', padding: '4px' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Agregar método personalizado */}
          <div style={{ border: '1.5px dashed #e8e8e8', borderRadius: '16px', padding: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '12px' }}>Agregar método con datos bancarios</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                value={nuevoMetodo.nombre}
                onChange={e => setNuevoMetodo(p => ({ ...p, nombre: e.target.value }))}
                placeholder="Ej: Pago móvil, Davivienda, Bancolombia"
                style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e8e8e8', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
              />
              <textarea
                value={nuevoMetodo.datos}
                onChange={e => setNuevoMetodo(p => ({ ...p, datos: e.target.value }))}
                placeholder="Ej: Banco: Bancolombia&#10;Titular: Pizza Roma&#10;Cuenta: 123-456789-00&#10;Cédula: 12345678"
                rows={4}
                style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e8e8e8', fontSize: '14px', outline: 'none', fontFamily: 'inherit', resize: 'none' }}
              />
              <button
                onClick={agregarMetodoPersonalizado}
                disabled={!nuevoMetodo.nombre.trim()}
                style={{ background: nuevoMetodo.nombre.trim() ? color : '#e8e8e8', color: nuevoMetodo.nombre.trim() ? 'white' : '#aaa', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: nuevoMetodo.nombre.trim() ? 'pointer' : 'not-allowed' }}
              >
                + Agregar método
              </button>
            </div>
          </div>
        </div>

        {/* Botón guardar */}
        {exito && (
          <div style={{ background: '#e8faf0', borderRadius: '12px', padding: '12px 16px', color: '#1a7a4a', fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>
            ✓ Cambios guardados correctamente
          </div>
        )}
        <button
          onClick={guardar}
          disabled={guardando}
          style={{ background: guardando ? '#ccc' : color, color: 'white', border: 'none', borderRadius: '16px', padding: '16px', fontSize: '16px', fontWeight: '700', cursor: guardando ? 'not-allowed' : 'pointer' }}
        >
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>

      </div>
    </div>
  )
}