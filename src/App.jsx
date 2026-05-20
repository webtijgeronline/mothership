import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import Login from './Login'
import GameCanvas from './GameCanvas'

const DEFAULT_ROOMS = [
  { id:'etsy1', label:'ETSY-01', sublabel:'Print on demand', active:false, revenue:3200 },
  { id:'etsy2', label:'ETSY-02', sublabel:'Niche store', active:false, revenue:1800 },
  { id:'tiktok1', label:'TIKTOK-01', sublabel:'Content gen', active:false, revenue:800 },
  { id:'tiktok2', label:'TIKTOK-02', sublabel:'Trend research', active:false, revenue:400 },
  { id:'intel', label:'INTEL', sublabel:'Market analysis', active:false, revenue:0 },
  { id:'finance', label:'FINANCE', sublabel:'Revenue tracking', active:false, revenue:0 },
]

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rooms, setRooms] = useState(DEFAULT_ROOMS)
  const [log, setLog] = useState('// systeem gereed — klik een kamer om te activeren')
  const [logFresh, setLogFresh] = useState(false)

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
      await supabase.from('agents').upsert(DEFAULT_ROOMS.map(r => ({ ...r, user_id: session.user.id })))
    }
  }

  async function saveAgent(id, active) {
    await supabase.from('agents').upsert({ id, user_id: session.user.id, active,
      label: DEFAULT_ROOMS.find(r=>r.id===id)?.label || id,
      sublabel: DEFAULT_ROOMS.find(r=>r.id===id)?.sublabel || '',
      revenue: DEFAULT_ROOMS.find(r=>r.id===id)?.revenue || 0
    })
  }

  const handleToggle = useCallback((id) => {
    setRooms(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, active: !r.active } : r)
      const room = updated.find(r => r.id === id)
      addLog(room.active ? `// ${room.label} — online` : `// ${room.label} — offline`)
      if (session) saveAgent(id, room.active)
      return updated
    })
  }, [session])

  function toggleAll(on) {
    setRooms(prev => {
      const updated = prev.map(r => ({ ...r, active: on }))
      updated.forEach(r => { if (session) saveAgent(r.id, on) })
      addLog(on ? '// alle agents online' : '// alle agents offline')
      return updated
    })
  }

  let logTimer
  function addLog(msg) {
    setLog(msg); setLogFresh(true)
    clearTimeout(logTimer)
    logTimer = setTimeout(() => setLogFresh(false), 2500)
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ color:'var(--green)', fontFamily:'var(--font-mono)', fontSize:'12px', letterSpacing:'3px' }}>// LADEN...</div>
    </div>
  )

  if (!session) return <Login />

  const activeCount = rooms.filter(r => r.active).length
  const totalRev = rooms.filter(r => r.active).reduce((s, r) => s + r.revenue, 0)

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'var(--bg)', padding:'12px', gap:'10px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontSize:'10px', color:'var(--muted)', letterSpacing:'2px' }}>// {session.user.email}</div>
        <button onClick={() => supabase.auth.signOut()} style={{ background:'none', border:'1px solid rgba(239,68,68,0.3)', color:'rgba(239,68,68,0.7)', fontSize:'9px', letterSpacing:'2px', padding:'4px 10px', borderRadius:'2px' }}>UITLOGGEN</button>
      </div>
      <div style={{ flex:1, minHeight:'calc(100vh - 180px)', borderRadius:'4px', overflow:'hidden', border:'1px solid var(--border)' }}>
        <GameCanvas rooms={rooms} onToggle={handleToggle} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
        <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'4px', padding:'10px 12px' }}>
          <div style={{ fontSize:'9px', color:'var(--muted)', letterSpacing:'2px', marginBottom:'4px' }}>AGENTS ONLINE</div>
          <div style={{ fontSize:'18px', fontFamily:'var(--font-display)', color:'var(--green)', fontWeight:700 }}>{activeCount}<span style={{ fontSize:'12px', color:'var(--muted)' }}>/{rooms.length}</span></div>
        </div>
        <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'4px', padding:'10px 12px' }}>
          <div style={{ fontSize:'9px', color:'var(--muted)', letterSpacing:'2px', marginBottom:'4px' }}>REVENUE MTD</div>
          <div style={{ fontSize:'18px', fontFamily:'var(--font-display)', color:'var(--green)', fontWeight:700 }}>€{totalRev.toLocaleString('nl-NL')}</div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
        <button onClick={() => toggleAll(true)} style={{ background:'transparent', border:'1px solid var(--green)', color:'var(--green)', fontSize:'10px', letterSpacing:'2px', padding:'10px', borderRadius:'2px' }}>[ ALLES AAN ]</button>
        <button onClick={() => toggleAll(false)} style={{ background:'transparent', border:'1px solid rgba(239,68,68,0.5)', color:'rgba(239,68,68,0.7)', fontSize:'10px', letterSpacing:'2px', padding:'10px', borderRadius:'2px' }}>[ ALLES UIT ]</button>
      </div>
      <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'4px', padding:'8px 12px' }}>
        <p style={{ fontSize:'10px', letterSpacing:'1px', color: logFresh ? 'var(--green)' : 'var(--muted)' }}>
          {log}{logFresh && <span style={{ animation:'blink 1s infinite', marginLeft:'4px' }}>_</span>}
        </p>
      </div>
    </div>
  )
}