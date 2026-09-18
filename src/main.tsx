import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookmarkSimple, BookOpen, CaretDown, Check, MagnifyingGlass, Moon, Sun, TextAa, X } from '@phosphor-icons/react';
import '@fontsource-variable/literata/standard.css';
import '@fontsource-variable/literata/standard-italic.css';
import '@fontsource-variable/manrope';
import './style.css';
import { edition, workFor, numberFor } from './edition';

type Section = {id:string;title:string;html:string;text:string};
type Entry = {id:string;work:string;number:number;title:string;words:number;minutes:number;quoteCount:number;search:string;sections:{id:string;title:string}[]};
type Chapter = Omit<Entry,'sections'> & {intro:string;sections:Section[];source:{text:string;paragraphs:string[];formatted:{html:string;verse:boolean}[]}|null};
type Quote = {id:string;chapterId:string;number:number;text:string};
type Place = {id:string;mode:'notes'|'text';section?:string;anchor:string;updated:number};
type Preferences = {theme:'day'|'night';size:number;font:'literata'|'classic'|'clear'};
const KEY=edition.site.storageKey;
const defaults:Preferences={theme:'day',size:20,font:'literata'};
function readStore<T>(key:string,fallback:T):T {try {const value=localStorage.getItem(`${KEY}-${key}`);return value?JSON.parse(value):fallback;}catch{return fallback;}}
function writeStore(key:string,value:unknown) {try{localStorage.setItem(`${KEY}-${key}`,JSON.stringify(value));return true;}catch{return false;}}
function route() {try{return decodeURI(location.pathname).replace(/\/$/,'')||'/';}catch{return location.pathname;}}
function label(e:Entry) {const work=workFor(e.work);return work.numbering==='none'?work.unit:`${work.unit} ${numberFor(e.work,e.number)}`;}
function readingTop(){const bar=document.querySelector('.reader-toolbar');return bar?Math.max(0,bar.getBoundingClientRect().bottom)+16:90;}


