import { useEffect, useState } from 'react';
import { ArrowRightIcon, ArrowTopRightIcon } from '@radix-ui/react-icons';

// Adapted from the owner's original SVG navigation and edgePath routine:
// https://euijongsong.github.io/ (retrieved 2026-10-22).
// Preserve its topology; apply the selected mock's layout and native anchors.
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
function DAG({showPapers}) {
  return <nav className="dag" aria-label="DAG navigation"><svg viewBox="0 0 520 280" aria-label="Navigation graph">
    <defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 1 L 9 5 L 0 9" fill="currentColor"/></marker></defs>
    <g className="edges" aria-hidden="true">
      {edges.map(([f,t,c])=>{const a=nodes[f],b=nodes[t];return <path key={f+t} d={edgePath([a.x,a.y],[b.x,b.y],c,a.w/2,a.h/2,b.w/2,b.h/2)} markerEnd="url(#arr)"/>;})}
      {['research','papers'].map(t=>{const b=nodes[t];return <path key={t} className="latent-edge" d={edgePath([42,216],[b.x,b.y],0,36,36,b.w/2,b.h/2)} markerEnd="url(#arr)"/>;})}
    </g>
    {Object.entries(nodes).map(([key,n])=><a key={key} href={`#${key}`} className="dag-node" aria-label={`Go to ${n.label}`} onClick={key==='papers'?showPapers:undefined}>
      <rect className="hit-area" x={n.x-n.w/2-2} y={n.y-42} width={n.w+4} height="84" rx="24"/>
      <rect className="node-outline" x={n.x-n.w/2} y={n.y-n.h/2} width={n.w} height={n.h} rx={n.h/2}/><text x={n.x} y={n.y}>{n.label}</text>
    </a>)}
    <a href="#unobserved" className="dag-node latent" aria-label="Go to Unobserved"><circle className="hit-area" cx="42" cy="216" r="42"/><circle className="node-outline" cx="42" cy="216" r="36"/><text x="42" y="216">U</text></a>
  </svg></nav>;
}
const publications=[
  {title:'Local Fisher Information Enables Sparse Causal Discovery',authors:['Euijong Song','Byeongguk Kang','Donghyeon Lee','Gunwoong Park'],venue:'Preprint · 2026',href:'https://arxiv.org/abs/2610.04291',link:'arXiv'},
  {title:'Discrete Score Matching Enables Causal Discovery from Count Data',authors:['Euijong Song','Hyewon Park','Gunwoong Park'],venue:'Preprint · 2026',href:'https://arxiv.org/abs/2609.39326',link:'arXiv'},
  {title:'Convex Distance Operator Transport: A Convex and Geometry-Preserving Formulation',authors:['Junhyoung Chung','Euijong Song','Won Hwa Kim','Gunwoong Park'],venue:'ICML · 2026',href:'https://openreview.net/forum?id=nPC7M7XLEv',link:'OpenReview'},
  {title:'Identifiability of Measurement-Error Variance in Errors-in-Variables Regression',authors:['Donguk Shin','Seunghwan Noh','Euijong Song','Gunwoong Park'],venue:'Under revision'},
  {title:'Plants recognize identity and intensity of herbivores to adaptively reconfigure metabolism',authors:['Min-Soo Choi','Myungju Go','Hyeok Gyun Son','Donguk Shin','Euijong Song','Jong-Hoon Noh','Gwanhyeong Yu','Yoonkyoung Choi','Gunwoong Park','Youngsung Joo'],venue:'Nature Communications · 2026',href:'https://www.nature.com/articles/s41467-026-77688-6',link:'Journal'},
];
function Paper({paper}) {
  return <article className="paper"><h3>{paper.href?<a href={paper.href} target="_blank" rel="noreferrer">{paper.title}</a>:paper.title}</h3>
    <p className="authors">{paper.authors.map((author,i)=><span key={author}>{author==='Euijong Song'?<strong>{author}</strong>:author}{i<paper.authors.length-1?',\u00a0':''}</span>)}</p>
    <p className="paper-meta"><span>{paper.venue}</span>{paper.href&&<a href={paper.href} target="_blank" rel="noreferrer" aria-label={`${paper.link}: ${paper.title}`}>{paper.link}<ArrowTopRightIcon aria-hidden="true"/></a>}</p>
  </article>;
}
export function App() {
  const [allPapers,setAllPapers]=useState(false);
  useEffect(()=>{
    const followHash=()=>{
      const hash=window.location.hash.slice(1);
      if(!hash) return;
      const targetId=hash.startsWith('sec-')?hash.slice(4):hash;
      const target=document.getElementById(targetId==='top'?'about':targetId);
      if(!target) return;
      if(targetId==='papers') setAllPapers(true);
      if(hash!==targetId) window.history.replaceState(null,'',`#${targetId}`);
      window.requestAnimationFrame(()=>{
        target.scrollIntoView({block:'start'});
        target.focus({preventScroll:true});
      });
    };
    followHash();
    window.addEventListener('hashchange',followHash);
    return ()=>window.removeEventListener('hashchange',followHash);
  },[]);
  return <><a className="skip-link" href="#about">Skip to introduction</a><div className="page">
    <header><h1>Euijong Song <span lang="ko">송의종</span></h1></header><main>
    <div className="hero"><section id="about" tabIndex="-1" className="biography" aria-label="About Euijong Song">
      <p>I’m a Ph.D. student in statistics at Seoul National University and a member of the Causal AI Lab, where I’m advised by <span className="keep-together">Professor Gunwoong Park.</span></p>
      <div id="research" tabIndex="-1" aria-label="Research interests"><p>My research focuses on making non-identifiable statistical objects identifiable under realistic assumptions. I study structural causal models beyond additive noise and develop deep-learning methods for causal discovery.</p>
      <p>Recently, I’ve also been interested in identifiability in measurement error models.</p></div>
    </section><DAG showPapers={()=>setAllPapers(true)}/></div>
    <section id="papers" tabIndex="-1" className="papers" aria-labelledby="papers-title"><div className="section-heading"><h2 id="papers-title">{allPapers?'Papers':'Recent papers'}</h2><button className="text-button" onClick={()=>setAllPapers(!allPapers)} aria-expanded={allPapers} aria-controls="additional-papers">{allPapers?'Recent only':'All papers'}<ArrowRightIcon aria-hidden="true"/></button></div>
      {publications.slice(0,2).map(paper=><Paper key={paper.title} paper={paper}/>)}<div id="additional-papers" hidden={!allPapers}>{publications.slice(2).map(paper=><Paper key={paper.title} paper={paper}/>)}</div>
    </section>
    <section id="cv" className="lower-section" tabIndex="-1" aria-labelledby="cv-title"><h2 id="cv-title">CV</h2><h3>Education</h3>
      <dl className="cv-list"><div><dt>2024 – Present</dt><dd>Ph.D. Student, Statistics, Seoul National University<small>Integrated M.S.–Ph.D. program · Causal AI Lab<br/>Advisor: Professor Gunwoong Park</small></dd></div><div><dt>2019 – 2024</dt><dd>B.S. in Life Sciences, Konkuk University</dd></div></dl>
      <h3>Projects</h3><dl className="cv-list"><div><dt>2024</dt><dd>Mountain Accident Risk Zone Prediction<small>Korean National Fire Agency</small></dd></div></dl>
      <h3>Talks</h3><dl className="cv-list"><div><dt>2025</dt><dd>Outlier-Robust Approach for High-dimensional Linear Structural Equation Models<small>Kyushu University / SNU Statistics DS Workshop</small></dd></div><div><dt>2025</dt><dd>Outlier Robust Causal Discovery<small>LG Electronics CTO Seminar for Research Engineers</small></dd></div></dl>
      <h3>Skills &amp; languages</h3><p>Python, R, MATLAB, <span className="latex-logo" role="img" aria-label="LaTeX"><span aria-hidden="true">L<span className="latex-a">A</span>T<span className="latex-e">E</span>X</span></span></p><p>Korean (native), English (fluent), Japanese (intermediate)</p>
    </section>
    <section id="unobserved" className="lower-section" tabIndex="-1" aria-labelledby="unobserved-title"><h2 id="unobserved-title">Unobserved</h2><p>Outside research: table tennis, tennis, climbing, good eats, and travel.</p></section>
    <section id="contact" className="lower-section contact" tabIndex="-1" aria-labelledby="contact-title"><h2 id="contact-title">Contact</h2><a href="mailto:brejsong@snu.ac.kr">brejsong@snu.ac.kr</a><div className="socials"><a href="https://scholar.google.com/citations?hl=en&user=JBpCyZYAAAAJ" target="_blank" rel="noreferrer">Scholar</a><a href="https://github.com/euijongsong" target="_blank" rel="noreferrer">GitHub</a></div></section>
    </main><footer><a href="#about">Back to top</a></footer>
  </div></>;
}
