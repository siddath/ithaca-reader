const validId=/^[a-z0-9][a-z0-9-]*$/;
const isUrl=value=>typeof value==='string'&&/^https:\/\//.test(value)&&!/[\\\x00-\x20]/.test(value);
function requiredStrings(value,fields,context){for(const field of fields)if(typeof value?.[field]!=='string'||!value[field].trim())throw Error(`${context}: missing ${field}`);}
export function validateCulture(culture,library){
  requiredStrings(culture,['title','description','featured'],'culture');
  if(!Array.isArray(culture.introduction)||!culture.introduction.length||culture.introduction.some(p=>typeof p!=='string'))throw Error('culture requires introduction paragraphs');
  const chapterIds=new Set(library.map(c=>c.id));
  const verifyChapters=(ids,label)=>{if(!Array.isArray(ids)||!ids.length||ids.some(id=>!chapterIds.has(id)))throw Error(`${label}: unknown or missing chapter references`);};
  const unique=(list,label)=>{if(!Array.isArray(list)||!list.length)throw Error(`culture requires ${label}`);const ids=new Set();for(const item of list){if(typeof item?.id!=='string'||!validId.test(item.id)||ids.has(item.id))throw Error(`${label}: duplicate or invalid ID`);ids.add(item.id);}return ids;};
  const sourceLinks=(sources,label)=>{if(!Array.isArray(sources)||!sources.length||sources.some(s=>!s.label||!isUrl(s.url)))throw Error(`${label}: source links require a label and HTTPS URL`);};
  const artIds=unique(culture.artworks,'artworks');const themeIds=unique(culture.themes,'themes');
  if(!artIds.has(culture.featured))throw Error('culture featured artwork is missing');
  for(const art of culture.artworks){
    requiredStrings(art,['title','artist','date','medium','collection','summary','context','looking','reading','question'],art.id);
    if(!['painting','object'].includes(art.kind)||!['episode','context'].includes(art.relationship))throw Error(`${art.id}: invalid artwork classification`);
    verifyChapters(art.chapterIds,art.id);sourceLinks(art.sources,art.id);
    requiredStrings(art.rights,['label','url','credit'],art.id);if(!isUrl(art.rights.url))throw Error(`${art.id}: missing rights URL`);
    requiredStrings(art.image,['src','alt'],art.id);
    for(const src of [art.image.src,art.image.thumbnail].filter(Boolean))if(!/^\/images\/[a-zA-Z0-9/_-]+\.(jpg|jpeg|png|webp)$/.test(src)||src.includes('..'))throw Error(`${art.id}: image must be a local /images/ file`);
    if(!Number.isInteger(art.image.width)||!Number.isInteger(art.image.height)||art.image.width<1||art.image.height<1)throw Error(`${art.id}: invalid image dimensions`);
  }
  for(const theme of culture.themes){requiredStrings(theme,['title','lead'],theme.id);verifyChapters(theme.chapterIds,theme.id);sourceLinks(theme.sources,theme.id);if(!Array.isArray(theme.paragraphs)||!theme.paragraphs.length||theme.paragraphs.some(p=>typeof p!=='string'||!p.trim()))throw Error(`${theme.id}: missing paragraphs`);}
  if(!Array.isArray(culture.chapters)||!culture.chapters.length)throw Error('culture requires a chapter guide');
  const guideIds=new Set();
  for(const chapter of culture.chapters){requiredStrings(chapter,['chapterId','title','text'],'culture chapter');verifyChapters([chapter.chapterId],chapter.chapterId);if(guideIds.has(chapter.chapterId))throw Error('Duplicate culture chapter guide');guideIds.add(chapter.chapterId);if(!Array.isArray(chapter.themeIds)||chapter.themeIds.some(id=>!themeIds.has(id)))throw Error('Unknown culture theme');}
  return culture;
}