function App(){
  const [path,setPath]=useState(route);
  const [library,setLibrary]=useState<Entry[]>([]);
  const [quotes,setQuotes]=useState<Quote[]>([]);
  const [loadError,setLoadError]=useState(false);
  const [chapter,setChapter]=useState<Chapter|null>(null);
  const [chapterError,setChapterError]=useState(false);
  const [mode,setMode]=useState<'notes'|'text'>(location.hash && location.hash!=='#text'?'notes':'text');
  const [sectionId,setSectionId]=useState(location.hash.slice(1));
  const [bookmarks,setBookmarks]=useState<string[]>(()=>{const v=readStore<unknown>('bookmarks',[]);return Array.isArray(v)?v.filter((x):x is string=>typeof x==='string'):[];});
  const [notesOpen,setNotesOpen]=useState(false);
  const [preferences,setPreferences]=useState<Preferences>(()=>{const v=readStore('preferences',defaults);return {theme:v.theme==='night'?'night':'day',size:[18,20,22,24].includes(v.size)?v.size:20,font:['literata','classic','clear'].includes(v.font)?v.font:'literata'};});
  const [saved,setSaved]=useState<string[]>(()=>{const v=readStore<unknown>('saved',[]);return Array.isArray(v)?v.filter((x):x is string=>typeof x==='string'):[];});
  const [lastPlace,setLastPlace]=useState<Place|null>(()=>readStore('place',null));
  const [panel,setPanel]=useState<'contents'|'search'|'saved'|'type'|null>(null);
  const [query,setQuery]=useState('');
  const [collection,setCollection]=useState(edition.works[0].id);
  const [storageIssue,setStorageIssue]=useState(false);
  const [status,setStatus]=useState('');
  const dialogRef=useRef<HTMLDialogElement>(null);
  const searchRef=useRef<HTMLInputElement>(null);
  const articleRef=useRef<HTMLElement>(null);
  const restore=useRef<Place|null>(null);
  const focusHeading=useRef(false);
  const chapterId=path.startsWith('/read/')?path.slice(6):null;
  const current=library.find(e=>e.id===chapterId);

  function navigate(to:string, resume?:Place){
    if(!to.startsWith('/')) return;
    const [pathname,hash='']=to.split('#');
    const same=pathname===path;
    if(same&&hash==='main'){
      history.pushState({},'',to);focusHeading.current=false;
      document.getElementById('main')?.focus();document.getElementById('main')?.scrollIntoView();return;
    }
    restore.current=resume??null;
    focusHeading.current=true;
    history.pushState({},'',to);
    setPath(pathname);setSectionId(resume?.section??hash);
    setMode(resume?.mode??(hash&&hash!=='text'?'notes':'text'));
    setPanel(null);setNotesOpen(false);
    window.scrollTo({top:0,behavior:'instant'});
    if(same)requestAnimationFrame(()=>{
      if(location.pathname+location.hash!==to)return;
      const target=document.getElementById(hash||'chapter-title');
      target?.scrollIntoView({block:'start'});target?.focus({preventScroll:true});
    });
  }
  function selectView(id:string){navigate(`${path}#${id}`);}
  useEffect(()=>{
    const pop=()=>{restore.current=null;setPath(route());setPanel(null);setNotesOpen(false);const h=location.hash.slice(1);setSectionId(h);setMode(h&&h!=='text'?'notes':'text');window.scrollTo(0,0);};
    const keyboard=()=>document.documentElement.dataset.input='keyboard';
    const pointer=()=>document.documentElement.dataset.input='pointer';
    window.addEventListener('popstate',pop);window.addEventListener('keydown',keyboard,true);window.addEventListener('pointerdown',pointer,true);
    return()=>{window.removeEventListener('popstate',pop);window.removeEventListener('keydown',keyboard,true);window.removeEventListener('pointerdown',pointer,true);};
  },[]);
  useEffect(()=>{
    const c=new AbortController();
    Promise.all(['/content/library.json','/content/quotes.json'].map(url=>fetch(url,{signal:c.signal}).then(r=>{if(!r.ok)throw Error();return r.json();})))
      .then(([entries,passages])=>{setLibrary(entries);setQuotes(passages);}).catch(e=>{if(e.name!=='AbortError')setLoadError(true);});
    return()=>c.abort();
  },[]);
  useEffect(()=>{
    document.documentElement.dataset.theme=preferences.theme;
    document.documentElement.dataset.font=preferences.font;
    document.documentElement.style.setProperty('--reading-size',`${preferences.size}px`);
    if(!writeStore('preferences',preferences))setStorageIssue(true);
  },[preferences]);
  useEffect(()=>{
    if(!chapterId){setChapter(null);document.title=edition.site.title;return;}
    setChapter(null);setChapterError(false);
    const c=new AbortController();
    fetch(`/content/${encodeURIComponent(chapterId)}.json`,{signal:c.signal}).then(r=>{if(!r.ok)throw Error();return r.json();})
      .then((data:Chapter)=>{setChapter(data);if(!data.source)setMode('notes');document.title=`${label(data)}: ${data.title} · ${edition.site.name}`;})
      .catch(e=>{if(e.name!=='AbortError')setChapterError(true);});
    return()=>c.abort();
  },[chapterId]);
  useEffect(()=>{
    if(chapterId||!library.length)return;
    const frame=requestAnimationFrame(()=>{
      const target=location.hash?document.getElementById(location.hash.slice(1)):document.querySelector<HTMLElement>('main h1');
      if(target&&(location.hash||focusHeading.current)){target.tabIndex=-1;if(location.hash)target.scrollIntoView();target.focus({preventScroll:true});focusHeading.current=false;}
    });
    return()=>cancelAnimationFrame(frame);
  },[path,library.length,chapterId]);
  useEffect(()=>{
    const d=dialogRef.current;if(!d)return;
    if(panel&&!d.open){d.showModal();if(panel==='search')requestAnimationFrame(()=>searchRef.current?.focus());}
    if(!panel&&d.open)d.close();
    if(panel==='search')requestAnimationFrame(()=>searchRef.current?.focus());
  },[panel]);
  useEffect(()=>{
    if(!notesOpen)return;
    const outside=(e:PointerEvent)=>{if(!(e.target as HTMLElement).closest('.reader-toolbar'))setNotesOpen(false);};
    const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){setNotesOpen(false);document.querySelector<HTMLButtonElement>('[aria-controls="chapter-notes-menu"]')?.focus();}};
    window.addEventListener('pointerdown',outside);window.addEventListener('keydown',escape);
    return()=>{window.removeEventListener('pointerdown',outside);window.removeEventListener('keydown',escape);};
  },[notesOpen]);
  function changeAppearance(patch:Partial<Preferences>){
    const anchor=Array.from(articleRef.current?.querySelectorAll<HTMLElement>('p[id],h2[id]')??[]).find(e=>{const r=e.getBoundingClientRect();return r.bottom>readingTop()&&r.top<innerHeight;});
    const offset=anchor?.getBoundingClientRect().top;
    setPreferences(p=>({...p,...patch}));
    if(anchor&&offset!==undefined)requestAnimationFrame(()=>{document.fonts.ready.then(()=>requestAnimationFrame(()=>window.scrollBy({top:anchor.getBoundingClientRect().top-offset,behavior:'instant'})));});
  }
  const selectedSection=chapter?.sections.find(s=>s.id===sectionId)||chapter?.sections.find(s=>sectionId.startsWith('find-')&&s.text.toLowerCase().includes(decodeURIComponent(sectionId.slice(5)).toLowerCase()))||chapter?.sections.find(s=>{
    const match=sectionId.match(/-q(\d+)$/);if(!match)return false;
    const before=chapter.sections.slice(0,chapter.sections.indexOf(s)).reduce((n,x)=>n+(x.html.match(/<blockquote>/g)?.length??0),0);
    const count=s.html.match(/<blockquote>/g)?.length??0;
    return +match[1]>before&&+match[1]<=before+count;
  })||chapter?.sections[0];
  useEffect(()=>{
    if(!chapter||!articleRef.current)return;
    const article=articleRef.current;
    const paragraphs=Array.from(article.querySelectorAll<HTMLElement>('[data-reading-anchor], .prose p, .prose blockquote, .prose h2'));
    paragraphs.forEach((p,i)=>{if(!p.id)p.id=`${mode==='text'?'text':selectedSection?.id}-p${i}`;});
    let cancelled=false;
    let observer:IntersectionObserver|undefined;
    let resizeObserver:ResizeObserver|undefined;
    let frame=0;
    let previousAnchor='';
    const visible=new Set<HTMLElement>();
    const record=()=>{
      cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>{
        if(cancelled)return;
        const top=readingTop();
        const target=Array.from(visible).map(el=>({el,rect:el.getBoundingClientRect()})).filter(x=>x.rect.bottom>top&&x.rect.top<innerHeight).sort((a,b)=>a.rect.top-b.rect.top)[0]?.el;
        if(target&&target.id!==previousAnchor){
          previousAnchor=target.id;
          const place:Place={id:chapter.id,mode,section:mode==='notes'?selectedSection?.id:'text',anchor:target.id,updated:Date.now()};
          setLastPlace(place);if(!writeStore('place',place))setStorageIssue(true);
        }
      });
    };
    document.fonts.ready.then(()=>{
      if(cancelled)return;
      const prior=restore.current;
      if(prior&&prior.id===chapter.id){document.getElementById(prior.anchor)?.scrollIntoView({block:'start'});restore.current=null;}
      else if(location.hash){const target=document.getElementById(location.hash.slice(1));if(target){target.tabIndex=-1;target.scrollIntoView();target.focus({preventScroll:true});}}
      else if(focusHeading.current){document.getElementById('chapter-title')?.focus({preventScroll:true});focusHeading.current=false;}
      observer=new IntersectionObserver(entries=>{
        entries.forEach(e=>{if(e.isIntersecting)visible.add(e.target as HTMLElement);else visible.delete(e.target as HTMLElement);});record();
      },{threshold:0});
      paragraphs.forEach(p=>observer!.observe(p));
      resizeObserver=new ResizeObserver(record);resizeObserver.observe(article);
      window.addEventListener('scroll',record,{passive:true});window.addEventListener('resize',record);
    });
    return()=>{cancelled=true;cancelAnimationFrame(frame);observer?.disconnect();resizeObserver?.disconnect();window.removeEventListener('scroll',record);window.removeEventListener('resize',record);};
  },[chapter,mode,selectedSection?.id,sectionId,library.length]);
  useEffect(()=>{if(!status)return;const timeout=setTimeout(()=>setStatus(''),2200);return()=>clearTimeout(timeout);},[status]);

  function toggleBookmark(id:string){
    const next=bookmarks.includes(id)?bookmarks.filter(x=>x!==id):[...bookmarks,id];
    setBookmarks(next);if(!writeStore('bookmarks',next))setStorageIssue(true);
    setStatus(bookmarks.includes(id)?'Chapter bookmark removed':'Chapter bookmarked on this device');
  }
  function toggleSaved(id:string){
    setSaved(prev=>{const next=prev.includes(id)?prev.filter(x=>x!==id):[...prev,id];if(!writeStore('saved',next))setStorageIssue(true);setStatus(prev.includes(id)?'Passage removed':'Passage saved on this device');return next;});
  }
  function handleLinks(event:React.MouseEvent){
    const el=event.target as HTMLElement;
    const save=el.closest<HTMLButtonElement>('[data-save]');
    if(save){toggleSaved(save.dataset.save!);return;}
    const a=el.closest<HTMLAnchorElement>('a');
    if(a&&a.origin===location.origin&&!/^\/(texts|licenses|images)\//.test(a.pathname)&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();navigate(a.pathname+a.hash);}
  }
  const sameWork=library.filter(e=>e.work===current?.work);
  const currentIndex=sameWork.findIndex(e=>e.id===current?.id);
  const previous=sameWork[currentIndex-1];const next=sameWork[currentIndex+1];
  const isReader=!!chapterId;
  const filtered=library.filter(e=>e.work===collection);
  const results=query.trim()?library.filter(e=>(e.title+' '+e.search).toLowerCase().includes(query.toLowerCase().trim())):[];
  function sectionHtml(s:Section){let quoteIndex=chapter!.sections.slice(0,chapter!.sections.indexOf(s)).reduce((n,x)=>n+(x.html.match(/<blockquote>/g)?.length??0),0);return s.html.replace(/<blockquote>([\s\S]*?)<\/blockquote>/g,(_,inner)=>{const id=`${chapter!.id}-q${++quoteIndex}`;const selected=saved.includes(id);return `<figure class="passage" id="${id}" tabindex="-1"><blockquote>${inner}</blockquote><button type="button" class="save-passage${selected?' is-saved':''}" data-save="${id}" aria-pressed="${selected}">${selected?'Saved':'Save passage'}</button></figure>`;});}
  const activeWork=workFor(current?.work??collection);
  const workName=activeWork.title;
  const chosenWork=workFor(collection);

  return <div className={isReader?'site reading':'site'} onClick={handleLinks}>
    <a className="skip-link" href="#main">Skip to reading</a>
    <header className="masthead">
      <a className="wordmark" href="/" aria-label={`${edition.site.name}, home`}>{edition.site.wordmark??edition.site.name}<span className="wordmark-dot">.</span></a>
      <nav className="top-nav" aria-label="Main navigation">
        <button onClick={()=>{setCollection(edition.works[0].id);setPanel('contents');}}>Texts</button>
        {edition.navLink&&<a href={edition.navLink.href} className="comparison-nav">{edition.navLink.label}</a>}
        <button onClick={()=>setPanel('saved')} className="saved-nav" aria-label="Saved chapters and passages">Saved</button>
        <button onClick={()=>setPanel('search')} className="icon-button" aria-label="Search the reading edition"><MagnifyingGlass size={20}/></button>
        <button onClick={()=>setPanel('type')} className="icon-button type-button" aria-label="Reading appearance"><TextAa size={22}/></button>
      </nav>
    </header>

    {loadError?<main id="main" className="message-page"><h1>The edition could not load.</h1><p>Check your connection and try again. The complete texts are also available below.</p><button className="primary" onClick={()=>location.reload()}>Try again</button>{edition.downloads.map(d=><p key={d.href}><a href={d.href}>Download {d.label}</a></p>)}</main>:
      !library.length?<main id="main" className="loading-page" aria-label="Loading the reading edition"><div className="loading-line"/><div className="loading-line short"/><p>Opening the edition…</p></main>:
      path==='/'?<main id="main" tabIndex={-1}>
        <section className="cover" aria-labelledby="cover-title">
          <div className="title-leaf"><p className="author">{edition.cover.author}</p><h1 id="cover-title">{edition.cover.prefix&&<>{edition.cover.prefix}<br/></>}<em>{edition.cover.title}</em></h1><p className="cover-description">{edition.cover.description}</p><button className="begin-reading" onClick={()=>navigate(lastPlace?`/read/${lastPlace.id}`:`/read/${edition.cover.start}`,lastPlace??undefined)}>{lastPlace?'Continue reading':'Begin reading'}<ArrowRight size={22}/></button></div>
          <div className="sea-leaf">{edition.cover.image&&<img {...edition.cover.image} fetchPriority="high"/>}<div className="cover-caption"><span>A reading edition</span><span>{edition.cover.caption}</span></div></div>
        </section>
        <div className="edition-line"><span>{edition.cover.editionLine}</span><a href="/about">About this edition <ArrowUpRight size={14}/></a></div>
        {lastPlace&&<div className="resume-note"><BookOpen size={18}/><span>Your place is kept on this device: <a href={`/read/${lastPlace.id}`} onClick={e=>{e.preventDefault();e.stopPropagation();navigate(`/read/${lastPlace.id}`,lastPlace);}}>{library.find(x=>x.id===lastPlace.id)?.title??'Continue reading'}</a></span></div>}
        <section className="contents-section" aria-labelledby="contents-heading"><div className="section-heading"><h2 id="contents-heading">Contents</h2><div className="work-tabs" aria-label="Choose a work">{edition.works.map(w=><button key={w.id} aria-pressed={collection===w.id} onClick={()=>setCollection(w.id)}>{w.title}</button>)}</div></div>
          {chosenWork.groups?.length?<div className="contents-grid">{chosenWork.groups.map(({title:name,start,end})=><div className="chapter-group" key={name}><h3>{name}<span>{numberFor(collection,start)}–{numberFor(collection,end)}</span></h3>{filtered.filter(e=>e.number>=start&&e.number<=end).map(e=><ChapterLink key={e.id} entry={e}/>)}</div>)}</div>:<><p className="collection-note">{chosenWork.description}</p><div className="alternate-contents">{filtered.map(e=><ChapterLink key={e.id} entry={e}/>)}</div></>}
        </section>
        {edition.frontispiece&&<section className="frontispiece"><figure><img {...edition.frontispiece.image} loading="lazy"/><figcaption>{edition.frontispiece.caption} <a href="/about#images">Image credits</a></figcaption></figure><div><h2>{edition.frontispiece.title}</h2><p>{edition.frontispiece.description}</p><a className="text-link" href={edition.frontispiece.href}>{edition.frontispiece.linkLabel} <ArrowRight size={19}/></a></div></section>}
      </main>:
      path==='/about'?<About/>:
      isReader?<div className="reader-layout">
        <aside className="contents-rail" aria-label="Books in this work"><a className="back-link" href="/"><ArrowLeft size={16}/> The edition</a><h2>{workName}</h2><p>{activeWork.author}{activeWork.author?" · ":""}{sameWork.length} {activeWork.plural??`${activeWork.unit.toLowerCase()}s`}</p><nav>{sameWork.map(e=><a key={e.id} href={`/read/${e.id}`} aria-current={e.id===chapterId?'page':undefined}><span>{workFor(e.work).numbering==='none'?<BookOpen size={14}/>:numberFor(e.work,e.number)}</span><span>{e.title}</span></a>)}</nav><a className="rail-about" href="/about">Sources & edition notes</a></aside>
        <main id="main" className="reading-page" tabIndex={-1}>
          <nav className="reader-toolbar" aria-label="Chapter reading menu">
            <div className="mode-switch">
              {chapter?.source&&<button aria-pressed={mode==='text'} onClick={()=>selectView('text')}>Original text</button>}
              <button aria-pressed={mode==='notes'} aria-expanded={notesOpen} aria-controls="chapter-notes-menu" onClick={()=>setNotesOpen(o=>!o)}>Reading notes <CaretDown size={14}/></button>
            </div>
            <button className="icon-button" aria-label="Change reading appearance" onClick={()=>setPanel('type')}><TextAa size={22}/></button>
            {notesOpen&&<div id="chapter-notes-menu" className="chapter-notes-menu" onKeyDown={e=>{if(e.key==='Escape'){setNotesOpen(false);e.currentTarget.parentElement?.querySelector<HTMLButtonElement>('[aria-controls]')?.focus();}}}>
              <p>Reading notes</p>{chapter?.sections.map(s=><button key={s.id} aria-current={mode==='notes'&&selectedSection?.id===s.id?'page':undefined} onClick={()=>selectView(s.id)}><span>{sectionLabel(s.title)}</span><ArrowRight size={16}/></button>)}
            </div>}
          </nav>
          {chapterError?<div className="chapter-error"><h1>We couldn’t open this chapter.</h1><p>The link may be wrong, or your connection may have dropped.</p><a className="text-link" href="/">Return to contents <ArrowRight size={18}/></a></div>:!chapter?<div className="chapter-loading" aria-live="polite"><p>Opening the book…</p><div className="loading-line"/><div className="loading-line short"/></div>:<>
            <header className="chapter-heading"><div className="chapter-topline"><p className="chapter-number">{mode==='text'?workName:label(chapter)}</p><button className="chapter-bookmark" aria-pressed={bookmarks.includes(chapter.id)} onClick={()=>toggleBookmark(chapter.id)} aria-label={bookmarks.includes(chapter.id)?'Remove chapter bookmark':'Bookmark this chapter'}><BookmarkSimple size={21} weight={bookmarks.includes(chapter.id)?'fill':'regular'}/><span>{bookmarks.includes(chapter.id)?'Bookmarked':'Bookmark'}</span></button></div><h1 id="chapter-title" tabIndex={-1}>{mode==='text'?label(chapter):chapter.title}</h1><p className="chapter-meta">{mode==='notes'?`${chapter.minutes} minute commentary · ${chapter.quoteCount?`${chapter.quoteCount} selected passages`:'A reading companion'}`:activeWork.sourceLabel??activeWork.author}</p></header>
            <article ref={articleRef} className={`prose ${mode==='text'?'original-prose':''}`} aria-label={mode==='notes'?'Chapter commentary':'Original literary text'}>
              {mode==='text'&&chapter.source?<><div className="translation-note" id="text" tabIndex={-1}>{activeWork.sourceNote}<a href="/about">Edition notes</a></div>{chapter.source.formatted.map((p,i)=><p id={`original-${i}`} className={p.verse?'verse':undefined} data-reading-anchor key={i} dangerouslySetInnerHTML={{__html:p.html}}/>)}</>:<><details className="source-note"><summary>Text, sources & reading key <CaretDown size={14}/></summary><div dangerouslySetInnerHTML={{__html:chapter.intro}}/><p><span className="evidence-label">Text</span> marks what happens; <span className="evidence-label">Interpretation</span> marks an argued reading. Other labels identify context, comparisons and open questions. <a href="/about#reading-key">Full reading key</a></p></details>{selectedSection&&<section key={selectedSection.id} id={selectedSection.id} tabIndex={-1}><h2>{selectedSection.title}</h2><div dangerouslySetInnerHTML={{__html:sectionHtml(selectedSection)}}/></section>}</>}
            </article>
            <nav className="section-pagination" aria-label="Reading sections">{mode==='text'?<button onClick={()=>selectView(chapter.sections[0].id)}><span><small>Next in this chapter</small>Reading notes · {sectionLabel(chapter.sections[0].title)}</span><ArrowRight size={20}/></button>:<><button onClick={()=>{const index=chapter.sections.indexOf(selectedSection!);selectView(index>0?chapter.sections[index-1].id:chapter.source?'text':chapter.sections[0].id);}}><ArrowLeft size={18}/><span>{chapter.sections.indexOf(selectedSection!)>0?sectionLabel(chapter.sections[chapter.sections.indexOf(selectedSection!)-1].title):chapter.source?'Original text':'First section'}</span></button>{chapter.sections.indexOf(selectedSection!)<chapter.sections.length-1&&<button onClick={()=>selectView(chapter.sections[chapter.sections.indexOf(selectedSection!)+1].id)}><span><small>Next section</small>{sectionLabel(chapter.sections[chapter.sections.indexOf(selectedSection!)+1].title)}</span><ArrowRight size={20}/></button>}</>}</nav>
            <nav className="chapter-end" aria-label="Chapter navigation">{previous?<a href={`/read/${previous.id}`}><ArrowLeft size={18}/><span><small>Previous {workFor(previous.work).unit.toLowerCase()}</small>{previous.title}</span></a>:<a href="/"><ArrowLeft size={18}/>Contents</a>}{next?<a className="next-chapter" href={`/read/${next.id}`}><span><small>Next {workFor(next.work).unit.toLowerCase()}</small>{next.title}</span><ArrowRight size={20}/></a>:<a className="next-chapter" href={activeWork.endLink?.href??'/'}>{activeWork.endLink?.label??'Return to the edition'}<ArrowRight size={20}/></a>}</nav>
          </>}
        </main>
        <aside className="section-rail" aria-label="In this chapter"><span className="section-rail-title">In this {activeWork.unit.toLowerCase()}</span>{chapter?.source&&<button aria-current={mode==='text'?'page':undefined} onClick={()=>selectView('text')}>Original text</button>}<span className="notes-rail-label">Reading notes</span>{chapter?.sections.map(s=><button key={s.id} aria-current={mode==='notes'&&selectedSection?.id===s.id?'page':undefined} onClick={()=>selectView(s.id)}>{sectionLabel(s.title)}</button>)}<div className="rail-bottom"><button onClick={()=>setPanel('type')}><TextAa size={17}/> Reading appearance</button><a href="/about">About this edition</a></div></aside>
      </div>:<main id="main" className="message-page"><h1>This page isn’t in the edition.</h1><a className="text-link" href="/">Return to contents <ArrowRight size={18}/></a></main>}

    {!isReader&&<footer className="site-footer"><a className="wordmark" href="/">{edition.site.wordmark??edition.site.name}.</a><p>{edition.site.footer}</p><a href="/about">Sources & credits <ArrowUpRight size={15}/></a></footer>}
    <div className="live-status" role="status" aria-live="polite">{status}</div>
    {storageIssue&&<p className="storage-warning">Your browser isn’t saving preferences. Reading still works, but your place may not be kept.</p>}
    <dialog aria-labelledby="panel-title" ref={dialogRef} className={`reader-dialog ${panel==='type'?'appearance-dialog':''}`} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();setPanel(null);}}} onCancel={()=>setPanel(null)} onClose={()=>setPanel(null)} onClick={e=>{if(e.target===e.currentTarget)setPanel(null);}}>
      <div className="dialog-head"><h2 id="panel-title">{panel==='contents'?'Texts':panel==='search'?'Find a passage':panel==='saved'?'Your reading shelf':'Make yourself comfortable'}</h2><button className="icon-button close-dialog" aria-label="Close panel" onClick={()=>setPanel(null)}><X size={21}/></button></div>
      {panel==='contents'&&<><div className="work-tabs dialog-tabs">{edition.works.map(w=><button key={w.id} aria-pressed={collection===w.id} onClick={()=>setCollection(w.id)}>{w.title}</button>)}</div><div className="dialog-chapters">{filtered.map(e=><ChapterLink key={e.id} entry={e} active={e.id===chapterId}/>)}</div></>}
      {panel==='search'&&<><label className="search-label" htmlFor="edition-search">Search the commentary and chapter titles</label><div className="search-box"><MagnifyingGlass size={22}/><input ref={searchRef} id="edition-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={edition.site.searchPlaceholder??"Search this edition"} autoComplete="off"/></div><p className="search-count sr-only" role="status" aria-live="polite">{query.trim()?`${results.length} chapters found`:""}</p><div className="search-results">{!query.trim()?<p className="empty-note">Follow a name, a question, or an image through the books.</p>:results.length?<><p className="result-count">{results.length} {results.length===1?'chapter':'chapters'} found</p>{results.map(e=>{const at=e.search.indexOf(query.toLowerCase().trim());return <a key={e.id} href={`/read/${e.id}#find-${encodeURIComponent(query.trim())}`}><small>{workFor(e.work).title} · {label(e)}</small><h3>{e.title}</h3><p>{at>=0?'…'+e.search.slice(Math.max(0,at-50),at+180)+'…':e.title}</p></a>;})}</>:<p className="empty-note">No chapters found. Try a shorter phrase or another spelling.</p>}</div></>}
      {panel==='saved'&&<><p className="panel-explainer">Chapters and quotations kept on this device.</p><h3 className="shelf-heading">Bookmarked chapters</h3><div className="bookmarked-chapters">{bookmarks.length?library.filter(e=>bookmarks.includes(e.id)).map(e=><div key={e.id}><ChapterLink entry={e}/><button className="icon-button" aria-label={`Remove bookmark: ${e.title}`} onClick={()=>toggleBookmark(e.id)}><X size={17}/></button></div>):<p className="panel-explainer">Use Bookmark beside a chapter’s title to keep it here.</p>}</div><h3 className="shelf-heading">Saved quotations</h3><div className="saved-list">{saved.length?quotes.filter(q=>saved.includes(q.id)).map(q=><div key={q.id}><a href={`/read/${q.chapterId}#${q.id}`}><small>{library.find(e=>e.id===q.chapterId)?label(library.find(e=>e.id===q.chapterId)!):''}</small><blockquote>{q.text}</blockquote></a><button className="remove-saved" onClick={()=>toggleSaved(q.id)}>Remove</button></div>):<div className="empty-saved"><BookmarkSimple size={30}/><h3>A place for words<br/>you want to keep.</h3><p>Your saved passages will appear here.</p></div>}</div></>}
      {panel==='type'&&<div className="appearance-controls"><fieldset><legend>Typeface</legend><div className="font-options">{([['literata','Literata','Literary'],['classic','Georgia','Classic'],['clear','Manrope','Clear']] as const).map(([font,name,description])=><button key={font} className={`font-option font-${font}`} aria-label={`${name} typeface`} aria-pressed={preferences.font===font} onClick={()=>changeAppearance({font})}><span>Aa</span><strong>{name}</strong><small>{description}</small></button>)}</div></fieldset><fieldset><legend>Reading light</legend><div className="theme-options"><button className="day-option" aria-pressed={preferences.theme==='day'} onClick={()=>changeAppearance({theme:'day'})}><Sun size={22}/>Day{preferences.theme==='day'&&<Check size={17}/>}</button><button className="night-option" aria-pressed={preferences.theme==='night'} onClick={()=>changeAppearance({theme:'night'})}><Moon size={22}/>Night{preferences.theme==='night'&&<Check size={17}/>}</button></div></fieldset><fieldset><legend>Text size</legend><div className="size-options">{[18,20,22,24].map((size,i)=><button key={size} aria-pressed={preferences.size===size} aria-label={`${['Small','Standard','Large','Largest'][i]} text`} onClick={()=>changeAppearance({size})}><span style={{fontSize:size}}>Aa</span></button>)}</div></fieldset><p className="type-preview" style={{fontSize:preferences.size}}>{edition.site.typePreview??"A quiet page, a little time, and a story worth returning to."}</p><p className="panel-explainer">Your reading preferences stay on this device.</p></div>}
    </dialog>
  </div>;
}
function sectionLabel(title:string){return edition.sectionLabels?.[title]??title;}
function ChapterLink({entry,active=false}:{entry:Entry;active?:boolean}){return <a className={`chapter-link${active?' current':''}`} href={`/read/${entry.id}`} aria-current={active?'page':undefined}><span className="folio-number">{workFor(entry.work).numbering==='none'?<BookOpen size={17}/>:numberFor(entry.work,entry.number)}</span><span className="chapter-link-title">{entry.title}</span><ArrowUpRight size={17}/></a>;}
function About(){return <main id="main" tabIndex={-1} className="about-page"><a className="back-link" href="/"><ArrowLeft size={16}/>The edition</a><h1>{edition.about.title}</h1><div className="about-lede" dangerouslySetInnerHTML={{__html:edition.about.intro}}/><div className="prose">{edition.about.sections.map(section=><section key={section.id} id={section.id}><h2>{section.title}</h2><div dangerouslySetInnerHTML={{__html:section.html}}/></section>)}</div></main>;}

createRoot(document.getElementById('root')!).render(<App/>);
