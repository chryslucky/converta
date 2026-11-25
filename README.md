# Converta Studio

A private, browser-based media conversion workspace. Converta converts audio files and extracts audio tracks from video using **FFmpeg WebAssembly**. Source media is processed in the browser and is never uploaded to a conversion server.

**Live site:** https://chryslucky.github.io/converta/  
**Repository:** https://github.com/chryslucky/converta

## Features

- Multi-file drag-and-drop import and a sequential batch queue.
- Per-file states for ready, converting, complete, failed and cancelled work.
- Audio export to MP3, WAV, FLAC, AAC and OGG.
- Bitrate controls for lossy formats and optional sample-rate selection.
- FFmpeg progress-event feedback, retry-by-running-again behaviour and active-job cancellation. Progress events are experimental in ffmpeg.wasm and may not provide a smooth percentage for every media type or browser.
- Downloadable results and conversion history stored in IndexedDB.
- Responsive studio, history and about pages, with hash-based routing and a not-found view.
- Keyboard-accessible file selection and reduced-motion styling.

## Privacy and processing model

The conversion engine runs client-side through FFmpeg WebAssembly. The FFmpeg JavaScript and WebAssembly runtime are served from this site's own GitHub Pages origin and loaded when conversion is first requested. Google Fonts and third-party CDN runtime loading are not required. Your selected source files and converted outputs are not sent to a Converta backend; no conversion backend exists in this project.

The browser stores export blobs in IndexedDB and non-sensitive preferences/history metadata in local storage. Browser cleanup, private browsing policies, quota limits or clearing site data can remove that local library. Download important exports to a normal device folder.

No account system, OAuth, cloud sync, server-side conversion, or social authentication is included or advertised.

## Supported formats and limits

Converta accepts common audio and video containers recognized by the bundled FFmpeg build. It exports MP3, WAV, FLAC, AAC (ADTS `.aac`) and OGG Vorbis. Video files must contain an audio stream. A 300 MB per-file application limit is enforced to reduce the risk of browser memory exhaustion; available memory and performance also depend on the device and browser.

The initial conversion may take time because the browser loads the FFmpeg WebAssembly runtime. Processing is sequential to keep memory pressure predictable. Browser tab suspension, low memory, unsupported codecs, or a browser that blocks WebAssembly can interrupt a conversion.

## Local development

Requirements: Node.js 20.19+ (or 22.12+) and npm.

```bash
npm install
npm run dev
```

Vite is configured with the production base path `/converta/`. For local development, open the URL Vite prints and append `/converta/` when required by the dev server.

## Checks and production build

```bash
npm test
npm run build
# or run both together
npm run check

```

The prebuild script copies `@ffmpeg/core` s ESM JavaScript and WebAssembly runtime into `public/ffmpeg/`, so the built site does not depend on a third-party CDN for the conversion engine. Note that `@ffmpeg/core` is distributed under GPL_2.0-or-later; review that license and your distribution obligations before forking or redistributing the application.

## GitHub Pages deployment

The repository includes a GitHub Actions Pages deployment workflow. Pushing to `main` runs both the CI workflow and the Pages workflow. Pages uses the repository subpath `/converta/`, and `HashRouter` to keep the application routes compatible with static hosting. Before the first deployment, the repository Pages source must be set to **GitHub Actions** in Settings → Pages if Pages has not already been enabled. The connected GitHub write integration does not expose the repository Pages-settings mutation endpoint, so that account setting cannot be applied from this session.

Workflow files:

- `.github/workflows/ci.yml` — installs dependencies, runs unit tests, and creates a production build.
- `.github/workflows/pages.yml` — configures Pages, builds `dist/`, uploads the artifact, and deploys it.

The Pages workflow uses the official `actions/configure-pages` action. If Pages is not already enabled for this repository, an administrator must set **Settings → Pages → Build and deployment → Source → GitHub Actions** once, then rerun the workflow.

## Project structure

```text
src/
  App.jsx          Application routes and studio/history/about screens
  conversion.js    Format definitions and pure conversion helpers
  engine.js        FFmpeg WebAssembly lifecycle and conversion function
  main.jsx         React entry point and HashRouter
  store.js         Zustand state and preference/history persistence
  storage.js       IndexedDB output storage
  styles.css       Responsive design system and accessibility styles
public/
  ffmpeg/          FFmpeg runtime assets copied during the build
  favicon.svg
scripts/
  copy-ffmpeg.mjs  Copies the FFmpeg runtime into the static site
 tests/
  conversion.test.js
```

## License

No project-wide license has been added. The FFmpeg runtime and npm dependencies retain their respective upstream licenses; review those licenses before redistributing modified builds.
