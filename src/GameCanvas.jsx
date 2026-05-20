import { useEffect, useRef } from 'react'

const ROOM_DEFS = [
  { id:'etsy1', label:'ETSY-01', sublabel:'Print on demand', color:'#0a1f12', border:'#3fffa2', agColor:'#3fffa2', revenue:3200, col:0, row:0 },
  { id:'etsy2', label:'ETSY-02', sublabel:'Niche store', color:'#0a1520', border:'#38b6ff', agColor:'#38b6ff', revenue:1800, col:1, row:0 },
  { id:'tiktok1', label:'TIKTOK-01', sublabel:'Content gen', color:'#1a0a20', border:'#a855f7', agColor:'#a855f7', revenue:800, col:0, row:1 },
  { id:'tiktok2', label:'TIKTOK-02', sublabel:'Trend research', color:'#1f1200', border:'#f59e0b', agColor:'#f59e0b', revenue:400, col:1, row:1 },
  { id:'intel', label:'INTEL', sublabel:'Market analysis', color:'#001a1f', border:'#14b8a6', agColor:'#14b8a6', revenue:0, col:0, row:2 },
  { id:'finance', label:'FINANCE', sublabel:'Revenue tracking', color:'#1f0808', border:'#ef4444', agColor:'#ef4444', revenue:0, col:1, row:2 },
]

const PAD = 10, GAP = 8, HDR = 70

function getRoomRect(r, W, H) {
  const cols = 2, rows = 3
  const gW = W - PAD * 2, gH = H - PAD * 2 - HDR
  const rw = (gW - GAP * (cols - 1)) / cols
  const rh = (gH - GAP * (rows - 1)) / rows
  return { x: PAD + r.col * (rw + GAP), y: PAD + HDR + r.row * (rh + GAP), w: rw, h: rh }
}

function hexToRgb(h) {
  return parseInt(h.slice(1,3),16)+','+parseInt(h.slice(3,5),16)+','+parseInt(h.slice(5,7),16)
}

