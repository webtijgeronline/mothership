import { useEffect, useRef } from 'react'

const ROOMS = [
  { id:'etsy1', label:'ETSY-01', sub:'Print on demand', color:'#3fffa2', rev:3200, x:0.05, y:0.12, w:0.28, h:0.22 },
  { id:'etsy2', label:'ETSY-02', sub:'Niche store', color:'#38b6ff', rev:1800, x:0.36, y:0.08, w:0.28, h:0.26 },
  { id:'tiktok1', label:'TIKTOK-01', sub:'Content gen', color:'#a855f7', rev:800, x:0.67, y:0.12, w:0.28, h:0.22 },
  { id:'tiktok2', label:'TIKTOK-02', sub:'Trend research', color:'#f59e0b', rev:400, x:0.05, y:0.42, w:0.28, h:0.22 },
  { id:'intel', label:'INTEL', sub:'Market analysis', color:'#14b8a6', rev:0, x:0.36, y:0.42, w:0.28, h:0.22 },
  { id:'finance', label:'FINANCE', sub:'Revenue tracking', color:'#ef4444', rev:0, x:0.67, y:0.42, w:0.28, h:0.22 },
]
function rgb(h){return parseInt(h.slice(1,3),16)+','+parseInt(h.slice(3,5),16)+','+parseInt(h.slice(5,7),16)}
function robot(ctx,x,y,col,s){
  ctx.fillStyle=col
  ctx.fillRect(x-s*0.4,y-s*0.3,s*0.8,s*0.6)
  ctx.fillRect(x-s*0.25,y-s*0.75,s*0.5,s*0.42)
  ctx.fillStyle='#000011'
  ctx.fillRect(x-s*0.18,y-s*0.65,s*0.13,s*0.13)
  ctx.fillRect(x+s*0.05,y-s*0.65,s*0.13,s*0.13)
  ctx.fillStyle=col
  ctx.fillRect(x-s*0.04,y-s,s*0.08,s*0.28)
  ctx.beginPath();ctx.arc(x,y-s,s*0.1,0,Math.PI*2);ctx.fill()
  ctx.fillRect(x-s*0.3,y+s*0.3,s*0.2,s*0.35)
  ctx.fillRect(x+s*0.1,y+s*0.3,s*0.2,s*0.35)
  ctx.fillRect(x-s*0.6,y-s*0.2,s*0.22,s*0.12)
  ctx.fillRect(x+s*0.38,y-s*0.2,s*0.22,s*0.12)
  var r=rgb(col);ctx.fillStyle='rgba('+r+',0.15)'
  ctx.beginPath();ctx.arc(x,y,s*1.2,0,Math.PI*2);ctx.fill()
}
function ship(ctx,W,H){
  ctx.save()
  var pts=[[W*0.5,H*0.02],[W*0.95,H*0.92],[W*0.82,H*0.98],[W*0.62,H*0.88],[W*0.5,H*0.92],[W*0.38,H*0.88],[W*0.18,H*0.98],[W*0.05,H*0.92]]
  ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1])
  pts.forEach(function(p){ctx.lineTo(p[0],p[1])})
  ctx.closePath();ctx.fillStyle='rgba(10,20,15,0.9)';ctx.fill()
  ctx.strokeStyle='rgba(63,255,162,0.5)';ctx.lineWidth=1.5;ctx.stroke()
  ctx.strokeStyle='rgba(63,255,162,0.1)';ctx.lineWidth=0.5
  ctx.beginPath();ctx.moveTo(W*0.5,H*0.02);ctx.lineTo(W*0.5,H*0.92);ctx.stroke()
  var ts=[0.25,0.45,0.65,0.8]
  for(var ti=0;ti<ts.length;ti++){
    var t=ts[ti],lx=W*0.5-W*0.45*t*0.95,rx=W*0.5+W*0.45*t*0.95,y2=H*0.02+H*0.9*t
    ctx.beginPath();ctx.moveTo(lx,y2);ctx.lineTo(rx,y2);ctx.stroke()
  }
  var engs=[[W*0.2,H*0.955,14],[W*0.38,H*0.91,8],[W*0.5,H*0.935,10],[W*0.62,H*0.91,8],[W*0.8,H*0.955,14]]
  for(var ei=0;ei<engs.length;ei++){
    var e=engs[ei],g=ctx.createRadialGradient(e[0],e[1],0,e[0],e[1],e[2])
    g.addColorStop(0,'rgba(63,255,162,0.9)');g.addColorStop(1,'rgba(63,255,162,0)')
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(e[0],e[1],e[2],0,Math.PI*2);ctx.fill()
  }
  ctx.fillStyle='rgba(20,40,30,0.95)';ctx.strokeStyle='rgba(63,255,162,0.6)';ctx.lineWidth=1
  ctx.fillRect(W*0.44,H*0.03,W*0.12,H*0.055);ctx.strokeRect(W*0.44,H*0.03,W*0.12,H*0.055)
  ctx.fillStyle='rgba(63,255,162,0.9)';ctx.font='bold '+Math.max(7,Math.round(W*0.016))+'px Orbitron,sans-serif'
  ctx.textAlign='center';ctx.fillText('BRIDGE',W*0.5,H*0.065);ctx.restore()
}
export default function GameCanvas({rooms,onToggle}){
  var canvasRef=useRef(null),agents=useRef({}),animRef=useRef(null),roomsRef=useRef(rooms)
  roomsRef.current=rooms
  useEffect(function(){
    ROOMS.forEach(function(r){
      if(!agents.current[r.id]){
        var dx=(Math.random()*0.4+0.2)*(Math.random()<0.5?1:-1)
        var dy=(Math.random()*0.3+0.15)*(Math.random()<0.5?1:-1)
        agents.current[r.id]={x:0.5,y:0.5,dx:dx,dy:dy,trail:[]}
      }
    })
  },[])
  useEffect(function(){
    var canvas=canvasRef.current;if(!canvas)return
    var ctx=canvas.getContext('2d')
    function resize(){
      var dpr=window.devicePixelRatio||1,rect=canvas.parentElement.getBoundingClientRect()
      canvas.width=rect.width*dpr;canvas.height=rect.height*dpr
      canvas.style.width=rect.width+'px';canvas.style.height=rect.height+'px'
      ctx.scale(dpr,dpr)
    }
    resize();window.addEventListener('resize',resize)
    function draw(){
      var W=canvas.width/(window.devicePixelRatio||1),H=canvas.height/(window.devicePixelRatio||1)
      ctx.fillStyle='#04080d';ctx.fillRect(0,0,W,H)
      ctx.fillStyle='rgba(255,255,255,0.5)'
      for(var i=0;i<60;i++){var si=(i*137.5-Math.floor(i*137.5/100)*100)/100;var sj=(i*97.3-Math.floor(i*97.3/100)*100)/100;ctx.fillRect(si*W,sj*H,i%3===0?1.2:0.6,i%3===0?1.2:0.6)}
      ctx.strokeStyle='rgba(63,255,162,0.025)';ctx.lineWidth=0.5
      for(var x=0;x<W;x+=20){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
      for(var y=0;y<H;y+=20){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
      ship(ctx,W,H)
      ROOMS.forEach(function(rd){
        var room=roomsRef.current.find(function(r){return r.id===rd.id})||rd
        var rx=rd.x*W,ry=rd.y*H+H*0.085,rw=rd.w*W,rh=rd.h*H
        var c=rgb(rd.color),active=room.active
        ctx.fillStyle=active?'rgba('+c+',0.09)':'rgba(8,16,12,0.6)';ctx.fillRect(rx,ry,rw,rh)
        ctx.strokeStyle=active?rd.color:'rgba(63,255,162,0.15)';ctx.lineWidth=active?1.5:0.7;ctx.strokeRect(rx,ry,rw,rh)
        if(active){
          ctx.strokeStyle=rd.color;ctx.lineWidth=2;var cs=Math.min(rw,rh)*0.18
          var corners=[[rx,ry],[rx+rw,ry],[rx,ry+rh],[rx+rw,ry+rh]]
          corners.forEach(function(p){var sx=p[0]===rx?1:-1,sy=p[1]===ry?1:-1;ctx.beginPath();ctx.moveTo(p[0]+sx*cs,p[1]);ctx.lineTo(p[0],p[1]);ctx.lineTo(p[0],p[1]+sy*cs);ctx.stroke()})
          ctx.strokeStyle='rgba('+c+',0.2)';ctx.lineWidth=0.5;ctx.strokeRect(rx+3,ry+3,rw-6,rh-6)
        }
        var fs=Math.max(7,Math.round(rw*0.11))
        ctx.fillStyle=active?rd.color:'rgba(63,255,162,0.3)';ctx.font='bold '+fs+'px Orbitron,sans-serif';ctx.textAlign='left';ctx.fillText(rd.label,rx+6,ry+fs+4)
        ctx.fillStyle=active?'rgba('+c+',0.6)':'rgba(63,255,162,0.2)';ctx.font=Math.max(6,Math.round(rw*0.09))+'px Share Tech Mono,monospace';ctx.fillText(rd.sub.toUpperCase(),rx+6,ry+fs+16)
        if(active){
          ctx.fillStyle='rgba('+c+',0.85)';ctx.font='bold '+Math.max(7,Math.round(rw*0.1))+'px Orbitron,sans-serif';ctx.textAlign='right'
          ctx.fillText('\u20ac'+(room.rev||rd.rev||0).toLocaleString('nl-NL'),rx+rw-6,ry+rh-8);ctx.textAlign='left'
          var bw=rw-12;var prog=(Date.now()/25);prog=prog-Math.floor(prog/bw)*bw
          ctx.fillStyle='rgba('+c+',0.1)';ctx.fillRect(rx+6,ry+rh-5,bw,3)
          ctx.fillStyle=rd.color;ctx.fillRect(rx+6,ry+rh-5,prog,3)
        }
        var tx=rx+rw-32,ty=ry+6
        ctx.fillStyle=active?'rgba('+c+',0.2)':'rgba(15,35,25,0.6)';ctx.fillRect(tx,ty,26,13)
        ctx.strokeStyle=active?rd.color:'rgba(63,255,162,0.2)';ctx.lineWidth=0.8;ctx.strokeRect(tx,ty,26,13)
        ctx.fillStyle=active?rd.color:'rgba(63,255,162,0.2)';ctx.fillRect(active?tx+14:tx+2,ty+2,10,9)
        ctx.fillStyle=active?'#000':'rgba(63,255,162,0.4)';ctx.font='6px Share Tech Mono,monospace';ctx.textAlign='center';ctx.fillText(active?'ON':'OFF',tx+13,ty+9);ctx.textAlign='left'
        if(active){
          var ag=agents.current[rd.id],ax=rx+ag.x*rw,ay=ry+ag.y*rh,rs=Math.max(7,Math.min(rw,rh)*0.17)
          ag.trail.forEach(function(pt,i){ctx.fillStyle='rgba('+c+','+(i/ag.trail.length*0.25)+')';var s=i/ag.trail.length*3;ctx.fillRect(pt.x-s/2,pt.y-s/2,s,s)})
          robot(ctx,ax,ay,rd.color,rs)
          ag.trail.push({x:ax,y:ay});if(ag.trail.length>16)ag.trail.shift()
          var m=0.12;ag.x+=ag.dx*0.012;ag.y+=ag.dy*0.012
          if(ag.x>1-m){ag.x=1-m;ag.dx*=-1}if(ag.x<m){ag.x=m;ag.dx*=-1}
          if(ag.y>1-m){ag.y=1-m;ag.dy*=-1}if(ag.y<m){ag.y=m;ag.dy*=-1}
        }else{var ag2=agents.current[rd.id];ag2.x=0.5;ag2.y=0.5;ag2.trail=[]}
      })
      var act=roomsRef.current.filter(function(r){return r.active}),tot=act.reduce(function(s,r){return s+(r.rev||0)},0)
      ctx.fillStyle='rgba(4,8,13,0.94)';ctx.fillRect(0,0,W,H*0.085)
      ctx.strokeStyle='rgba(63,255,162,0.3)';ctx.lineWidth=1;ctx.strokeRect(0,0,W,H*0.085)
      ctx.fillStyle='#3fffa2';ctx.font='bold '+Math.max(10,Math.round(W*0.028))+'px Orbitron,sans-serif';ctx.textAlign='left';ctx.fillText('MOEDERSCHIP HQ',W*0.03,H*0.055)
      ctx.fillStyle='rgba(63,255,162,0.5)';ctx.font=Math.max(7,Math.round(W*0.018))+'px Share Tech Mono,monospace';ctx.fillText('AI COMMAND',W*0.03,H*0.078)
      ctx.textAlign='right';ctx.fillStyle='#3fffa2';ctx.font='bold '+Math.max(10,Math.round(W*0.028))+'px Orbitron,sans-serif';ctx.fillText('\u20ac'+tot.toLocaleString('nl-NL'),W*0.97,H*0.055)
      ctx.fillStyle='rgba(63,255,162,0.5)';ctx.font=Math.max(7,Math.round(W*0.018))+'px Share Tech Mono,monospace';ctx.fillText(act.length+'/6 ONLINE',W*0.97,H*0.078);ctx.textAlign='left'
      if(Date.now()-Math.floor(Date.now()/1000)*1000<500){ctx.fillStyle='#3fffa2';ctx.beginPath();ctx.arc(W*0.5,H*0.045,4,0,Math.PI*2);ctx.fill()}
      animRef.current=requestAnimationFrame(draw)
    }
    draw()
    function handleClick(e){
      var rect=canvas.getBoundingClientRect(),mx=e.clientX-rect.left,my=e.clientY-rect.top
      ROOMS.forEach(function(rd){var r={x:rd.x*rect.width,y:rd.y*rect.height+rect.height*0.085,w:rd.w*rect.width,h:rd.h*rect.height};if(mx>=r.x&&mx<=r.x+r.w&&my>=r.y&&my<=r.y+r.h)onToggle(rd.id)})
    }
    canvas.addEventListener('click',handleClick)
    return function(){cancelAnimationFrame(animRef.current);window.removeEventListener('resize',resize);canvas.removeEventListener('click',handleClick)}
  },[onToggle])
  return React.createElement('canvas',{ref:canvasRef,style:{display:'block',width:'100%',height:'100%',cursor:'crosshair'}})
}
