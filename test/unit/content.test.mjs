import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { compileEdition, formatSource, splitNotes, writeEdition } from '../../scripts/content.mjs';
const root=path.resolve(import.meta.dirname,'../..');
function fixture(t,change){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ithaca-test-'));
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  fs.cpSync(path.join(root,'editions/starter'),path.join(dir,'edition'),{recursive:true});
  const file=path.join(dir,'edition/edition.json');const config=JSON.parse(fs.readFileSync(file,'utf8'));
  change?.(config,path.dirname(file),dir);fs.writeFileSync(file,JSON.stringify(config));return file;
}
test('starter is independent, has stable IDs and rewrites source and chapter links',t=>{
  const result=compileEdition(fixture(t));
  assert.equal(result.library.length,2);assert.equal(result.quotes.length,2);
  assert.equal(result.quotes[0].id,'arrival-q1');
  assert.match(result.chapters[1].intro,/href="\/read\/arrival"/);
  assert.match(result.metadata.about.sections[0].html,/href="\/texts\/arrival.txt"/);
  assert.equal(result.chapters[0].sections[0].id,'story');
  assert.equal(result.metadata.site.storageKey,'ithaca-starter-v1');
});
test('the complete edition validates all 156 quotations across 42 source chapters',()=>{
  const result=compileEdition(path.join(root,'editions/odyssey/edition.json'));
  assert.equal(result.chapters.filter(c=>c.source).length,42);assert.equal(result.quotes.length,156);
  assert.equal(result.library.length,47);
});
test('unsafe paths, symlink escapes, duplicate IDs, quotation mismatch and hidden groups fail',t=>{
  for(const [name,change,pattern] of [
    ['traversal',(c,dir,parent)=>{fs.writeFileSync(path.join(parent,'outside.txt'),'private');c.chapters[0].text='../outside.txt';},/escapes edition/],
    ['symlink',(c,dir,parent)=>{fs.writeFileSync(path.join(parent,'outside.txt'),'private');fs.symlinkSync(path.join(parent,'outside.txt'),path.join(dir,'link.txt'));c.chapters[0].text='link.txt';},/escapes edition/],
    ['IDs',c=>{c.chapters[1].id=c.chapters[0].id;},/duplicate/],
    ['quotes',(c,dir)=>fs.appendFileSync(path.join(dir,'arrival.md'),'\n> A sentence absent from the source.\n'),/quotation not present/],
    ['groups',c=>{c.works[0].groups=[{title:'Incomplete',start:1,end:1}];},/cover every chapter/],
    ['unsafe link',c=>{c.navLink={href:'javascript:alert(1)',label:'Oops'};},/Navigation links/],
    ['download collision',c=>{c.downloads[1].filename=c.downloads[0].filename;},/download filename/],
  ])assert.throws(()=>compileEdition(fixture(t,change)),pattern,name);
});
test('source HTML is escaped while italics and indented verse survive',()=>{
  const result=formatSource('<script>bad()</script>\n\nAn _italic_ word.\n\n  First line\n  Second line');
  assert.match(result.formatted[0].html,/&lt;script&gt;/);
  assert.equal(result.formatted[1].html,'An <em>italic</em> word.');
  assert.deepEqual(result.formatted[2],{verse:true,html:'First line<br/>Second line'});
});
test('notes strip executable HTML, preserve evidence labels and reject duplicate anchors',()=>{
  const parsed=splitNotes('# Title\n\n## Story {#story}\n\n[T] Fact.\n\n<script>alert(1)</script><img src="x" onerror="bad()"><a href="javascript:bad()">bad</a>');
  assert.doesNotMatch(parsed.sections[0].html,/script|onerror|javascript:/);
  assert.match(parsed.sections[0].html,/evidence-label/);
  assert.throws(()=>splitNotes('# Title\n## One {#same}\ntext\n## Two {#same}\ntext'),/Duplicate section/);
});
test('notes-only companions compile and stale generated downloads are removed on edition switch',t=>{
  const manifest=fixture(t,c=>{delete c.chapters[1].text;c.downloads=c.downloads.slice(0,1);});
  const result=compileEdition(manifest);assert.equal(result.chapters[1].source,null);
  const dir=path.dirname(manifest),out=path.join(dir,'output');fs.mkdirSync(path.join(out,'texts'),{recursive:true});
  fs.writeFileSync(path.join(out,'texts/stale.txt'),'old edition');
  writeEdition(result,out,path.join(dir,'generated/edition.json'));
  assert.deepEqual(fs.readdirSync(path.join(out,'texts')),['arrival.txt']);
  assert.equal(JSON.parse(fs.readFileSync(path.join(out,'content/departure.json'),'utf8')).source,null);
});

test('exact quotation extraction preserves symbols and decoded entities',t=>{
  const manifest=fixture(t,(c,dir)=>{
    fs.writeFileSync(path.join(dir,'arrival.txt'),'At #2, we saw _one_ & two.');
    fs.writeFileSync(path.join(dir,'arrival.md'),'# Arrival\n## Quotations\n> At #2, we saw *one* & two.');
  });
  assert.equal(compileEdition(manifest).quotes[0].text,'At #2, we saw one & two.');
});
test('declared checksums reject source drift even outside quoted passages',t=>{
  const manifest=fixture(t,(c,dir)=>{
    c.checksums='checksums.json';fs.writeFileSync(path.join(dir,c.checksums),JSON.stringify([{path:'arrival.txt',bytes:1,sha256:'invalid'}]));
  });
  assert.throws(()=>compileEdition(manifest),/Source checksum mismatch/);
});
