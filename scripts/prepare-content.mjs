import path from 'node:path';
import { compileEdition, writeEdition } from './content.mjs';
const root=path.resolve(import.meta.dirname,'..');
const manifest=path.resolve(root,process.env.READER_EDITION??'editions/odyssey/edition.json');
const result=compileEdition(manifest);
writeEdition(result,path.join(root,'public'),path.join(root,'src/generated/edition.json'));
console.log(`Prepared ${result.metadata.site.name}: ${result.chapters.length} chapters, ${result.quotes.length} quotations.`);
