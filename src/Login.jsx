import { useState } from 'react'
import { supabase } from './supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError(''); setMsg('')
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMsg('Check je email voor bevestiging.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', background:'var(--bg)', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(63,255,162,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(63,255,162,0.03) 1px, transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' }} />
      <div style={{ textAlign:'center', marginBottom:'40px' }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'28px', fontWeight:900, color:'var(--green)', letterSpacing:'4px', textTransform:'uppercase', textShadow:'0 0 20px rgba(63,255,162,0.4)' }}>MOEDERSCHIP HQ</h1>
        <div style={{ fontSize:'10px', color:'var(--muted)', letterSpacing:'3px', marginTop:'8px' }}>AI AGENT COMMAND CENTER</div>
      </div>
      <div style={{ width:'100%', maxWidth:'380px', background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'4px', padding:'32px', position:'relative' }}>
        <div style={{ fontSize:'10px', color:'var(--green)', letterSpacing:'2px', marginBottom:'24px' }}>{mode === 'login' ? '> IDENTIFICATIE VEREIST' : '> NIEUW ACCOUNT'}</div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:'16px' }}>
            <label style={{ fontSize:'10px', color:'var(--muted)', letterSpacing:'2px', display:'block', marginBottom:'6px' }}>EMAIL</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'2px', padding:'10px 12px', color:'var(--text)', fontSize:'13px', outline:'none' }} />
          </div>
          <div style={{ marginBottom:'24px' }}>
            <label style={{ fontSize:'10px', color:'var(--muted)', letterSpacing:'2px', display:'block', marginBottom:'6px' }}>WACHTWOORD</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'2px', padding:'10px 12px', color:'var(--text)', fontSize:'13px', outline:'none' }} />
          </div>
          {error && <div style={{ fontSize:'11px', color:'var(--red)', marginBottom:'16px' }}>// ERROR: {error}</div>}
          {msg && <div style={{ fontSize:'11px', color:'var(--green)', marginBottom:'16px' }}>// {msg}</div>}
          <button type="submit" disabled={loading} style={{ width:'100%', background:'darkblue', border:'1px solid var(--green)', color:'var(--green)', padding:'12px', fontSize:'12px', letterSpacing:'3px', textTransform:'uppercase', borderRadius:'2px', cursor:'pointer' }}>{loading ? '// LADEN...' : mode === 'login' ? '[ TOEGAAN VERKRIJGEN ]' : '[ ACCOUNT AAMMAKEN ]'}</button>
        </form>
        <div style={{ marginTop:'20px', textAlign:'center' }}>
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMsg('') }} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:'10px', letterSpacing:'1px', cursor:'pointer' }}>{mode === 'login' ? '> nog geen account? aanmelden' : '> al een account? inloggen'}</button>
        </div>
      </div>
    </div>
  )
}
