import { useEffect, useRef } from 'react'

const ROOMS = [
  { id:'etsy1', label:'ETSY-01', sublabel:'Print on demand', border:'#3fffa2', revenue:3200, x:0.05, y:0.12, w:0.28, h:0.22 },
  { id:'etsy2', label:'ETSY-02', sublabel:'Niche store', border:'#38b6ff', revenue:1800, x:0.36, y:0.08, w:0.28, h:0.26 },
  { id:'tiktok1', label:'TIKTOK-01', sublabel:'Content gen', border:'#a855f7', revenue:800, x:0.67, y:0.12, w:0.28, h:0.22 },
  { id:'tiktok2', label:'TIKTOK-02', sublabel:'Trend research', border:'#f59e0b', revenue:400, x:0.05, y:0.42, w:0.28, h:0.22 },
  { id:'intel', label:'INTEL', sublabel:'Market analysis', border:'#14b8a6', revenue:0, x:0.36, y:42, w:0.28, h:0.22 },
  { id:'finance', label:'FINANCE', sublabel:'Revenue tracking', border:'#ef4444', revenue:0, x:0.67, y:42, w:0.28, h:0.22 },
]

function hexToRgb(h) { return parseInt(h.slice(1,3),16)+','+parseInt(h.slice(3,5),16)+','+parseInt(h.slice(5,7),16) }

function drawRobot(ctx,x,y,color,size=8){
  const rgb=hexToRgb(color)
  ctx.fillStyle=color
  ctx.fillRect(x-size*0.4,y-size*0.3,size*0.8,size*0.6)
  ctx.fillRect(x-size*0.25,y-size*0.75,size*0.5,size*0.42)
  ctx.fillStyle='#000'
  ctx.fillRect(x-size*0.18,y-size*0.65,size*0.12,size*0.12)
  ctx.fillRect(x+size*0.06,y-size*0.65,size*0.12,size*0.12)
  ctx.fillStyle=color
  ctx.fillRect(x-size*0.04,y-size*1.0,size*0.08,size*0.28)
  ctx.beginPath();ctx.arc(x,y-size*1.0,size*0.1,0,Math.PI*2);ctx.fill()
  ctx.fillRect(x-size*0.3,y+size*0.3,size*0.2,size*0.35)
  ctx.fillRect(x+size*0.1,y+size*0.3,size*0.2,size*0.35)
  ctx.fillRect(x-size*0.6,y-size*0.2,size*0.22,size*0.12)
  ctx.fillRect(x+size*0.38,y-size*0.2,size*0.22,size*0.12)
  ctx.fillStyle=`rgba(${rgb},0.15)`
  ctx.beginPath();ctx.arc(x,y,size*1.2,0,Math.PI*2);ctx.fill()
}

