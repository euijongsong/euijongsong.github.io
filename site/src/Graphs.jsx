import { useEffect, useRef, useState } from 'react';

// Retain the original homepage's graph topology and edge trimming.
const nodes = {
  about: { label: 'About', x: 76, y: 36, w: 126, h: 48 },
  cv: { label: 'CV', x: 396, y: 36, w: 126, h: 48 },
  research: { label: 'Research', x: 210, y: 126, w: 142, h: 50 },
  papers: { label: 'Papers', x: 224, y: 242, w: 142, h: 48 },
  contact: { label: 'Contact', x: 452, y: 226, w: 128, h: 50 },
};
const edges = [['about','research',0],['about','cv',-22],['research','papers',0],['research','contact',-24],['cv','contact',0],['papers','contact',6]];
function edgePath(a, b, c, hwA, hhA, hwB, hhB) {
  const mx=(a[0]+b[0])/2, my=(a[1]+b[1])/2;
  let dx=b[0]-a[0], dy=b[1]-a[1];
  const len=Math.hypot(dx,dy); dx/=len; dy/=len;
  const ctrl=[mx-dy*c,my+dx*c];
  const trim=(p,toward,hw,hh,pad)=>{
    let ux=toward[0]-p[0],uy=toward[1]-p[1];
    const l=Math.hypot(ux,uy);ux/=l;uy/=l;
    const d=Math.min(hw/Math.abs(ux||1e-9),hh/Math.abs(uy||1e-9))+pad;
    return [p[0]+ux*d,p[1]+uy*d];
  };
  const s=trim(a,ctrl,hwA,hhA,1),e=trim(b,ctrl,hwB,hhB,5);
  return `M ${s[0]} ${s[1]} Q ${ctrl[0]} ${ctrl[1]} ${e[0]} ${e[1]}`;
}
const drawnEdges=edges.map(([from,to,curve])=>{
  const a=nodes[from], b=nodes[to];
  return {id:`${from}-${to}`, d:edgePath([a.x,a.y],[b.x,b.y],curve,a.w/2,a.h/2,b.w/2,b.h/2)};
});

