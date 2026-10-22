import { useEffect, useRef, useState } from 'react';
import { ArrowTopRightIcon } from '@radix-ui/react-icons';
import { DAG, Unobserved } from './Graphs.jsx';

const publications=[
  {title:'Local Fisher Information Enables Sparse Causal Discovery',authors:['Euijong Song','Byeongguk Kang','Donghyeon Lee','Gunwoong Park'],venue:'Preprint · 2026',href:'https://arxiv.org/abs/2610.04291',link:'arXiv'},
  {title:'Discrete Score Matching Enables Causal Discovery from Count Data',authors:['Euijong Song','Hyewon Park','Gunwoong Park'],venue:'Preprint · 2026',href:'https://arxiv.org/abs/2609.39326',link:'arXiv'},
  {title:'Convex Distance Operator Transport: A Convex and Geometry-Preserving Formulation',authors:['Junhyoung Chung','Euijong Song','Won Hwa Kim','Gunwoong Park'],venue:'ICML · 2026',href:'https://openreview.net/forum?id=nPC7M7XLEv',link:'OpenReview'},
  {title:'Plants recognize identity and intensity of herbivores to adaptively reconfigure metabolism',authors:['Min-Soo Choi','Myungju Go','Hyeok Gyun Son','Donguk Shin','Euijong Song','Jong-Hoon Noh','Gwanhyeong Yu','Yoonkyoung Choi','Gunwoong Park','Youngsung Joo'],venue:'Nature Communications · 2026',href:'https://www.nature.com/articles/s41467-026-77688-6',link:'Journal'},
  {title:'Identifiability of Measurement-Error Variance in Errors-in-Variables Regression',authors:['Donguk Shin','Seunghwan Noh','Euijong Song','Gunwoong Park'],venue:'Under revision'},
];
function Paper({paper}) {
  return <article className="paper"><h3>{paper.href?<a href={paper.href} target="_blank" rel="noreferrer">{paper.title}</a>:paper.title}</h3>
    <p className="authors">{paper.authors.map((author,i)=><span key={author}>{author==='Euijong Song'?<strong>{author}</strong>:author}{i<paper.authors.length-1?',\u00a0':''}</span>)}</p>
    <p className="paper-meta"><span>{paper.venue}</span>{paper.href&&<a href={paper.href} target="_blank" rel="noreferrer" aria-label={`${paper.link}: ${paper.title}`}>{paper.link}<ArrowTopRightIcon aria-hidden="true"/></a>}</p>
  </article>;
}
export function App() {
  const [observed,setObserved]=useState(false);
  const [hobbyReveal,setHobbyReveal]=useState(0);
  const observeTimer=useRef(null);
  useEffect(()=>{
    const followHash=(animate=false)=>{
      const hash=window.location.hash.slice(1);
      if(!hash) return;
      const targetId=hash.startsWith('sec-')?hash.slice(4):hash;
      const target=document.getElementById(targetId==='top'?'about':targetId);
      if(!target) return;
      if(targetId==='unobserved') setObserved(true);
      if(hash!==targetId) window.history.replaceState(null,'',`#${targetId}`);
      window.requestAnimationFrame(()=>{
        const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({block:'start',behavior:animate&&!reduced?'smooth':'instant'});
        target.focus({preventScroll:true});
      });
    };
    followHash();
    const onHashChange=()=>followHash(true);
    window.addEventListener('hashchange',onHashChange);
    const watcher=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)) {setObserved(true);watcher.disconnect();}
    },{threshold:.25});
    watcher.observe(document.getElementById('unobserved'));
    return ()=>{window.removeEventListener('hashchange',onHashChange);watcher.disconnect();clearTimeout(observeTimer.current);};
  },[]);
  const observeU=event=>{
    if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey) return;
    event.preventDefault();
    setObserved(true);
    setHobbyReveal(value=>value+1);
    clearTimeout(observeTimer.current);
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    observeTimer.current=setTimeout(()=>{
      if(window.location.hash!=='#unobserved') window.location.hash='unobserved';
      else {
        const section=document.getElementById('unobserved');
        section.scrollIntoView({block:'start',behavior:reduced?'instant':'smooth'});
        section.focus({preventScroll:true});
      }
    },reduced?0:380);
  };
  return <><a className="skip-link" href="#about">Skip to introduction</a><div className="page">
    <header><h1>Euijong Song <span lang="ko">송의종</span></h1></header><main>
    <div className="hero"><section id="about" tabIndex="-1" className="biography" aria-label="About Euijong Song">
      <p>I’m a Ph.D. student in statistics at Seoul National University and a member of the Causal AI Lab, where I’m advised by <span className="keep-together">Professor Gunwoong Park.</span></p>
      <div id="research" tabIndex="-1" aria-label="Research interests"><p>My research focuses on making <span className="keep-together">non-identifiable</span> statistical objects identifiable under realistic assumptions. I study structural causal models beyond additive noise and develop <span className="keep-together">deep-learning</span> methods for causal discovery.</p>
      <p>Recently, I’ve also been interested in identifiability in measurement error models.</p></div>
    </section><DAG observed={observed} onObserve={observeU}/></div>
    <section id="papers" tabIndex="-1" className="papers" aria-labelledby="papers-title"><div className="section-heading"><h2 id="papers-title">Papers</h2></div>
      {publications.map(paper=><Paper key={paper.title} paper={paper}/>)}
    </section>
    <section id="cv" className="lower-section" tabIndex="-1" aria-labelledby="cv-title"><h2 id="cv-title">CV</h2><h3>Education</h3>
      <dl className="cv-list"><div><dt>2024 – Present</dt><dd>Ph.D. Student, Statistics, Seoul National University<small>Integrated M.S.–Ph.D. program · Causal AI Lab<br/>Advisor: Professor Gunwoong Park</small></dd></div><div><dt>2019 – 2024</dt><dd>B.S. in Life Sciences, Konkuk University</dd></div></dl>
      <h3>Projects</h3><dl className="cv-list"><div><dt>2024</dt><dd>Mountain Accident Risk Zone Prediction<small>Korean National Fire Agency</small></dd></div></dl>
      <h3>Talks</h3><dl className="cv-list"><div><dt>2025</dt><dd>Outlier-Robust Approach for High-dimensional Linear Structural Equation Models<small>Kyushu University / SNU Statistics DS Workshop</small></dd></div><div><dt>2025</dt><dd>Outlier Robust Causal Discovery<small>LG Electronics CTO Seminar for Research Engineers</small></dd></div></dl>
      <h3>Skills &amp; languages</h3><p>Python, R, MATLAB, <span className="latex-logo" role="img" aria-label="LaTeX"><span aria-hidden="true">L<span className="latex-a">A</span>T<span className="latex-e">E</span>X</span></span></p><p>Korean (native), English (fluent), Japanese (intermediate)</p>
    </section>
    <Unobserved revealKey={hobbyReveal}/>
    <section id="contact" className="lower-section contact" tabIndex="-1" aria-labelledby="contact-title"><h2 id="contact-title">Contact</h2><a href="mailto:brejsong@snu.ac.kr">brejsong@snu.ac.kr</a><div className="socials"><a href="https://scholar.google.com/citations?hl=en&user=JBpCyZYAAAAJ" target="_blank" rel="noreferrer">Scholar</a><a href="https://github.com/euijongsong" target="_blank" rel="noreferrer">GitHub</a></div></section>
    </main><footer><a href="#about">Back to top</a></footer>
  </div></>;
}
