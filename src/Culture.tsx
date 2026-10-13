import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, CaretDown, MagnifyingGlassPlus, X } from '@phosphor-icons/react';
import type { Artwork, Culture as CultureData } from './culture-types';
import { numberFor, workFor } from './edition';
import './culture.css';

type ChapterEntry={id:string;work:string;number:number;title:string};
function chapterLabel(entry:ChapterEntry){return `${workFor(entry.work).unit} ${numberFor(entry.work,entry.number)}`;}
function Chapters({ids,library}:{ids:string[];library:ChapterEntry[]}){
  return <div className="culture-chapter-links">{ids.map(id=>{const entry=library.find(c=>c.id===id);return entry&&<a key={id} href={`/read/${id}`}>{chapterLabel(entry)} <ArrowUpRight size={14}/></a>;})}</div>;
}
function Credits({art}:{art:Artwork}){return <p className="art-credit">{art.rights.credit} <a href={art.rights.url}>{art.rights.label}</a>.</p>;}

export function CulturePreview({data}:{data:CultureData}){
  const art=data.artworks.find(a=>a.id===data.featured)!;
  return <section className="culture-preview" aria-labelledby="culture-preview-title"><figure><a href="/culture"><img src={art.image.thumbnail??art.image.src} alt={art.image.alt} width={art.image.width} height={art.image.height} loading="lazy"/></a><figcaption>{art.artist}, <cite>{art.title}</cite>, {art.date}.</figcaption></figure><div><p className="culture-eyebrow">Art & culture</p><h2 id="culture-preview-title">Another way<br/>into the story.</h2><p>{data.description}</p><a className="text-link" href="/culture">Explore the collection <ArrowRight size={19}/></a></div></section>;
}

