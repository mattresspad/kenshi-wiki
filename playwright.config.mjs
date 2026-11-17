import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir:'./tests',
  testMatch:'**/*.spec.mjs',
  fullyParallel:false,
  workers:2,
  retries:0,
  reporter:'list',
  use:{
    baseURL:'http://127.0.0.1:4392',
    browserName:'chromium',
    launchOptions:process.env.WIKI_CHROME ? {executablePath:process.env.WIKI_CHROME} : {},
    viewport:{width:1440,height:900},
  },
  webServer:{
    command:'npm run preview -- --host 127.0.0.1 --port 4392',
    url:'http://127.0.0.1:4392/catun',
    reuseExistingServer:true,
  },
});
