import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import { createHash } from 'node:crypto';
import { compileEdition } from '../../scripts/content.mjs';import { validateCulture } from '../../scripts/culture.mjs';
const root=path.resolve(import.meta.dirname,'../..');
const edition=compileEdition(path.join(root,'editions/odyssey/edition.json'));
test('culture has twelve credited images, eight themes and all 24 Odyssey books',()=>{
 const c=edition.metadata.culture;assert.equal(c.artworks.length,12);assert.equal(c.themes.length,8);
 assert.deepEqual(c.chapters.map(e=>e.chapterId),Array.from({length:24},(_,i)=>`odyssey-${i+1}`));
 const records=JSON.parse(fs.readFileSync(path.join(root,'editions/odyssey/culture-sources.json'))).records;
 for(const art of c.artworks){const record=records.find(r=>r.id===art.id);assert.ok(record);for(const src of [art.image.src,art.image.thumbnail]){const f=record.files.find(f=>f.path===`public${src}`);assert.ok(f);const bytes=fs.readFileSync(path.join(root,f.path));assert.equal(createHash('sha256').update(bytes).digest('hex'),f.sha256);}}
});
test('culture rejects broken references and missing provenance before publishing',()=>{
 for(const [mutate,error] of [
  [c=>c.artworks[0].chapterIds=['missing'],/chapter references/],
  [c=>delete c.artworks[0].rights,/missing label/],
  [c=>delete c.artworks[0].id,/invalid ID/],
  [c=>c.artworks[0].image.src='https://external.test/art.jpg',/local/],
  [c=>c.artworks[0].sources[0].url='javascript:alert(1)',/HTTPS/],
  [c=>c.featured='missing',/featured/],
  [c=>c.chapters[0].themeIds=['missing'],/Unknown culture theme/],
  [c=>c.chapters.push(c.chapters[0]),/Duplicate culture chapter/],
 ]){const c=structuredClone(edition.metadata.culture);mutate(c);assert.throws(()=>validateCulture(c,edition.library),error);}
});
test('the standalone starter does not require or inherit Odyssey culture',()=>{assert.equal(compileEdition(path.join(root,'editions/starter/edition.json')).metadata.culture,undefined);});