export function DAG({observed,onObserve}) {
  const graph=useRef(null);
  const [entering,setEntering]=useState(false);
  useEffect(()=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const watcher=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)) {
        setEntering(true);
        watcher.disconnect();
      }
    },{threshold:.2});
    watcher.observe(graph.current);
    return ()=>watcher.disconnect();
  },[]);
  return <nav ref={graph} className={`dag${entering?' is-entering':''}${observed?' is-observed':''}`} aria-label="DAG navigation"><svg viewBox="0 0 520 280" aria-label="Navigation graph">
    <defs>
      <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 1 L 9 5 L 0 9" fill="currentColor"/></marker>
      {drawnEdges.map((edge,i)=><mask key={edge.id} id={`reveal-${edge.id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="520" height="280"><path className="edge-reveal" d={edge.d} pathLength="1" fill="none" stroke="white" strokeWidth="18" strokeLinecap="square" style={{'--edge-delay':`${i*.13}s`}}/></mask>)}
    </defs>
    <g className="edges" aria-hidden="true">
      {drawnEdges.map(edge=><path key={edge.id} d={edge.d} markerEnd="url(#arr)" mask={`url(#reveal-${edge.id})`}/>)}
      {['research','papers'].map(t=>{const b=nodes[t];return <path key={t} className="latent-edge" d={edgePath([42,216],[b.x,b.y],0,36,36,b.w/2,b.h/2)} markerEnd="url(#arr)"/>;})}
    </g>
    {Object.entries(nodes).map(([key,n])=><a key={key} href={`#${key}`} className="dag-node" aria-label={`Go to ${n.label}`}>
      <rect className="hit-area" x={n.x-n.w/2-2} y={n.y-42} width={n.w+4} height="84" rx="24"/>
      <rect className="node-outline" x={n.x-n.w/2} y={n.y-n.h/2} width={n.w} height={n.h} rx={n.h/2}/><text x={n.x} y={n.y}>{n.label}</text>
    </a>)}
    <a href="#unobserved" className="dag-node latent" aria-label="Go to Unobserved" onClick={onObserve}>
      <circle className="hit-area" cx="42" cy="216" r="42"/>
      {observed&&<circle className="observe-ring" cx="42" cy="216" r="36" aria-hidden="true"/>}
      <circle className="node-outline" cx="42" cy="216" r="36"/><text x="42" y="216">U</text>
    </a>
  </svg></nav>;
}

const hobbies=[
  {id:'table-tennis',label:'table tennis',emoji:'🏓',x:16,y:12},
  {id:'tennis',label:'tennis',emoji:'🎾',x:72,y:10},
  {id:'climbing',label:'climbing',emoji:'🧗',x:42,y:39},
  {id:'good-eats',label:'good eats',emoji:'🍽️',x:62,y:88},
  {id:'travel',label:'travel',emoji:'✈️',x:82,y:49},
];
// A playful directed network, with one feedback loop between research and travel.
const hobbyConnections=[
  {from:1,to:0,curve:16},
  {from:0,to:'research',curve:56},
  {from:2,to:'research',curve:0},
  {from:'research',to:4,curve:-42},
  {from:4,to:'research',curve:-42},
  {from:4,to:3,curve:-10},
];
// Every signal follows arrow direction; the feedback loop runs once per click.
const hobbyRoutes={
  0:[0,'research'],
  1:[1,0,'research'],
  2:[2,'research'],
  3:[4,3],
  4:[4,'research',4],
  research:['research',4,'research'],
};
function routeGeometry(route,edges) {
  let path='', ids=[];
  for(let i=1;i<route.length;i++) {
    const edge=edges.find(e=>e.from===route[i-1]&&e.to===route[i]);
    if(!edge) return {path:'',ids:[]};
    const [center,start,end,finish]=[edge.a,edge.start,edge.end,edge.b];
    path+=`${i===1?'M':'L'} ${center} L ${start} Q ${edge.control} ${end} L ${finish} `;
    ids.push(edge.id);
  }
  return {path,ids};
}
function Signal({path,duration}) {
  const motion=useRef(null);
  useEffect(()=>{
    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches) motion.current?.beginElement();
  },[]);
  return <circle className="hobby-signal" r="3"><animateMotion ref={motion} begin="indefinite" dur={`${duration}ms`} path={path} fill="freeze"/></circle>;
}
export function Unobserved({revealKey=0}) {
  const graph=useRef(null), target=useRef(null), timer=useRef(null), sequence=useRef(0);
  const revealTimers=useRef([]), revealWatcher=useRef(null);
  const [paths,setPaths]=useState([]);
  const [pulse,setPulse]=useState(null);
  const [reveal,setReveal]=useState({run:0,phase:'complete'});
  useEffect(()=>{
    clearTimeout(timer.current);
    setPulse(null);
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
    const stop=()=>{
      revealWatcher.current?.disconnect();
      revealTimers.current.forEach(clearTimeout);
      revealTimers.current=[];
    };
    const complete=()=>{stop();setReveal(previous=>({...previous,phase:'complete'}));};
    if(motion.matches) {complete();return;}
    setReveal(previous=>({...previous,phase:'pending'}));
    revealWatcher.current=new IntersectionObserver(entries=>{
      if(!entries.some(entry=>entry.isIntersecting)) return;
      revealWatcher.current.disconnect();
      revealTimers.current.push(setTimeout(()=>{
        setReveal(previous=>({run:previous.run+1,phase:'drawing'}));
        revealTimers.current.push(setTimeout(complete,2100));
      },160));
    },{threshold:.55});
    revealWatcher.current.observe(graph.current);
    const onMotionChange=()=>{if(motion.matches) complete();};
    motion.addEventListener('change',onMotionChange);
    return ()=>{stop();motion.removeEventListener('change',onMotionChange);};
  },[revealKey]);
  useEffect(()=>{
    let mounted=true;
    const measure=()=>{
      if(!mounted) return;
      const bounds=graph.current.getBoundingClientRect();
      const point=element=>{
        const box=element.getBoundingClientRect();
        return {x:box.left+box.width/2-bounds.left,y:box.top+box.height/2-bounds.top,w:box.width,h:box.height};
      };
      const points=[...graph.current.querySelectorAll('.hobby-orb')].map(point);
      const labels=[...graph.current.querySelectorAll('.hobby-label')].map(element=>{
        const box=element.getBoundingClientRect();
        return {left:box.left-bounds.left,right:box.right-bounds.left,top:box.top-bounds.top,bottom:box.bottom-bounds.top};
      });
      points.research=point(target.current);
      const trim=(p,c,rectangle,pad)=>{
        const dx=c.x-p.x,dy=c.y-p.y,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;
        const distance=(rectangle?Math.min(p.w/2/Math.abs(ux||1e-9),p.h/2/Math.abs(uy||1e-9)):p.w/2)+pad;
        return [p.x+ux*distance,p.y+uy*distance];
      };
      const clearLabel=(p,c,start,label)=>{
        if(!label) return start;
        const dx=c.x-p.x,dy=c.y-p.y,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;
        const interval=(min,max,origin,direction)=>Math.abs(direction)<1e-6
          ?(origin>=min&&origin<=max?[-Infinity,Infinity]:[Infinity,-Infinity])
          :[(min-origin)/direction,(max-origin)/direction].sort((a,b)=>a-b);
        const x=interval(label.left-4,label.right+4,p.x,ux),y=interval(label.top-4,label.bottom+4,p.y,uy);
        const near=Math.max(x[0],y[0]),far=Math.min(x[1],y[1]);
        return near<=far&&far>0&&near<len?[p.x+ux*(far+5),p.y+uy*(far+5)]:start;
      };
      const next=hobbyConnections.map((edge,id)=>{
        const a=points[edge.from],b=points[edge.to],len=Math.hypot(b.x-a.x,b.y-a.y);
        const control={x:(a.x+b.x)/2-(b.y-a.y)/len*edge.curve,y:(a.y+b.y)/2+(b.x-a.x)/len*edge.curve};
        const start=clearLabel(a,control,trim(a,control,edge.from==='research',4),labels[edge.from]);
        const end=trim(b,control,edge.to==='research',7);
        return {...edge,id,a:[a.x,a.y],b:[b.x,b.y],control:[control.x,control.y],start,end,d:`M ${start} Q ${control.x},${control.y} ${end}`};
      });
      setPaths(previous=>JSON.stringify(previous)===JSON.stringify(next)?previous:next);
    };
    measure();
    const resize=new ResizeObserver(measure);
    resize.observe(graph.current);
    document.fonts.ready.then(measure);
    return ()=>{mounted=false;resize.disconnect();clearTimeout(timer.current);};
  },[]);
  const activate=index=>{
    clearTimeout(timer.current);
    revealWatcher.current?.disconnect();
    revealTimers.current.forEach(clearTimeout);
    revealTimers.current=[];
    setReveal(previous=>({...previous,phase:'complete'}));
    const duration=hobbyRoutes[index].length>2?1800:1150;
    setPulse({index,sequence:++sequence.current,duration});
    timer.current=setTimeout(()=>setPulse(null),duration+350);
  };
  const activeNodes=pulse?hobbyRoutes[pulse.index]:[];
  const route=routeGeometry(activeNodes,paths);
  return <section id="unobserved" className="lower-section unobserved" tabIndex="-1" aria-labelledby="unobserved-title">
    <h2 id="unobserved-title">Unobserved</h2>
    <p className="unobserved-note">The unseen forces behind my research.</p>
    <div className={`hobby-graph reveal-${reveal.phase}`} ref={graph} role="group" aria-label="Five hobbies and research, with a feedback loop between research and travel">
      <svg className="hobby-edges" aria-hidden="true">
        <defs>
          <marker id="hobby-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" orient="auto"><path d="M 0 1 L 9 5 L 0 9 Z" fill="#a4afc8" stroke="none"/></marker>
          {paths.map((edge,i)=><mask key={`${edge.id}-${reveal.run}`} id={`hobby-reveal-${edge.id}`} maskUnits="userSpaceOnUse" x="-30" y="-30" width="800" height="500"><path className="hobby-edge-reveal" d={edge.d} pathLength="1" fill="none" stroke="white" strokeWidth="28" strokeLinecap="square" style={{'--edge-delay':`${i*.16}s`}}/></mask>)}
        </defs>
        {paths.map(edge=><path key={edge.id} d={edge.d} data-from={edge.from} data-to={edge.to} className={`hobby-edge${route.ids.includes(edge.id)?' is-active':''}`} markerEnd="url(#hobby-arrow)" mask={`url(#hobby-reveal-${edge.id})`}/>)}
        {pulse&&route.path&&<Signal key={pulse.sequence} path={route.path} duration={pulse.duration}/>}
      </svg>
      <div className="hobby-list">{hobbies.map((hobby,i)=><button key={hobby.id} type="button" style={{'--x':`${hobby.x}%`,'--y':`${hobby.y}%`}} className={`hobby-node${pulse?.index===i?' is-active':''}`} onClick={()=>activate(i)}>
        <span className="hobby-label">{hobby.label}</span>
        <span className="hobby-orb" aria-hidden="true"><span key={pulse?.index===i?pulse.sequence:0} className="hobby-emoji">{hobby.emoji}</span>{pulse?.index===i&&<span key={`ring-${pulse.sequence}`} className="hobby-ring"/>}</span>
      </button>)}</div>
      <button type="button" ref={target} className={`hobby-target${activeNodes.includes('research')?' is-active':''}`} onClick={()=>activate('research')}><span>Research</span></button>
    </div>
  </section>;
}
