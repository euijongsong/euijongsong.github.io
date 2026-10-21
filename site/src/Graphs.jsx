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
  {id:'table-tennis',label:'table tennis',emoji:'🏓'},
  {id:'tennis',label:'tennis',emoji:'🎾'},
  {id:'climbing',label:'climbing',emoji:'🧗'},
  {id:'good-eats',label:'good eats',emoji:'🍽️'},
  {id:'travel',label:'travel',emoji:'✈️'},
];
function Signal({path}) {
  const motion=useRef(null);
  useEffect(()=>{
    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches) motion.current?.beginElement();
  },[]);
  return <circle className="hobby-signal" r="3.5"><animateMotion ref={motion} begin="indefinite" dur=".7s" path={path} fill="freeze"/></circle>;
}
export function Unobserved() {
  const graph=useRef(null), target=useRef(null), timer=useRef(null), sequence=useRef(0);
  const [paths,setPaths]=useState([]);
  const [pulse,setPulse]=useState(null);
  useEffect(()=>{
    let mounted=true;
    const measure=()=>{
      if(!mounted) return;
      const bounds=graph.current.getBoundingClientRect(), end=target.current.getBoundingClientRect();
      const next=[...graph.current.querySelectorAll('.hobby-orb')].map((orb,i)=>{
        const start=orb.getBoundingClientRect();
        return `M ${start.right-bounds.left+5} ${start.top+start.height/2-bounds.top} L ${end.left-bounds.left-7} ${end.top+end.height/2-bounds.top+(i-2)*8}`;
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
    setPulse({index,sequence:++sequence.current});
    timer.current=setTimeout(()=>setPulse(null),1200);
  };
  return <section id="unobserved" className="lower-section unobserved" tabIndex="-1" aria-labelledby="unobserved-title">
    <h2 id="unobserved-title">Unobserved</h2>
    <p className="unobserved-note">The unseen forces behind my research.</p>
    <div className="hobby-graph" ref={graph} role="group" aria-label="Five hobbies connected to research">
      <svg className="hobby-edges" aria-hidden="true">
        <defs><marker id="hobby-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="context-stroke" strokeWidth="1.5"/></marker></defs>
        {paths.map((path,i)=><path key={hobbies[i].id} d={path} className={`hobby-edge${pulse?.index===i?' is-active':''}`} markerEnd="url(#hobby-arrow)"/>)}
        {pulse&&paths[pulse.index]&&<Signal key={pulse.sequence} path={paths[pulse.index]}/>}
      </svg>
      <div className="hobby-list">{hobbies.map((hobby,i)=><button key={hobby.id} type="button" className={`hobby-node${pulse?.index===i?' is-active':''}`} onClick={()=>activate(i)}>
        <span className="hobby-label">{hobby.label}</span>
        <span className="hobby-orb" aria-hidden="true"><span key={pulse?.index===i?pulse.sequence:0} className="hobby-emoji">{hobby.emoji}</span>{pulse?.index===i&&<span key={`ring-${pulse.sequence}`} className="hobby-ring"/>}</span>
      </button>)}</div>
      <div ref={target} className={`hobby-target${pulse?' is-active':''}`}><span key={pulse?.sequence??0}>Research</span></div>
    </div>
  </section>;
}
