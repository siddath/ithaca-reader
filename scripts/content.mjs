import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { decodeHTML } from 'entities';
import { marked } from 'marked';
import sanitize from 'sanitize-html';

const labels={T:'Text',C:'Context',I:'Interpretation',A:'Another reading',M:'Comparison',U:'Open question'};
export const plain=s=>s.replace(/<[^>]+>/g,' ').replace(/\[[A-Z/]+\]/g,'').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/[*_`#]/g,'').replace(/\s+/g,' ').trim();
const slug=s=>plain(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const normalize=s=>s.replace(/\s+/g,' ').trim();
const idPattern=/^[a-z0-9][a-z0-9-]*$/;
function safeLink(value){return typeof value==='string'&&(value.startsWith('/')&&!value.startsWith('//')||/^https?:\/\//.test(value))&&!/[\\\x00-\x20]/.test(value);}

export function fileInside(root,relative){
  if(typeof relative!=='string'||path.isAbsolute(relative))throw Error(`Expected a relative edition path: ${relative}`);
  const resolved=fs.realpathSync(path.resolve(root,relative));
  if(resolved!==root&&!resolved.startsWith(root+path.sep))throw Error(`Path escapes edition: ${relative}`);
  return resolved;
}
function render(md){
  return sanitize(marked.parse(md.replace(/\[([TCIAMU](?:\/[TCIAMU])*)\]/g,(_,keys)=>`<span class="evidence-label">${keys.split('/').map(k=>labels[k]).join(' · ')}</span>`)),{
    allowedTags:sanitize.defaults.allowedTags.concat(['span','img','figure','figcaption']),
    allowedAttributes:{...sanitize.defaults.allowedAttributes,a:['href','title'],span:['class'],img:['src','alt','width','height','loading']},
    allowedSchemes:['http','https'],allowProtocolRelative:false,
  });
}
export function splitNotes(md){
  const rawTitle=md.match(/^# (.+)$/m)?.[1]??'Untitled';
  const chunks=md.replace(/^# .*\n/,'').split(/^## /m);const intro=chunks.shift()??'';
  const sections=chunks.map((block,i)=>{
    const lines=block.split('\n');const heading=lines.shift()??'';const explicit=heading.match(/\s+\{#([a-z0-9-]+)\}$/);
    const title=plain(heading.replace(/\s+\{#[a-z0-9-]+\}$/,''));
    return {id:explicit?.[1]??`s${i+1}-${slug(title)}`,title,html:render(lines.join('\n')),text:plain(lines.join('\n'))};
  });
  if(new Set(sections.map(s=>s.id)).size!==sections.length)throw Error('Duplicate section IDs');
  return {title:plain(rawTitle.replace(/^(Book|Episode) [IVXLC0-9]+\s*[—–-]\s*/,'')),intro:render(intro),sections};
}
export function formatSource(text){
  const blocks=text.trim().split(/\n\s*\n/);
  return {text,paragraphs:blocks.map(p=>p.replace(/\n/g,' ').trim()),formatted:blocks.map(p=>{
    const verse=p.split('\n').every(line=>/^ {2,}/.test(line));
    const content=verse?p.split('\n').map(line=>line.trim()).join('\n'):p.replace(/\n/g,' ').trim();
    return {verse,html:esc(content).replace(/_([^_]+)_/g,'<em>$1</em>').replace(/\n/g,'<br/>')};
  })};
}
export function compileEdition(manifest){
  const filename=fs.realpathSync(manifest);const root=path.dirname(filename);const config=JSON.parse(fs.readFileSync(filename,'utf8'));
  if(config.checksums){
    const records=JSON.parse(fs.readFileSync(fileInside(root,config.checksums),'utf8'));
    if(!Array.isArray(records)||!records.length)throw Error('checksums must contain file records');
    for(const record of records){
      const bytes=fs.readFileSync(fileInside(root,record.path));
      if(bytes.length!==record.bytes||createHash('sha256').update(bytes).digest('hex')!==record.sha256)throw Error(`Source checksum mismatch: ${record.path}`);
    }
  }
  if(config.version!==1)throw Error('edition.version must be 1');
  if(!config.site?.name||!config.site?.storageKey||!config.site?.title||!config.site?.description)throw Error('site requires name, title, description and storageKey');
  if(config.site.direction&&!['ltr','rtl'].includes(config.site.direction))throw Error('site.direction must be ltr or rtl');
  for(const link of [config.navLink,config.frontispiece,...(config.works??[]).map(w=>w.endLink)].filter(Boolean))if(!safeLink(link.href))throw Error('Navigation links must be absolute site paths or http(s) URLs');
  for(const image of [config.cover?.image,config.frontispiece?.image].filter(Boolean))if(!safeLink(image.src)||!image.src.startsWith('/images/')||!image.alt||!(image.width>0)||!(image.height>0))throw Error('Images require a local /images/ path, alt text and dimensions');
  if(!Array.isArray(config.works)||!config.works.length)throw Error('At least one work is required');
  if(!Array.isArray(config.chapters)||!config.chapters.length)throw Error('At least one chapter is required');
  const ids=new Set();const works=new Map();
  for(const work of config.works){
    if(!idPattern.test(work.id)||works.has(work.id))throw Error(`Invalid/duplicate work ID: ${work.id}`);
    if(!work.title||!work.unit||!['roman','arabic','none'].includes(work.numbering))throw Error(`Work ${work.id} requires title, unit and numbering`);
    works.set(work.id,work);
  }
  for(const chapter of config.chapters){
    if(!idPattern.test(chapter.id)||['library','quotes','edition'].includes(chapter.id)||ids.has(chapter.id))throw Error(`Invalid/duplicate/reserved chapter ID: ${chapter.id}`);
    if(!works.has(chapter.work)||!Number.isInteger(chapter.number)||chapter.number<1)throw Error(`Invalid work or chapter number: ${chapter.id}`);
    if(!chapter.notes)throw Error(`Missing notes: ${chapter.id}`);
    ids.add(chapter.id);
  }
  const routes=new Map(config.chapters.map(c=>[fileInside(root,c.notes),`/read/${c.id}`]));
  const downloadNames=new Set();
  const downloads=new Map((config.downloads??[]).map(d=>{
    if(!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(d.filename)||downloadNames.has(d.filename))throw Error(`Invalid download filename: ${d.filename}`);
    downloadNames.add(d.filename);return [fileInside(root,d.file),`/texts/${d.filename}`];
  }));
  function rewrite(md,file){return md.replace(/\[([^\]]+)\]\(([^)]+)\)/g,(all,label,url)=>{
    if(/^(https?:|#|\/)/.test(url))return all;
    const [relative,hash]=url.split('#');
    let absolute;try{absolute=fileInside(root,path.relative(root,path.resolve(path.dirname(file),relative)));}catch{return `[${label}](/about)`;}
    const target=routes.get(absolute)??downloads.get(absolute)??'/about';
    return `[${label}](${target}${hash?'#'+hash:''})`;
  });}
  const library=[],chapters=[],quotes=[];
  for(const input of config.chapters){
    const filename=fileInside(root,input.notes);const md=rewrite(fs.readFileSync(filename,'utf8'),filename);const parsed=splitNotes(md);
    if(!parsed.sections.length)throw Error(`${input.id}: notes need at least one ## section`);
    let source=null;
    if(input.text){let text=fs.readFileSync(fileInside(root,input.text),'utf8');if(input.stripFirstLine)text=text.replace(/^[^\n]*\n\s*\n?/,'');source=formatSource(text);}
    let count=0;
    // Match rendered blockquotes, so inline Markdown and typography remain consistent with save IDs.
    for(const section of parsed.sections){
      for(const match of section.html.matchAll(/<blockquote>([\s\S]*?)<\/blockquote>/g)){
        const text=normalize(decodeHTML(sanitize(match[1].replace(/<\/p>|<br\s*\/?>/g,' '),{allowedTags:[],allowedAttributes:{}})));
        if(source&&input.verifyQuotes!==false&&!normalize(source.text.replace(/_([^_]+)_/g,'$1')).includes(normalize(text)))throw Error(`${input.id}: quotation not present in source: ${text.slice(0,90)}`);
        quotes.push({id:`${input.id}-q${++count}`,chapterId:input.id,number:count,text});
      }
    }
    const search=plain(md);const entry={id:input.id,work:input.work,number:input.number,title:input.title??parsed.title,words:search.split(' ').length,minutes:Math.max(1,Math.ceil(search.split(' ').length/190)),quoteCount:count,sections:parsed.sections.map(({id,title})=>({id,title})),search:search.toLowerCase()};
    library.push(entry);chapters.push({...entry,intro:parsed.intro,sections:parsed.sections,source});
  }
  if(!config.cover?.title||!ids.has(config.cover?.start))throw Error('cover.start is not a chapter');
  for(const work of config.works){
    const entries=library.filter(e=>e.work===work.id);if(!entries.length)throw Error(`Work has no chapters: ${work.id}`);
    const numbers=entries.map(e=>e.number);if(new Set(numbers).size!==numbers.length)throw Error(`Duplicate chapter numbers: ${work.id}`);
    for(const group of work.groups??[])if(!group.title||group.start>group.end||!numbers.includes(group.start)||!numbers.includes(group.end))throw Error(`Invalid group in ${work.id}`);
    if(work.groups?.length&&numbers.some(n=>work.groups.filter(g=>n>=g.start&&n<=g.end).length!==1))throw Error(`Groups must cover every chapter exactly once: ${work.id}`);
  }
  const aboutFile=fileInside(root,config.about);const about=splitNotes(rewrite(fs.readFileSync(aboutFile,'utf8'),aboutFile));
  const metadata={...config,chapters:undefined,downloads:(config.downloads??[]).map(d=>({label:d.label,href:`/texts/${d.filename}`})),about};
  return {root,config,metadata,library,chapters,quotes,downloads};
}
export function writeEdition(result,out,generated){
  fs.mkdirSync(out,{recursive:true});
  fs.rmSync(path.join(out,'texts'),{recursive:true,force:true});fs.mkdirSync(path.join(out,'texts'));
  // content/ and texts/ are generated outputs; authored edition files remain untouched.
  const content=path.join(out,'content');fs.rmSync(content,{recursive:true,force:true});fs.mkdirSync(content);
  for(const chapter of result.chapters)fs.writeFileSync(path.join(content,`${chapter.id}.json`),JSON.stringify(chapter));
  for(const [name,value] of Object.entries({library:result.library,quotes:result.quotes,edition:result.metadata}))fs.writeFileSync(path.join(content,`${name}.json`),JSON.stringify(value));
  for(const [file,url] of result.downloads)fs.copyFileSync(file,path.join(out,url.slice(1)));
  fs.mkdirSync(path.dirname(generated),{recursive:true});fs.writeFileSync(generated,JSON.stringify(result.metadata,null,2)+'\n');
}
