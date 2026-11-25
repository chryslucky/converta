import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { SEO_PAGES, SITE_URL } from '../src/data/seo-pages.js';

const dist = resolve('dist');
const baseHtml = await readFile(join(dist,'index.html'),'utf8');
const esc = (value) => String(value || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const link = (path,label) => '<a href="' + esc(path) + '">' + esc(label) + '</a>';
const pageBody = (page) => {
  const sections = (page.sections || []).map((section) => '<section><h2>' + esc(section.heading) + '</h2><p>' + esc(section.body) + '</p></section>').join('');
  const benefits = (page.benefits || []).map((item) => '<li>' + esc(item) + '</li>').join('');
  const steps = (page.steps || []).map((item) => '<li>' + esc(item) + '</li>').join('');
  const faqs = (page.faqs || []).map((item) => '<details><summary>' + esc(item[0]) + '</summary><p>' + esc(item[1]) + '</p></details>').join('');
  const related = (page.related || []).map((path) => {
    const target = SEO_PAGES.find((candidate) => candidate.path === path);
    return target ? '<li>' + link(target.path,target.heading) + '</li>' : '';
  }).join('');
  return '<div class="seo-snapshot"><header><a href="/">Converta Studio v4</a><nav>' + link('/audio-converter/','Audio converter') + ' ' + link('/video-to-audio/','Video to audio') + ' ' + link('/guides/','Guides') + ' ' + link('/about/','About') + '</nav></header><main><p>' + esc(page.eyebrow) + '</p><h1>' + esc(page.heading) + '</h1><p class="lead">' + esc(page.intro) + '</p><div class="snapshot-actions">' + link('/','Open the converter') + '</div><section><h2>What this page covers</h2><ul>' + benefits + '</ul></section>' + sections + (steps ? '<section><h2>How to use Converta</h2><ol>' + steps + '</ol></section>' : '') + (faqs ? '<section><h2>Frequently asked questions</h2>' + faqs + '</section>' : '') + (related ? '<section><h2>Related tools and guides</h2><ul>' + related + '</ul></section>' : '') + '</main><footer>Converta processes supported media in your browser. Local browser storage is not a backup.</footer></div>';
};
const schemaFor = (page) => {
  const schema = [
    {'@context':'https://schema.org','@type':'WebApplication','name':'Converta Studio','applicationCategory':'MultimediaApplication','operatingSystem':'Any modern browser','url':SITE_URL + page.path,'description':page.description,'offers':{'@type':'Offer','price':'0','priceCurrency':'USD'}},
    {'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[
      {'@type':'ListItem','position':1,'name':'Home','item':SITE_URL + '/'},
      {'@type':'ListItem','position':2,'name':page.heading,'item':SITE_URL + page.path}
    ]}
  ];
  if (page.faqs?.length) schema.push({'@context':'https://schema.org','@type':'FAQPage','mainEntity':page.faqs.map((faq) => ({'@type':'Question','name':faq[0],'acceptedAnswer':{'@type':'Answer','text':faq[1]}}))});
  return schema;
};
const inject = (html,page) => {
  const canonical = SITE_URL + page.path;
  const robots = page.indexable === false ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
  const tags = [
    '<title>' + esc(page.title) + '</title>',
    '<meta name="description" content="' + esc(page.description) + '">',
    '<meta name="robots" content="' + robots + '">',
    '<link rel="canonical" href="' + esc(canonical) + '">',
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="Converta">',
    '<meta property="og:title" content="' + esc(page.title) + '">',
    '<meta property="og:description" content="' + esc(page.description) + '">',
    '<meta property="og:url" content="' + esc(canonical) + '">',
    '<meta name="twitter:card" content="summary">',
    '<meta name="twitter:title" content="' + esc(page.title) + '">',
    '<meta name="twitter:description" content="' + esc(page.description) + '">',
    '<script type="application/ld+json">' + JSON.stringify(schemaFor(page)).replace(/</g,'\\u003c') + '</script>'
  ].join('\n    ');
  let output = html.replace(/<title>.*?<\/title>/s,'').replace(/<meta name="description"[^>]*>/,'').replace(/<link rel="canonical"[^>]*>/,'');
  output = output.replace('</head>',tags + '\n  </head>');
  output = output.replace('<div id="root"></div>','<div id="root">' + pageBody(page) + '</div>');
  return output;
};
for (const page of SEO_PAGES) {
  const route = page.path === '/' ? '' : page.path.replace(/^\/|\/$/g,'');
  const destination = route ? join(dist,route,'index.html') : join(dist,'index.html');
  await mkdir(dirname(destination),{recursive:true});
  await writeFile(destination,inject(baseHtml,page));
}
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  SEO_PAGES.filter((page) => page.indexable !== false).map((page) => '<url><loc>' + esc(SITE_URL + page.path) + '</loc><lastmod>' + new Date().toISOString().slice(0,10) + '</lastmod></url>').join('\n') +
  '\n</urlset>\n';
await writeFile(join(dist,'sitemap.xml'),sitemap);
await writeFile(join(dist,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: ' + SITE_URL + '/sitemap.xml\n');
console.log('Pre-rendered ' + SEO_PAGES.length + ' route documents, sitemap.xml and robots.txt.');
