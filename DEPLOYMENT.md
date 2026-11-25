# Converta 4.0 deployment notes

## Production target

- Primary Vercel URL: https://convertapro.vercel.app/
- Repository: chryslucky/converta
- Production branch: main
- Framework: Vite + React
- Output directory: dist
- Runtime: Node.js 22
- Client routing: React Router BrowserRouter

## Build pipeline

The production build runs the npm prebuild lifecycle, which copies the FFmpeg WebAssembly runtime and generates the long-tail search index. Vite then builds the application. The post-build SEO generator creates route-specific HTML documents, route metadata, structured data, sitemap.xml and robots.txt.

Vercel rewrites unknown application paths to the application shell. Existing pre-rendered route documents and static assets should be served as files before the fallback rewrite. Verify direct requests to /mp4-to-mp3/, /guides/wav-vs-mp3/ and /history/ after releases.

GitHub Pages uses the /converta/ base path while Vercel uses /. The Vite base setting selects the correct path using the GitHub Actions environment.

## SEO verification

The sitemap includes only public indexable pages. The personal history page is marked noindex,follow; it is not included in the sitemap. Each public route receives its own title, description, canonical URL, Open Graph metadata, visible page copy and JSON-LD. Internal links use real anchor destinations through React Router links.

## Verification

    npm run check
    npm run build

Confirm the following on production after a release:
- Home page loads with no hash fragment.
- Directly load and refresh a conversion landing page.
- Browser tab title changes on navigation.
- /sitemap.xml and /robots.txt return valid files.
- /history/ loads but is noindex.
- FFmpeg runtime assets are returned from /ffmpeg/.
- Queue progress, output downloads and dated history work on a supported browser.

## Local storage

Conversion outputs live in IndexedDB and activity/preferences are held in browser storage. Site-data cleanup can remove them. This is deliberate client-side storage, not a cloud backup.