function drawShipOutline(ctx,W,H){
  ctx.save()
  const pts=[[W*0.5,H*0.02],[W*0.95,H*0.92],[W*0.82,H*0.98],[W*0.62,H*0.88],[W*0.5,H*0.92],[W*0.38,H*0.88],[W*0.18,H*0.98],[W*0.05,H*0.92]]
  ctx.beginPath()
  ctx.moveTo(pts[0][0],pts[0][1])
  pts.forEach(([px,py])=>ctx.lineTo(px,py))
  ctx.closePath()
  ctx.fillStyle='rgba(15,25,20,0.85)';ctx.fill()
  ctx.strokeStyle='rgba(63,255,162,0.4)';ctx.lineWidth=1.5;ctx.stroke()
  ctx.strokeStyle='rgba(63,255,162,0.12)';ctx.lineWidth=0.5
  ctx.beginPath();ctx.moveTo(W*0.5,H*0.02);ctx.lineTo(W*0.5,H*0.92);ctx.stroke()
  [0.25,0.45,0.65,0.80].forEach(t=>{const lx=W*0.5-(W*0.5-W*0.05)*t*0.95,rx=W*0.5+(W*0.95-W*0.5)*t*0.95,y=H*0.02+(H*0.90)*t;ctx.beginPath();ctx.moveTo(lx,z);ctx.lineTo(rx,y);ctx.stroke()})
  [[W*0.2,H*0.955],[W*0.38,H*0.91],[W*0.5,H*0.935],[W*0.62,H*0.91],[W*0.8,H*0.955]].forEach(([ex,ey],i)=>{const sz=i==<0||i===4?14:i===2?10:8,g=ctx.createRadialGradient(ex,ey,0,ex,ey,sz);g.addColorStop(0,'rgba(63,255,162,0.9)');g.addColorStop(0.4,'rgba(63,255,162,0.4)');g.addColorStop(1,'rgba(63,255,162,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(ex,ey,sz,0,Math.PI*2);ctx.fill()})
  const bx=W*0.44,by=H*0.03,bw=W*0.12,bh=H*0.06
  ctx.fillStyle='rgba(30,50,40,0.9)';ctx.fillRect(bx,by,bw,bh)
  ctx.strokeStyle='rgba(63,255,162,0.5)';ctx.lineWidth=1;ctx.strokeRect(bx,by,bw,bh)
  ctx.fillStyle='rgba(63,255,162,0.8)';ctx.font=`bold ${Math.max(7,W*0.016)}px Orbitron,sans-serif`;ctx.textAlign='center';ctx.fillText('BRIDGE',W*0.5,by+bh*0.65)
  ctx.restore()
}

export default function GameCanvas({rooms,onToggle}){
  const canvasRef=useRef(null),agents=useRef({}),animRef=useRef(null),roomsRef=useRef(rooms)
  roomsRef.current=rooms
  useEffect(()=>{ROOMS.forEach(r=>{if(!agents.current[r.id])agents.current[r.id]={x:0.5,y:0.5,dx:(Math.random()*0.4+0.2)*(Math.random()<0.5?1:-1),dy:(Math.random()*0.3+0.15)*(Math.random()<0.5?1:-1),trail:[]}})},[])
  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return
    const ctx=canvas.getContext('2d')
    function resize(){const d=window.devicePixelRatio||1,r=canvas.parentElement.getBoundingClientRect();canvas.width=r.width*d;canvas.height=r.height*d;canvas.style.width=r.width+'px';canvas.style.height=r.height+'px';ctx.scale(d,d)}
    resize();window.addEventListener('resize',resize)
    function draw(){
      const W=canvas.width/(window.devicePixelRatio||1),H=canvas.height/(window.devicePixelRatio||1)
      ctx.fillStyle='#04080d';ctx.fillRect(0,0,W,H)
      ctx.fillStyle='rgba(255,255,255,0.5)'
      for(let i=0;i<60;i++){const sx=((i*137.5)%100)/100*W,sy=((i*97.3)%100)/100*H,ss=(i%3===0)?1.2:0.6;ctx.fillRect(sx,sy,ss,ss)}
      ctx.strokeStyle='rgba(63,255,162,0.025)';ctx.lineWidth=0.5
      for(let x=0;x<W;x+=20){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
      for(let y=0;y<H;y+=20){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
      drawShipOutline(ctx,W,H)
      ROOMS.forEach(rd=>{
        const room=roomsRef.current.find(r=>r.id===rd.id)||rd
        const rect={x:rd.x*W,y:rd.y*H+H*0.085,w:rd.w*W,h:rd.h*H}
        const {x,y,w,h}=rect,rgb=hexToRgb(rd.border),active=room.active
        ctx.fillStyle=active?`rgba(${rgb}ì°À¸Àà¥€èÉ‰„ ÄÀ°ÈÀ°ÄÔ°À¸Ô¤œíÑà¹™¥±±I•Ð¡à±ä±Ü± ¤(€€€€€€€Ñà¹ÍÑÉ½­•MÑå±”õ…Ñ¥Ù”ýÉ¹‰½É‘•ÈèÉ‰„ ØÌ°ÈÔÔ°ÄØÈ°À¸ÄÔ¤œíÑà¹±¥¹•]¥‘Ñ õ…Ñ¥Ù”üÄ¸ÔèÀ¸ÜíÑà¹ÍÑÉ½­•I•Ð¡à±ä±Ü± ¤(€€€€€€€¥˜¡…Ñ¥Ù”¥íÑà¹ÍÑÉ½­•MÑå±”õÉ¹‰½É‘•ÈíÑà¹±¥¹•]¥‘Ñ ôÈí½¹ÍÐÌõ5…Ñ ¹µ¥¸¡Ü± ¤¨À¸Èímmà±åt±mà­Ü±åt±mà±ä­¡t±mà­Ü±ä­¡ut¹™½É…  ¡mà±åt¤ôùí½¹ÍÐÍàõàôôõàüÄè´Ä±ÍäõäôôõäüÄè´ÄíÑà¹‰•¥¹A…Ñ  ¤íÑà¹µ½Ù•Q¼¡à­Íà©Ì±ä¤íÑà¹±¥¹•Q¼¡à±ä¤íÑà¹±¥¹•Q¼¡à±ä­Íä©Ì¤íÑà¹ÍÑÉ½­” ¥ô¥ô(€€€€€€€½¹ÍÐ™Ìõ5…Ñ ¹µ…à Ü±Ü¨À¸ÄÄ¤(€€€€€€€Ñà¹™¥±±MÑå±”õ…Ñ¥Ù”ýÉ¹‰½É‘•ÈèÉ‰„ ØÌ°ÈÔÔ°ÄØÈ°À¸Ì¤œíÑà¹™½¹Ðõ‰½±€‘í™ÍõÁà=É‰¥ÑÉ½¸±Í…¹ÌµÍ•É¥™€íÑà¹Ñ•áÑ±¥¸ô±•™ÐœíÑà¹™¥±±Q•áÐ¡É¹±…‰•°±à¬Ø±ä­™Ì¬Ð¤(€€€€€€€Ñà¹™¥±±MÑå±”õ…Ñ¥Ù”ýÉ‰„ ‘íÉ‰ô°À¸Ø¥€èÉ‰„ ØÌ°ÈÔÔ°ÄØÈ°À¸È¤œíÑà¹™½¹Ðõ€‘í5…Ñ ¹µ…à Ø±Ü¨À¸Àä¥õÁà€‰M¡…É”Q• 5½¹¼ˆ±µ½¹½ÍÁ…•€íÑà¹™¥±±Q•áÐ¡É¹ÍÕ‰±…‰•°¹Ñ½UÁÁ•É…Í” ¤±à¬Ä±ä­™Ì¬ÄØ¤(€€€€€€€¥˜¡…Ñ¥Ù”¥íÑà¹™¥±±MÑå±”õÉ‰„ ‘íÉ‰÷²ÃãƒR–¶7G‚æföçCÖ&öÆBG´ÖF‚æÖ‚ƒrÇr£ã—×‚÷&&—G&öâÇ6ç2×6W&–f¶7G‚çFW‡DÆ–vãÒw&–v‡Bs¶7G‚æf–ÆÅFW‡B‚~(*Âr²‡&ööÒç&WfVçVWÇÃ’çFôÆö6ÆU7G&–ær‚væÂÔäÂr’Ç‚·r²ÓbÇ’¶‚Ó‚“¶7G‚çFW‡DÆ–vãÒvÆVgBs¶6öç7B's×rÓ#¶7G‚æf–ÆÅ7G–ÆSÖ&v&‚G·&v'ÞËŒJXØÝ™š[™XÝ

ÌKJÚMKËÊNØÝ™š[Ý[O\™˜›Ü™\ŽØÝ™š[™XÝ

ÌKJÒMK
]K››ÝÊ
KÌJIXËÊ_BˆÛÛœÝ^
ÝÊËLÌ‹O^JÍŽØÝ™š[Ý[OXXÝ]™OØ™Ø˜J	Ü™ØŸ{,0.2)`:'rgba(20,40,30,0.5)';ctx.fillRect(tx,ty,26,13);ctx.strokeStyle=active?rd.border:'rgba(63,255,162,0.2)';ctx.lineWidth=0.8;ctx.strokeRect(tx,ty,26,13);ctx.fillStyle=active?rd.border:'rgba(63,255,162,0.2)';ctx.fillRect(active?tx+14:tx+2,ty+2,10,9);ctx.fillStyle=active?'#000':'rgba(63,255,162,0.4)';ctx.font='6px "Share Tech Mono",monospace';ctx.textAlign='center';ctx.fillText(active?'ON':'OFF',tx+13,ty+9);ctx.textAlign='left'
        if(room.active){
          const ag=agents.current[rd.id],ax=rect.x+ag.x*rect.w,ay=rect.y+ag.y*rect.h,rs=Math.max(7,Math.min(rect.w,rect.h)*0.18)
          ag.trail.forEach((pt,i)=>{ctx.fillStyle=`rgba(${rgb},${(i/ag.trail.length)*0.25})`;const s=(i/ag.trail.length)*3;ctx.fillRect(pt.x-s/2,pt.y-s/2,s,s)})
          drawRobot(ctx,ax,ay,rd.border,rs)
          ag.trail.push({x:ax,y:ay});if(ag.trail.length>16)ag.trail.shift()
          const m=0.12;ag.x+=ag.dx*0.012;ag.y+=ag.dy*0.012
          if(ag.x>1-m){ag.x=1-m;ag.dx*=-1};if(ag.x<m){ag.x=m;ag.dx*=-1}
          if(ag.y>1-m){ag.y=1-m;ag.dy*=-1};if(ag.y<m){ag.y=m;ag.dy*=-1}
        }else{const ag=agents.current[rd.id];ag.x=0.5;ag.y=0.5;ag.trail=[]}
      })
      const active=roomsRef.current.filter(r=>r.active),totalRev=active.reduce((s,r)=>s+(r.revenue||0),0)
      ctx.fillStyle='rgba(6,10,15,0.92)';ctx.fillRect(0,0,W,H*0.085)
      ctx.strokeStyle='rgba(63,255,162,0.25)';ctx.lineWidth=1;ctx.strokeRect(0,0,W,H*0.085)
      ctx.fillStyle='#3fffa2';ctx.font=`bold ${Math.max(10,W*0.028)}px Orbitron,sans-serif`;ctx.textAlign='left';ctx.fillText('MOEDERSCHIP HQ',W*0.03,H*0.055)
      ctx.fillStyle='rgba(63,255,162,0.5)';ctx.font=`${Math.max(7,W*0.018)}px "Share Tech Mono",monospace`;ctx.fillText('AI COMMAND',W*0.03,H*0.078)
      ctx.textAlign='right';ctx.fillStyle='#3fffa2';ctx.font=`bold ${Math.max(10,W*0.028)}px Orbitron,sans-serif`;ctx.fillText('â‚¬'+totalRev.toLocaleString('nl-NL'),W*0.97,H*0.055)
      ctx.fillStyle='rgba(63,255,162,0.5)';ctx.font=`${Math.max(7,W*0.018)}px "Share Tech Mono",monospace`;ctx.fillText(active.length+'/6 ONLINE',W*0.97,H*0.078);ctx.textAlign='left'
      if(Date.now()%1000<500){ctx.fillStyle='#3fffa2';ctx.beginPath();ctx.arc(W*0.5,H*0.045,4,0,Math.PI*2);ctx.fill()}
      animRef.current=requestAnimationFrame(draw)
    }
    draw()
    const handleClick=e=>{const rect=canvas.getBoundingClientRect(),mx=e.clientX-rect.left,my=e.clientY-rect.top,W=rect.width,H)rect.height;ROOMS.forEach(rd=>{const r={x:rd.x*W,y:rd.y*H+H*0.085,w:rd.w*W,h:rd.h*H};if(mx>=r.x&&mx<=r.x+r.w&&my>=r.y&&my<=r.y+r.h)onToggle(rd.id)})};canvas.addEventListener('click',handleClick)
    return()=>{concelAnimationFrame(animRef.current);window.removeEventListener('resize',resize);canvas.removeEventListener('click',handleClick)}
  },[onToggle])
  return<canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',cursor:'crosshair'}}/>
}
