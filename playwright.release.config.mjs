import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./tests',testMatch:'release-smoke.spec.mjs',workers:2,retries:0,timeout:45000,
 reporter:[['list'],['json',{outputFile:'reports/release/smoke/browser.json'}]],
 outputDir:'test-results/release-smoke',
 use:{baseURL:process.env.WIKI_PREVIEW_URL,browserName:'chromium',trace:'retain-on-failure',screenshot:'only-on-failure',
  launchOptions:process.env.WIKI_CHROME?{executablePath:process.env.WIKI_CHROME}:{}}
});
