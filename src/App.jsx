import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import Login from './Login'
import GameCanvas from './GameCanvas'

const DEFAULT_ROOMS = [
  { id:'etsy1', label:'ETSY-01', sub:'Print on demand', active:false, rev:3200 },
  { id:'etsy2', label:'ETSY-02', sub:'Niche store', active:false, rev:1800 },
  { id:'tiktok1', label:'TIKTOK-01', sub:'Content gen', active:false, rev:800 },
  { id:'tiktok2', label:'TIKTOK-02', sub:'Trend research', active:false, rev:400 },
  { id:'intel', label:'INTEL', sub:'Market analysis', active:false, rev:0 },
  { id:'finance', label:'FINANCE', sub:'Revenue tracking', active:false, rev:0 },
]

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rooms, setRooms] = useState(DEFAULT_ROOMS)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { if (session) loadAgents() }, [session])

  async function loadAgents() {
    const { data } = await supabase.from('agents').select('*').eq('user_id', session.user.id)
    if (data && data.length > 0) {
      setRooms(prev => prev.map(r => { const s = data.find(d => d.id === r.id); return s ? { ...r, active: s.active } : r }))
    } else {
      await supabase.from('agents').upsert(DEFAULT_ROOMS.map(r => ({ id: r.id, user_id: session.user.id, active: false, label: r.label, sublabel: r.sub, revenue: r.rev })))
    }
  }

  async function saveAgent(id, active) {
    const r = DEFAULT_ROOMS.find(x => x.id === id)
    await supabase.from('agents').upsert({ id, user_id: session.user.id, active, label: r?.label || id, sublabel: r?.sub || '', revenue: r?.rev || 0 })
  }

  const handleToggle = useCallback((id) => {
    setRooms(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, active: !r.active } : r)
      if (session) saveAgent(id, updated.find(r => r.id === id).active)
      return updated
    })
  }, [session])

  function toggleAll(on) {
    setRooms(prev => {
      const updated = prev.map(r => ({ ...r, active: on }))
      updated.forEach(r => { if (session) saveAgent(r.id, on) })
      return updated
    })
  }

  if (loading) return (
    <div style={{ width:'100vw', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#04080d' }}>
      <div style={{ color:'#3fffa2', fontFamily:'monospace', fontSize:'14px', letterSpacing:'3px' }}>// LADEN...</div>
    </div>
  )

  if (!session) return <Login />

  return (
    <div style={{ width:'100vw', height:'100vh', display:'flex', flexDirection:'column', background:'#04080d', overflow:'hidden' }}>
      <div style={{ flex:1, position:'relative', minHeight:0 }}>
        <GameCanvas rooms={rooms} onToggle={handleToggle} />
      </div>
      <div style={{ display:'flex', gap:'8px', padding:'8px 12px', background:'rgba(4,8,13,0.95)', borderTop:'1px solid rgba(63,255,162,0.2)' }}>
        <button onClick={() => supabase.auth.signOut()} style={{ background:'none', border:'1px solid rgba(239,68,68,0.4)', color:'rgba(239,68,68,0.7)', fontFamily:'monospace', fontSize:'10px', letterSpacing:'1px', padding:'4px 10px', cursor:'pointer' }}>UITLOGGEN</button>
        <button onClick={() => toggleAll(true)} style={{ background:'none', border:'1px solid rgba(63,255,162,0.4)', color:'#3fffa2', fontFamily:'monospace', fontSize:'10px', letterSpacing:'1px', padding:'4px 10px', cursor:'pointer' }}>ALLES AAN</button>
        <button onClick={() => toggleAll(false)} style={{ background:'none', border:'1px solid rgba(63,255,162,0.2)', color:'rgba(63,255,162,0.5)', fontFamily:'monospace', fontSize:'10px', letterSpacing:'1px', padding:'4px 10px', cursor:'pointer' }}>ALLES UIT</button>
        <div style={{ marginLeft:'auto', color:'rgba(63,255,162,0.5)', fontFamily:'monospace', fontSize:'10px', letterSpacing:'1px', display:'flex', alignItems:'center' }}>{session.user.email}</div>
      </div>
    </div>
  )
}
