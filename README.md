# Converta Studio 4.0

A private, browser-based media conversion workspace for audio conversion and audio extraction from supported video containers. FFmpeg WebAssembly processes selected media in the browser; the project does not include a media-upload or server-side conversion API.

Production site: https://convertapro.vercel.app/  
Alternative Vercel deployment: https://convertapro-three.vercel.app/  
GitHub Pages: https://chryslucky.github.io/converta/  
Repository: https://github.com/chryslucky/converta

## Version 4.0

- Clean browser-history routes with no hash fragments.
- Route-specific browser titles, descriptions, canonical URLs, Open Graph metadata and JSON-LD.
- Build-time pre-rendered documents for the home page, conversion landing pages, format guides and about page.
- XML sitemap and robots.txt generated during production build; the private history route is marked noindex.
- A searchable in-app discovery index with more than 1,000 natural conversion query phrases and at least 2,000 searchable query terms. This index powers converter search suggestions rather than injecting keyword lists into page content.
- Batch conversion with per-file progress and an overall progress indicator.
- Dated records for completed, failed and cancelled conversion attempts, plus file additions, job starts, downloads and other workspace activity.
- Local export storage in IndexedDB and preferences/history metadata in browser storage.
- Modern Lucide icons across the studio, workspace navigation, format controls, guides and history.

## Conversion features

Converta exports audio as MP3, WAV, FLAC, AAC and OGG. Common supported video containers can be used as sources when they contain a decodable audio stream; the output is audio only. The current video workflow selects the first audio stream and does not edit or re-encode the video track.

For lossy formats MP3, AAC and OGG, the workspace offers bitrate controls. WAV and FLAC use their respective PCM/lossless output profiles. A 300 MB per-file application limit helps reduce browser memory pressure. Actual decoding support depends on the source codec and the bundled FFmpeg build.

## Privacy and local storage

Source files are processed in the browser with FFmpeg WebAssembly. Converta does not include an account system, cloud sync or server-side media conversion endpoint. Completed output blobs are saved in IndexedDB, while conversion and activity records are persisted locally in browser storage.

Browser cleanup, private-browsing policies, storage quotas or clearing site data may remove local records and output files. Download important exports to a normal device folder. Local browser history is not a backup.

## SEO architecture

The build creates individual HTML documents for a curated set of converter and guide routes so each public page has meaningful static text before client-side JavaScript runs. The app also updates page titles and metadata during browser navigation. The sitemap contains only public, indexable pages; personal conversion history is excluded.

The generated search corpus provides long-tail converter query suggestions in the product UI. It is not rendered as hidden page text. Public landing pages and guides contain task-specific instructions, codec limitations and FAQs rather than repeated keyword blocks.

## Local development

Requirements: Node.js 20.19+ (or 22.12+) and npm.

    npm install
    npm run dev
    npm test
    npm run build
    npm run check

The prebuild lifecycle copies the FFmpeg runtime into public/ffmpeg/ and generates the search index. The build then generates route-specific HTML documents, sitemap.xml and robots.txt.

## Deployment targets

- Vercel serves the application at the domain root /.
- GitHub Pages serves the repository site beneath /converta/.
- Vercel uses BrowserRouter and vercel.json rewrites for direct path requests. Pre-rendered route documents provide route-specific HTML metadata and content to crawlers.
- GitHub Pages uses its repository subpath and the static route documents generated at build time.

The GitHub Actions workflows run CI and publish GitHub Pages from main. The repository Pages source must be set to GitHub Actions in Settings → Pages before the first Pages deployment.

## Core structure

    src/
      App.jsx                   Workspace, history, search and SEO routes
      conversion.js             Output profiles and media helpers
      engine.js                 FFmpeg WebAssembly conversion lifecycle
      main.jsx                  React entry point with BrowserRouter
      store.js                  Local settings, job history and activity state
      storage.js                IndexedDB output file storage
      styles.css                Responsive v4 design system
      data/seo-pages.js         Public landing pages, guides and route metadata
    scripts/
      copy-ffmpeg.mjs            Copies FFmpeg runtime into the static build
      generate-search-index.mjs  Generates long-tail search suggestions
      prerender-seo.mjs          Writes crawlable HTML, sitemap and robots files

## Licensing

No project-wide license has been added. Review upstream licenses for FFmpeg and npm dependencies before redistributing modified builds.
