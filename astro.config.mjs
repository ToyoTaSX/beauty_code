// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages: https://<user>.github.io/<repo>/
// Со своим доменом: site = 'https://домен', base = '/' и файл public/CNAME.
const GITHUB_USER = 'toyotasx';
const REPO = 'beauty_code';

export default defineConfig({
  site: `https://${GITHUB_USER}.github.io`,
  base: `/${REPO}`,
  output: 'static',
  trailingSlash: 'ignore',
});
