# Converta Studio 5.0 deployment notes

## Production target

- Primary URL: https://convertapro.vercel.app/
- Repository: chryslucky/converta
- Branch: main
- Framework: Vite + React
- Output directory: dist
- Node.js: 22
- Client routing: React Router BrowserRouter

## Build pipeline

The build copies FFmpeg WebAssembly assets, generates the conversion search index, builds the Vite application and prerenders public route documents. The route generator creates route-specific HTML, metadata, structured data, sitemap.xml and robots.txt. The Audio Studio page is an indexable route at /audio-studio/.

## Studio 5.0 verification

Run:

    npm run check

After deployment, verify:

- The main conversion route loads with clean URLs and the dynamic page title.
- Direct navigation and refresh work for /audio-studio/, /history/, /audio-converter/, /video-to-audio/ and SEO guide routes.
- /sitemap.xml includes /audio-studio/ and /robots.txt is reachable.
- FFmpeg assets are served from /ffmpeg/.
- A completed conversion has an in-app audio player and download action in both the queue and history.
- Audio Studio can decode a supported audio file, apply effects, play the WAV render and download it.
- Voiceover recording/import and clip mixing work on a supported browser with microphone permission granted.
- Lyric video preview tracks the song playhead; rendering includes the soundtrack and text overlays. Output container support depends on MediaRecorder in the current browser.

## Browser processing and output formats

FFmpeg WebAssembly handles conversions to MP3, WAV, FLAC, AAC and OGG. Audio Studio's Web Audio pipeline renders edited audio as PCM WAV. The lyric-video exporter uses canvas capture and MediaRecorder, typically WebM; MP4 is available only on browsers that provide a supported MP4 recorder.

Audio Studio voice effects are DSP presets, not AI voice cloning. Pitch shifting changes playback rate and therefore also changes duration. Keep the page active for full-length video rendering.

## Local storage

Conversion outputs are saved in IndexedDB. History and preferences use browser storage. Browser cleanup, storage limits or private browsing can remove local exports. This is not cloud backup; users should download important files to their device.

## Rollback

Revert the release commit on main. GitHub CI and Vercel will run the normal build pipeline on the reverted commit.
