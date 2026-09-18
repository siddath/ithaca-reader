import { defineConfig } from '@playwright/test';
const external=process.env.BASE_URL;
export default defineConfig({
  testDir:'./tests',
  testIgnore:process.env.READER_TEST_EDITION==='starter'?['**/reader.spec.ts','**/refinement.spec.ts']:[],
  fullyParallel:false,
  workers:1,
  retries:process.env.CI?1:0,
  reporter:process.env.CI?[['list'],['html',{open:'never'}]]:'list',
  use:{baseURL:external??'http://127.0.0.1:4173',viewport:{width:1440,height:1000},trace:'retain-on-failure',channel:process.env.PLAYWRIGHT_CHANNEL},
  webServer:external?undefined:{command:'npm run preview -- --port 4173 --strictPort',url:'http://127.0.0.1:4173',reuseExistingServer:false},
});
