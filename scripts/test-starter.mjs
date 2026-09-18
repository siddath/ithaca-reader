import { spawnSync } from 'node:child_process';
const env={...process.env,READER_EDITION:'editions/starter/edition.json',READER_TEST_EDITION:'starter'};
for(const args of [['run','build'],['exec','playwright','test','tests/framework.spec.ts']]){
  const result=spawnSync(process.platform==='win32'?'npm.cmd':'npm',args,{env,stdio:'inherit',shell:process.platform==='win32'});
  if(result.status!==0)process.exit(result.status??1);
}
