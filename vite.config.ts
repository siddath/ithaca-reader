import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
// Generated before dev/build so social metadata and no-JS downloads follow the chosen edition.
const edition=JSON.parse(fs.readFileSync(new URL('./src/generated/edition.json',import.meta.url),'utf8'));
const escape=(value:string)=>value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export default defineConfig({
  plugins:[react(),{name:'edition-metadata',transformIndexHtml(html){
    return html.replace('%%LANG%%',escape(edition.site.lang??'en')).replace('%%DIRECTION%%',escape(edition.site.direction??'ltr'))
      .replaceAll('%%TITLE%%',escape(edition.site.title)).replaceAll('%%DESCRIPTION%%',escape(edition.site.description))
      .replace('%%DOWNLOADS%%',edition.downloads.map((d:{href:string;label:string})=>`<a href="${escape(d.href)}">${escape(d.label)}</a>`).join(' · '));
  }}],
  build:{target:'es2022',assetsInlineLimit:0},
});
