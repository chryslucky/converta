# Deployment notes

## GitHub Pages

- Repository: `chryslucky/converta`
- Production branch: `main`
- Vite base path: `/converta/`
- Expected URL: https://chryslucky.github.io/converta/
- Router: React Router `HashRouter` (`#/`, `#/history`, `#/about`)

The `Deploy Converta to GitHub Pages` workflow is triggered by pushes to `main` and manual dispatch. It builds `dist/` and deploys that artifact using the official Pages Actions. Before its first successful run, verify that **Settings → Pages → Build and deployment → Source** is set to **GitHub Actions**. This repository setting is not writable through the connected GitHub actions exposed in this session.

If first-time repository enablement is blocked by account policy, visit **Repository Settings → Pages** and select **GitHub Actions** as the build source, then rerun the Pages workflow.

## Rollback

Use the GitHub Actions deployment history to inspect a failed run. To roll back the website, revert the relevant commit on `main`; the normal CI and Pages workflows will rebuild and publish the reverted state.

## Runtime considerations

The FFmpeg WebAssembly runtime is copied into the static build and served by GitHub Pages. It is downloaded on first conversion, not when the studio shell first renders. The browser stores output blobs locally in IndexedDB. Browser cleanup and storage quota policies can remove that data.
