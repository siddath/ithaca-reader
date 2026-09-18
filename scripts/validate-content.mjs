import path from 'node:path';
import { compileEdition } from './content.mjs';
const root=path.resolve(import.meta.dirname,'..');
const edition=compileEdition(path.resolve(root,process.env.READER_EDITION??'editions/odyssey/edition.json'));
console.log(`Valid: ${edition.library.length} chapters, ${edition.quotes.length} quotations, ${edition.config.works.length} works.`);
