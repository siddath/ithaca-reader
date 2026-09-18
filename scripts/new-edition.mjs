import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const slug=process.argv[2];
if(!slug||!/^[a-z0-9][a-z0-9-]*$/.test(slug)){
  console.error('Usage: npm run new:edition -- my-book (lowercase letters, digits and hyphens)');process.exit(1);
}
const target=path.join(root,'editions',slug);
if(fs.existsSync(target)){console.error(`Edition already exists: ${slug}`);process.exit(1);}
fs.cpSync(path.join(root,'editions/starter'),target,{recursive:true});
const filename=path.join(target,'edition.json');
const config=JSON.parse(fs.readFileSync(filename,'utf8'));
config.site.name=slug.split('-').map(s=>s[0].toUpperCase()+s.slice(1)).join(' ');
config.site.wordmark=slug.replaceAll('-',' ');config.site.title=`${config.site.name} · A reading edition`;
config.site.storageKey=`ithaca-${slug}-v1`;config.cover.title=config.site.name;
fs.writeFileSync(filename,JSON.stringify(config,null,2)+'\n');
console.log(`Created editions/${slug}. Edit edition.json, source .txt files and notes .md files.\nPreview: READER_EDITION=editions/${slug}/edition.json npm run dev`);
