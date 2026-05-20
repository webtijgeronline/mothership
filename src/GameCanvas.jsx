import { useEffect, useRef } from 'react'

const ROOMS = [
  { id:'etsy1', label:'ETSY-01', sublabel:'Print on demand', border:'#3fffa2', revenue:3200,
    x:0.05, y:0.12, w:0.28, h:0.22 },
  { id:'etsy2', label:'ETSY-02', sublabel:'Niche store', border:'#38b6ff', revenue:1800,
    x:0.36, y:0.08, w:0.28, h:0.26 },
  { id:'tiktok1', label:'TIKTOK-01', sublabel:'Content gen', border:'#a855f7', revenue:800,
    x:0.67, y:0.12, w:0.28, h:0.22 },
  { id:'tiktok2', label:'TIKTOK-02', sublabel:'Trend research', border:'#f59e0b', revenue:400,
    x:0.05, y:0.42, w:0.28, h:0.22 },
  { id:'intel', label:'INTEL', sublabel:'Market analysis', border:'#14b8a6', revenue:0,
    x:0.36, y:0.42, w:0.28, h:0.22 },
  { id:'finance', label:'FINANCE', sublabel:'Revenue tracking', border:'#ef4444', revenue:0,
    x:0.67, y:0.42, w:0.28, h:0.22 },
]

function hexToRgb(h) {
  return parseInt(h.slice(1,3),16)+','+parseInt(h.slice(3,5),16)+','+parseInt(h.slice(5,7),16)
}

function drawRobot(ctx, x, y, color, size=8) {
  const rgb = hexToRgb(color)
  // Body
  ctx.fillStyle = color
  ctx.fillRect(x - size*0.4, y - size*0.3, size*0.8, size*0.6)
  // Head
  ctx.fillRect(x - size*0.25, y - size*0.75, size*0.5, size*0.42)
  // Eyes
  ctx.fillStyle = '#000'
  ctx.fillRect(x - size*0.18, y - size*0.65, size*0.12, size*0.12)
  ctx.fillRect(x + size*0.06, y - size*0.65, size*0.12, size*0.12)
  // Antenna
  ctx.fillStyle = color
  ctx.fillRect(x - size*0.04, y - size*1.0, size*0.08, size*0.28)
  ctx.beginPath()
  ctx.arc(x, y - size*1.0, size*0.1, 0, Math.PI*2)
  ctx.fill()
  // Legs
  ctx.fillRect(x - size*0.3, y + size*0.3, size*0.2, size*0.35)
  ctx.fillRect(x + size*0.1, y + size*0.3, size*0.2, size*0.35)
  // Arms
  ctx.fillRect(x - size*0.6, y - size*0.2, size*0.22, size*0.12)
  ctx.fillRect(x + size*0.38, y - size*0.2, size*0.22, size*0.12)
  // Glow
  ctx.fillStyle = `rgba(${rgb},0.15)`
  ctx.beginPath()
  ctx.arc(x, y, size*1.2, 0, Math.PI*2)
  ctx.fill()
}

function drawShipOutline(ctx, W, H) {
  ctx.save()
  const pts = [
    [W*0.5, H*0.02],
    [W*0.95, H*0.92],
    [W*0.82, H*0.98],
    [W*0.62, H*0.88],
    [W*0.5, H*0.92],
    [W*0.38, H*0.88],
    [W*0.18, H*0.98],
    [W*0.05, H*0.92],
  ]
  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  pts.forEach(([px,py]) => ctx.lineTo(px, py))
  ctx.closePath()
  ctx.fillStyle = 'rgba(15,25,20,0.85)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(63,255,162,0.4)'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.strokeStyle = 'rgba(63,255,162,0.12)'
  ctx.lineWidth = 0.5
  ctx.beginPath(); ctx.moveTo(W*0.5, H*0.02); ctx.lineTo(W*0.5, H*0.92); ctx.stroke()
  [0.25, 0.45, 0.65, 0.80].forEach(t => {
    const lx = W*0.5 - (W*0.5-W*0.05)*t*0.95
    const rx = W*0.5 + (W*0.95-W*0.5)*t*0.95
    const y = H*0.02 + (H*0.90)*t
    ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(rx, y); ctx.stroke()
  })
  [[W*0.2, H*0.955], [W*0.38, H*0.91], [W*0.5, H*0.935], [W*0.62, H*0.91], [W*0.8, H*0.955]].forEach(([ex,ey], i) => {
    const size = i===0||i===4 ? 14 : i===2 ? 10 : 8
    const grad = ctx.createRadialGradient(ex, ey, 0, ex, ey, size)
    grad.addColorStop(0, 'rgba(63,255,162,0.9)')
    grad.addColorStop(0.4, 'rgba(63,255,162,0.4)')
    grad.addColorStop(1, 'rgba(63,255,162,0)')
    ctx.fillStyle = grad
    ctx.beginPath(); ctx.arc(ex, ey, size, 0, Math.PI*2); ctx.fill()
  })
  ctx.fillStyle = 'rgba(30,50,40,0.9)'
  ctx.strokeStyle = 'rgba(63,255,162,0.5)'
  ctx.lineWidth = 1
  const bx = W*0.44, by = H*0.03, bw = W*0.12, bh = H*0.06
  ctx.fillRect(bx, by, bw, bh)
  ctx.strokeRect(bx, by, bw, bh)
  ctx.fillStyle = 'rgba(63,255,162,0.8)'
  ctx.font = `bold ${Math.max(7, W*0.016)}px Orbitron,monospace`
  ctx.textAlign = 'center'
  ctx.fillText('BRIDGE', W*0.5, by + bh*0.65)
  ctx.restore()
}

function drawHUD(ctx, W, H, rooms, roomsRef) {
  const active = roomsRef.current.filter(r => r.active)
  const totalRev = active.reduce((s,r) => s+(r.revenue||0), 0)
  ctx.fillStyle = 'rgba(6,10,15,0.92)'
  ctx.fillRect(0, 0, W, H*0.085)
  ctx.strokeStyle = 'rgba(63,255,162,0.25)'
  ctx.lineWidth = 1
  ctx.strokeRect(0, 0, W, H*0.085)
  ctx.fillStyle = '#3fffa2'
  ctx.font = `bold ${Math.max(10,W*0.028)}px Orbitron,monospace`
  ctx.textAlign = 'left'
  ctx.fillText('MOEDERSCHIP HQ', W*0.03, H*0.055)
  ctx.fillStyle = 'rgba(63,255,162,0.5)'
  ctx.font = `${Math.max(7,W*0.018)}px "Share Tech Mono",monospace`
  ctx.fillText('AI COMMAND', W*0.03, H*0.078)
  ctx.textAlign = 'right'
  ctx.fillStyle = '#3fffa2'
  ctx.font = `bold ${Math.max(10,W*0.028)}px 