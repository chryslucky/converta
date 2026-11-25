# Converta Studio 5.0

Converta is a browser-based media workspace for audio conversion, sound editing, voice effects, voiceover mixing and lyric-video production.

**Production:** https://convertapro.vercel.app/  
**Repository:** https://github.com/chryslucky/converta

## Studio 5.0

- Convert audio and extract audio tracks from supported video containers to MP3, WAV, FLAC, AAC and OGG.
- Play completed conversion outputs in the queue and history, and download the saved file.
- Edit audio locally: trim, remove a range, split, duplicate, reverse, concatenate, overlay-mix, fade, normalize, remove quiet sections, adjust gain, change playback rate and pitch, EQ bass/treble, high-pass and low-pass filter, compress, distort, and add echo, reverb and chorus.
- Apply 33 creative voice-processing profiles, including lower and brighter adult presets, child-like pitch, robot, radio, telephone, announcer, monster, alien and other effects.
- Import or record voiceovers, set each track's start offset and level, and mix tracks with a selected audio source.
- Create lyric videos from songs with individually timed caption segments, 32 font-family choices, solid text color or animated linear gradients, 30 animated background presets, up to 10 uploaded image backgrounds and 120 parameterized text-animation presets.
- Preview edited audio in an audio player and lyric videos in a video player before download.
- Keep conversion history and exports locally in the browser.

## Processing model and limits

FFmpeg WebAssembly performs the primary format conversions inside the browser. Audio Studio uses Web Audio API decoding, offline processing and WAV encoding; lyric videos are recorded from a canvas and soundtrack with the browser's MediaRecorder API.

Audio Studio's voice presets are creative DSP effects, not neural voice cloning or natural gender conversion. Pitch changes currently use playback-rate processing, so they also change duration. Audio Studio edited-audio exports are PCM WAV. Lyric video output is WebM where supported, or MP4 only when the browser exposes a compatible MediaRecorder implementation. Current browser codec support may vary.

No media-upload or server-side conversion API is included. Your source files remain in the browser. Export blobs and history are stored locally; browser cleanup, private-browsing policies or storage quota limits can remove them. Download important work to your device. Keep the tab active while a lyric video renders.

The primary converter retains a 300 MB per-file application limit to reduce browser memory pressure. Actual decoding depends on source codecs and available device memory.

## Development

Requirements: Node.js 20.19+ (Node 22 recommended).

```bash
npm install
npm run dev
npm test
npm run build
npm run check
```

The build copies the FFmpeg WebAssembly runtime, generates the search index, creates the Vite production build and prerenders route-specific SEO pages, sitemap.xml and robots.txt.

## Structure

- `src/App.jsx` — conversion workspace, history, routing and SEO metadata
- `src/AudioStudio.jsx` — audio editor, voice lab, voiceovers and lyric-video UI
- `src/audio-tools.js` — Web Audio decoding, processing, mixing and WAV export
- `src/audio-studio.css` — responsive Audio Studio design system
- `src/conversion.js` and `src/engine.js` — FFmpeg output profiles and conversion lifecycle
- `src/storage.js` — IndexedDB output storage
- `src/data/seo-pages.js` — crawlable public landing-page content

## Deployment

The production project is deployed from the `main` branch on Vercel at https://convertapro.vercel.app/. GitHub Pages is also configured for https://chryslucky.github.io/converta/ with its repository path base.

No project-wide license has been added. Review upstream licenses for FFmpeg and npm dependencies before redistributing modified builds.