export default function Culture({data,path,library}:{data:CultureData;path:string;library:ChapterEntry[]}){
  const [kind,setKind]=useState('all');
  const [book,setBook]=useState('all');
  const [expanded,setExpanded]=useState(false);
  const [zoomed,setZoomed]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);
  const closeButton=useRef<HTMLButtonElement>(null);
  const id=path.startsWith('/culture/')?path.slice('/culture/'.length):null;
  const art=data.artworks.find(a=>a.id===id);
  const featured=data.artworks.find(a=>a.id===data.featured)!;
  const filtered=data.artworks.filter(a=>(kind==='all'||a.kind===kind)&&(book==='all'||a.chapterIds.includes(book)));
  useEffect(()=>{setExpanded(false);},[path]);
  useEffect(()=>{const d=dialog.current;if(!d)return;if(expanded&&!d.open){setZoomed(false);d.showModal();closeButton.current?.focus();}else if(!expanded&&d.open)d.close();},[expanded]);
  if(id&&!art)return <main id="main" className="message-page"><h1>This work isn’t in the collection.</h1><a href="/culture">Return to art & culture</a></main>;
  if(art)return <main id="main" className="art-detail" tabIndex={-1}>
    <a href="/culture#artworks" className="back-link"><ArrowLeft size={17}/>Art & culture</a>
    <header className="art-heading"><p className="culture-eyebrow">{art.relationship==='episode'?'The story in images':'Material culture'}</p><h1 tabIndex={-1}>{art.title}</h1><p>{art.artist} · {art.date}</p></header>
    <figure className="art-plate"><button className="art-enlarge" onClick={()=>setExpanded(true)} aria-label={`Enlarge ${art.title}`}><img src={art.image.src} alt={art.image.alt} width={art.image.width} height={art.image.height} fetchPriority="high"/><span><MagnifyingGlassPlus size={17}/>Enlarge artwork</span></button><figcaption><span>{art.medium} · {art.collection}{art.accession?` · ${art.accession}`:''}</span><Credits art={art}/></figcaption></figure>
    <div className="art-essay-layout"><aside className="art-facts"><p>{art.summary}</p><h2>Read alongside</h2><Chapters ids={art.chapterIds} library={library}/><p className="art-relationship">{art.relationship==='episode'?'An artistic retelling of an episode.':'A cultural comparison; this object does not depict this episode.'}</p><h2>Collection & sources</h2>{art.sources.map(s=><a key={s.url} href={s.url}>{s.label} <ArrowUpRight size={13}/></a>)}</aside>
      <article className="prose art-essay"><section><h2>The work in its own time</h2><p>{art.context}</p></section><section><h2>Look closely</h2><p>{art.looking}</p></section><section><h2>Reading it with the text</h2><p className="art-reading-label">Interpretation</p><p>{art.reading}</p></section><section className="looking-question"><h2>A question to sit with</h2><p>{art.question}</p></section></article></div>
    <nav className="art-next" aria-label="Explore more art">{data.artworks.filter(a=>a.id!==art.id&&(a.chapterIds.some(c=>art.chapterIds.includes(c))||a.kind===art.kind)).slice(0,2).map(a=><a href={`/culture/${a.id}`} key={a.id}><img src={a.image.thumbnail??a.image.src} width={a.image.width} height={a.image.height} loading="lazy" alt=""/><span><small>{a.artist}</small>{a.title}<ArrowRight size={17}/></span></a>)}</nav>
    <dialog ref={dialog} className={`art-lightbox${zoomed?' is-zoomed':''}`} aria-label={`Enlarged artwork: ${art.title}`} onCancel={()=>setExpanded(false)} onClose={()=>setExpanded(false)} onClick={e=>{if(e.target===e.currentTarget)setExpanded(false);}}><button className="art-zoom-button" aria-pressed={zoomed} onClick={()=>setZoomed(z=>!z)}>{zoomed?'Fit to screen':'Zoom in'}</button><button ref={closeButton} className="icon-button" aria-label="Close enlarged artwork" onClick={()=>setExpanded(false)}><X size={24}/></button><figure><div className="art-zoom-stage" tabIndex={zoomed?0:undefined} role={zoomed?'region':undefined} aria-label={zoomed?'Scrollable artwork detail':undefined}><img src={art.image.src} width={art.image.width} height={art.image.height} alt={art.image.alt}/></div><figcaption>{art.title} · {art.artist}<Credits art={art}/></figcaption></figure></dialog>
  </main>;
  return <main id="main" className="culture-page" tabIndex={-1}>
    <header className="culture-heading"><a href="/" className="back-link"><ArrowLeft size={16}/>The reading edition</a><h1 tabIndex={-1}>{data.title}</h1><p>{data.description}</p><nav className="culture-navigation" aria-label="Art and culture sections"><a href="/culture#artworks">The artworks</a><a href="/culture#world">The world of the book</a><a href="/culture#books">Book by book</a></nav></header>
    <figure className="culture-feature"><a href={`/culture/${featured.id}`}><img src={featured.image.src} width={featured.image.width} height={featured.image.height} alt={featured.image.alt} fetchPriority="high"/></a><figcaption><span>{featured.artist}, <cite>{featured.title}</cite>, {featured.date}.</span><a href={`/culture/${featured.id}`}>Look closer <ArrowUpRight size={15}/></a></figcaption></figure>
    <div className="culture-introduction prose">{data.introduction.map(p=><p key={p}>{p}</p>)}</div>
    <section id="artworks" className="culture-gallery" tabIndex={-1} aria-labelledby="artworks-title"><h2 id="artworks-title">The artworks</h2><div className="gallery-controls"><div className="work-tabs" aria-label="Artwork type">{[['all','All works'],['painting','Paintings & prints'],['object','Objects & manuscripts']].map(([value,label])=><button key={value} aria-pressed={kind===value} onClick={()=>setKind(value)}>{label}</button>)}</div><label className="art-book-filter">Read alongside<select aria-label="Filter artworks by book" value={book} onChange={e=>setBook(e.target.value)}><option value="all">The whole work</option>{data.chapters.map(c=>{const entry=library.find(e=>e.id===c.chapterId)!;return <option key={entry.id} value={entry.id}>{chapterLabel(entry)}</option>;})}</select></label></div><p className="gallery-result" role="status">{filtered.length} {filtered.length===1?'work':'works'}{book!=='all'?' connected to this book':''}</p>
      {filtered.length?<div className="art-grid">{filtered.map(a=><figure key={a.id} className={`gallery-work ${a.kind}`}><a href={`/culture/${a.id}`}><div className="art-image"><img src={a.image.thumbnail??a.image.src} width={a.image.width} height={a.image.height} alt={a.image.alt} loading="lazy"/></div><figcaption><p>{a.artist} · {a.date}</p><h3>{a.title}<ArrowUpRight size={19}/></h3><span>{a.summary}</span></figcaption></a></figure>)}</div>:<div className="gallery-empty"><p>No works match this combination. The book-by-book guide still offers cultural context for every chapter.</p><button className="text-link" onClick={()=>{setKind('all');setBook('all');}}>Show all works <ArrowRight size={17}/></button></div>}
    </section>
    <section id="world" className="culture-world" tabIndex={-1} aria-labelledby="world-title"><header><h2 id="world-title">The world of the book</h2><p>Cultural themes that travel through the story, connecting everyday practices, images, and ideas to the text.</p></header><div className="cultural-themes">{data.themes.map(theme=><details key={theme.id} id={`theme-${theme.id}`}><summary><span><strong>{theme.title}</strong><span>{theme.lead}</span></span><CaretDown size={22}/></summary><div className="theme-body prose">{theme.paragraphs.map(p=><p key={p}>{p}</p>)}<Chapters ids={theme.chapterIds} library={library}/><p className="theme-sources">Sources: {theme.sources.map((s,i)=><span key={s.url}>{i>0?' · ':''}<a href={s.url}>{s.label}</a></span>)}</p></div></details>)}</div></section>
    <section id="books" className="culture-books" tabIndex={-1} aria-labelledby="books-title"><header><h2 id="books-title">Culture, book by book</h2><p>A cultural thread through the whole work. Links lead back to the complete text; the connections below are reading prompts, not claims that every object illustrates the text.</p></header><div className="culture-book-grid">{data.chapters.map(c=>{const entry=library.find(e=>e.id===c.chapterId)!;const connected=data.artworks.filter(a=>a.chapterIds.includes(c.chapterId));return <article id={`culture-${c.chapterId}`} tabIndex={-1} key={c.chapterId}><a className="culture-book-title" href={`/read/${c.chapterId}`}><span>{chapterLabel(entry)}</span><h3>{c.title}<ArrowUpRight size={17}/></h3></a><p>{c.text}</p>{connected.length>0&&<div className="book-art-links">{connected.map(a=><a key={a.id} href={`/culture/${a.id}`}>{a.title}</a>)}</div>}</article>;})}</div></section>
    <p className="culture-colophon">Artwork facts follow the linked collection records. Close-looking and literary connections are this edition’s interpretations. The objects and images belong to different historical worlds. The collection includes full-story spoilers.</p>
  </main>;
}