export default function GameCanvas({ rooms, onToggle }) {
  const canvasRef = useRef(null)
  const agents = useRef({})
  const animRef = useRef(null)
  const roomsRef = useRef(rooms)
  roomsRef.current = rooms

  useEffect(() => {
    ROOM_DEFS.forEach(r => {
      if (!agents.current[r.id]) agents.current[r.id] = { x:0, y:0, dx:1.4, dy:0.9, trail:[] }
    })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    function draw() {
      const W = canvas.width / (window.devicePixelRatio || 1)
      const H = canvas.height / (window.devicePixelRatio || 1)

      ctx.fillStyle = '#060a0f'
      ctx.fillRect(0, 0, W, H)

      ctx.strokeStyle = 'rgba(63,255,162,0.04)'
      ctx.lineWidth = 0.5
      for (let x = 0; x < W; x += 20) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke() }
      for (let y = 0; y < H; y += 20) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke() }

      ROOM_DEFS.forEach(rd => {
        const room = roomsRef.current.find(r => r.id === rd.id) || rd
        const rect = getRoomRect(rd, W, H)
        const { x, y, w, h } = rect
        const rgb = hexToRgb(rd.border)
        const active = room.active

        ctx.fillStyle = active ? rd.color : '#080d10'
        ctx.fillRect(x, y, w, h)
        ctx.strokeStyle = active ? rd.border : 'rgba(30,60,40,0.4)'
        ctx.lineWidth = active ? 1.5 : 0.8
        ctx.strokeRect(x, y, w, h)

        if (active) {
          ctx.strokeStyle = `rgba(${rgb},0.2)`
          ctx.lineWidth = 0.5
          ctx.strokeRect(x+4, y+4, w-8, h-8)
          [[x,y],[x+w,y],[x,y+h],[x+w,y+h]].forEach(([cx,cy]) => {
            const sx = cx===x?1:-1, sy = cy===y?1:-1
            ctx.strokeStyle = rd.border; ctx.lineWidth = 1.5
            ctx.beginPath(); ctx.moveTo(cx+sx*12,cy); ctx.lineTo(cx,cy); ctx.lineTo(cx,cy+sy*12); ctx.stroke()
          })
        }

        ctx.fillStyle = active ? rd.border : 'rgba(40,80,50,0.5)'
        ctx.font = 'bold 10px Orbitron,monospace'
        ctx.textAlign = 'left'
        ctx.fillText(rd.label, x+10, y+18)
        ctx.fillStyle = active ? `rgba(${rgb},0.6)` : 'rgba(40,80,50,0.4)'
        ctx.font = '9px "Share Tech Mono",monospace'
        ctx.fillText(rd.sublabel.toUpperCase(), x+10, y+30)

        if (active) {
          ctx.fillStyle = `rgba(${rgb},0.8)`
          ctx.font = 'bold 11px Orbitron,monospace'
          ctx.textAlign = 'right'
          ctx.fillText('\u20ac'+(room.revenue||0).toLocaleString('nl-NL'), x+w-10, y+18)
          ctx.textAlign = 'left'
          const barY = y+h-14
          ctx.fillStyle = `rgba(${rgb},0.15)`; ctx.fillRect(x+10, barY, w-20, 4)
          ctx.fillStyle = rd.border; ctx.fillRect(x+10, barY, (Date.now()/30)%(w-20), 4)

          const ag = agents.current[rd.id]
          if (ag.x===0 && ag.y===0) { ag.x=x+20; ag.y=y+50 }
          ag.trail.push({x:ag.x,y:ag.y})
          if (ag.trail.length > 12) ag.trail.shift()
          ag.trail.forEach((pt,i) => {
            ctx.fillStyle = `rgba(${rgb},${(i/ag.trail.length)*0.3})`
            const s = (i/ag.trail.length)*4; ctx.fillRect(pt.x-s/2,pt.y-s/2,s,s)
          })
          ctx.fillStyle = `rgba(${rgb},0.2)`; ctx.fillRect(ag.x-7,ag.y-7,14,14)
          ctx.fillStyle = rd.border; ctx.fillRect(ag.x-4,ag.y-4,8,8)
          ctx.fillStyle = '#fff'; ctx.fillRect(ag.x-1,ag.y-1,3,3)
          ag.x += ag.dx; ag.y += ag.dy
          if (ag.x > x+w-18 || ag.x < x+12) ag.dx *= -1
          if (ag.y > y+h-22 || ag.y < y+42) ag.dy *= -1
        }
      })

      ctx.fillStyle = 'rgba(11,17,24,0.95)'; ctx.fillRect(0,0,W,HDR)
      ctx.strokeStyle = 'rgba(63,255,162,0.2)'; ctx.lineWidth=1; ctx.strokeRect(PAD,PAD,W-PAD*2,HDR-PAD)
      const activeRooms = roomsRef.current.filter(r=>r.active)
      const totalRev = activeRooms.reduce((s,r)=>s+(r.revenue||0),0)
      ctx.fillStyle='#3fffa2'; ctx.font='bold 14px Orbitron,monospace'; ctx.textAlign='left'
      ctx.fillText('MOEDERSCHIP HQ', PAD+12, PAD+22)
      ctx.fillStyle='rgba(63,255,162,0.5)'; ctx.font='9px "Share Tech Mono",monospace'
      ctx.fillText('AI AGENT COMMAND CENTER', PAD+12, PAD+36)
      ctx.textAlign='right'; ctx.fillStyle='#3fffa2'; ctx.font='bold 13px Orbitron,monospace'
      ctx.fillText('\u20ac'+totalRev.toLocaleString('nl-NL'), W-PAD-12, PAD+24)
      ctx.fillStyle='rgba(63,255,162,0.5)'; ctx.font='9px "Share Tech Mono",monospace'
      ctx.fillText(activeRooms.length+'/6 AGENTS ONLINE', W-PAD-12, PAD+38)
      ctx.textAlign='left'
      animRef.current = requestAnimationFrame(draw)
    }
    draw()

    function handleClick(e) {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX-rect.left, my = e.clientY-rect.top
      ROOM_DEFS.forEach(rd => {
        const r = getRoomRect(rd, rect.width, rect.height)
        if (mx>=r.x && mx<=r.x+r.w && my>=r.y && my<=r.y+r.h) onToggle(rd.id)
      })
    }
    canvas.addEventListener('click', handleClick)
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize',resize); canvas.removeEventListener('click',handleClick) }
  }, [onToggle])

  return <canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',cursor:'crosshair'}} />
}
