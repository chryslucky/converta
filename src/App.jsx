import { useRef, useState } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { Activity, ArrowDownToLine, ArrowRight, AudioLines, Check, Clock3, FileAudio2, FileVideo2, Files, HardDrive, Info, Layers3, LoaderCircle, LockKeyhole, Music2, Plus, ShieldCheck, SlidersHorizontal, Sparkles, Trash2, UploadCloud, X, Zap } from 'lucide-react';
import { OUTPUT_FORMATS, formatBytes, isSupportedMedia } from './conversion.js';
import { convertMedia, getEngine, terminateEngine } from './engine.js';
import { clearOutputs, deleteOutput, readOutput, saveOutput } from './storage.js';
import { useStudio } from './store.js';

const dateLabel = (value) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}
function Brand() { return <Link to="/" className="brand"><span><AudioLines /></span><b>converta<em>.</em><small>MEDIA STUDIO</small></b></Link>; }

function Layout() {
  return <div className="app-shell">
    <aside className="sidebar">
      <Brand /><label className="side-label">WORKSPACE</label>
      <nav aria-label="Main navigation">
        <NavLink to="/" end><Layers3 />Studio</NavLink>
        <NavLink to="/history"><Clock3 />History</NavLink>
        <NavLink to="/about"><Info />About</NavLink>
      </nav>
      <div className="side-space" />
      <div className="privacy-card"><ShieldCheck /><strong>Your files stay yours</strong><p>Media is processed locally in your browser. Source files are never uploaded.</p><small>● Local processing enabled</small></div>
      <div className="version">Converta Studio <span>v3.0</span></div>
    </aside>
    <main>
      <header className="mobile-head"><Brand /><nav aria-label="Mobile navigation"><NavLink to="/" end aria-label="Studio"><Layers3 /></NavLink><NavLink to="/history" aria-label="History"><Clock3 /></NavLink><NavLink to="/about" aria-label="About"><Info /></NavLink></nav></header>
      <div className="content"><Routes><Route path="/" element={<Studio />} /><Route path="/history" element={<History />} /><Route path="/about" element={<About />} /><Route path="*" element={<NotFound />} /></Routes></div>
      <footer><span>© {new Date().getFullYear()} Converta Studio</span><span><LockKeyhole /> Your media stays on this device</span><a href="https://github.com/chryslucky/converta" target="_blank" rel="noreferrer">Open source <ArrowRight /></a></footer>
    </main>
  </div>;
}
function Heading({ eyebrow, title, description, children }) {
  return <div className="heading"><div><label>{eyebrow}</label><h1>{title}</h1><p>{description}</p></div>{children}</div>;
}
function Notice({ children, onClose }) {
  if (!children) return null;
  return <div className="notice" role="status"><span>{children}</span><button type="button" aria-label="Dismiss message" onClick={onClose}><X /></button></div>;
}
function Studio() {
  const state = useStudio();
  const picker = useRef(null);
  const cancelled = useRef(false);
  const [notice, setNotice] = useState('');
  const completed = state.files.filter((file) => file.status === 'done').length;
  const pending = state.files.filter((file) => file.status !== 'done').length;

  function addFiles(list) {
    const input = Array.from(list || []);
    const accepted = input.filter(isSupportedMedia);
    if (accepted.length) state.addFiles(accepted);
    setNotice(input.length === accepted.length ? `${accepted.length} file(s) added to the queue.` : `${input.length - accepted.length} unsupported file(s) were skipped.`);
  }
  async function startBatch() {
    const queue = useStudio.getState().files.filter((file) => file.status !== 'done');
    if (!queue.length || state.isRunning) return;
    cancelled.current = false;
    state.setRunning(true); state.setEngineLoading(true); setNotice('');
    try {
      await getEngine((progress) => useStudio.getState().setEngineProgress(progress));
      state.setEngineLoading(false);
      for (const queued of queue) {
        if (cancelled.current) break;
        const file = useStudio.getState().files.find((item) => item.id === queued.id);
        if (!file || file.status === 'done') continue;
        state.setActiveId(file.id);
        state.updateFile(file.id, { status: 'converting', progress: 0, error: null });
        try {
          const settings = useStudio.getState();
          const blob = await convertMedia(file.file, settings, (progress) => useStudio.getState().updateFile(file.id, { progress }));
          if (cancelled.current) { state.updateFile(file.id, { status: 'cancelled', progress: 0 }); break; }
          const id = crypto.randomUUID();
          const outputName = `${file.name.replace(/\.[^.]+$/, '')}.${settings.format}`;
          await saveOutput(id, blob);
          state.addHistory({ id, name: outputName, size: blob.size, format: settings.format, date: new Date().toISOString(), sourceName: file.name });
          state.updateFile(file.id, { status: 'done', progress: 100, resultId: id, outputName });
        } catch (error) {
          state.updateFile(file.id, { status: cancelled.current ? 'cancelled' : 'error', error: error?.message || 'Conversion failed.' });
          if (!cancelled.current) setNotice(`${file.name}: ${error?.message || 'Conversion failed.'}`);
        }
      }
      if (!cancelled.current && useStudio.getState().files.some((file) => file.status === 'done')) setNotice('Queue processing finished. Your completed exports are saved locally.');
      else if (cancelled.current) setNotice('Conversion cancelled. Other queued files remain available.');
    } catch (error) { setNotice(error?.message || 'The conversion engine could not be loaded.'); }
    finally {
      state.setRunning(false); state.setEngineLoading(false); state.setEngineProgress(0); state.setActiveId(null); cancelled.current = false;
    }
  }
  function stopBatch() {
    cancelled.current = true;
    const activeId = useStudio.getState().activeId;
    if (activeId) useStudio.getState().updateFile(activeId, { status: 'cancelled', progress: 0 });
    terminateEngine();
  }
  async function downloadResult(file) {
    try {
      const blob = await readOutput(file.resultId);
      if (!blob) throw new Error('This saved output is unavailable in browser storage.');
      download(blob, file.outputName);
    } catch (error) { setNotice(error.message); }
  }
  function videoFile(file) { return file?.type?.startsWith('video/') || /\.(mp4|mov|mkv|webm|avi|m4v|mpeg|mpg|3gp)$/i.test(file?.name || ''); }

  return <>
    <Heading eyebrow="PRIVATE MEDIA WORKSPACE" title={<>Your media, <i>in a better format.</i></>} description="Convert audio and extract sound from video with a focused studio that runs on your device.">
      <span className="secure"><ShieldCheck /> Private by design</span>
    </Heading>
    <Notice onClose={() => setNotice('')}>{notice}</Notice>
    <div className="stats">
      <div><Files /><small>Queue</small><b>{state.files.length}</b><span>{pending} awaiting conversion</span></div>
      <div><Check /><small>Completed</small><b>{completed}</b><span>This workspace session</span></div>
      <div><HardDrive /><small>Stored locally</small><b>{formatBytes(state.history.reduce((sum, item) => sum + (item.size || 0), 0))}</b><span>IndexedDB output library</span></div>
    </div>
    <div className="studio-grid">
      <section className="panel">
        <div className="panel-title"><label>01 / IMPORT</label><h2>Bring in your media</h2><p>Start with one file or add a full batch.</p></div>
        <div className="drop" role="button" tabIndex={0} onClick={() => picker.current?.click()} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); picker.current?.click(); } }} onDragOver={(event) => { event.preventDefault(); event.currentTarget.classList.add('over'); }} onDragLeave={(event) => event.currentTarget.classList.remove('over')} onDrop={(event) => { event.preventDefault(); event.currentTarget.classList.remove('over'); addFiles(event.dataTransfer.files); }}>
          <input ref={picker} type="file" multiple accept="audio/*,video/*,.mkv,.avi,.opus,.flac,.aac,.ogg" hidden onChange={(event) => { addFiles(event.target.files); event.target.value = ''; }} />
          <span className="upload-icon"><UploadCloud /></span><strong>Drop your media files here</strong><span>or <u>browse files</u> from your device</span>
          <div className="format-tags">MP3 <b>·</b> WAV <b>·</b> FLAC <b>·</b> MP4 <b>·</b> MOV <b>·</b> + more</div>
          <small>Audio and video · Multiple files · Up to 300 MB per file</small>
        </div>
        <div className="queue-head"><div><label>YOUR QUEUE</label><b>{state.files.length} {state.files.length === 1 ? 'file' : 'files'}</b></div>{state.files.length > 0 && <button className="text-btn" onClick={state.clearFiles} disabled={state.isRunning}><Trash2 /> Clear queue</button>}</div>
        {state.files.length ? <div className="queue-list">{state.files.map((file) => <article className="file-row" key={file.id}>
          <span className="file-icon">{videoFile(file.file) ? <FileVideo2 /> : <FileAudio2 />}</span>
          <div className="file-info"><b title={file.name}>{file.name}</b><small>{formatBytes(file.size)} · {videoFile(file.file) ? 'Video source' : 'Audio source'} · <span className={`state ${file.status}`}>{file.status}</span></small>
            {file.status === 'converting' && <div className="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={file.progress}><i style={{ width: `${file.progress}%` }} /></div>}
            {file.status === 'error' && <small className="error-text">{file.error}</small>}
          </div>
          <div className="file-actions">{file.status === 'done' && <button onClick={() => downloadResult(file)} aria-label={`Download ${file.outputName}`}><ArrowDownToLine /></button>}<button onClick={() => state.removeFile(file.id)} disabled={state.activeId === file.id} aria-label={`Remove ${file.name}`}><X /></button></div>
        </article>)}</div> : <div className="queue-empty"><Files /><b>Your queue is ready</b><small>Files you add appear here with live conversion status.</small></div>}
        {state.isRunning && <div className="running"><LoaderCircle className="spin" /><div><b>{state.isEngineLoading ? 'Preparing conversion engine' : 'Processing your queue'}</b><small>{state.isEngineLoading ? 'Loading the local FFmpeg runtime…' : 'The active file is being converted in your browser.'}</small></div><button onClick={stopBatch}>Cancel</button></div>}
      </section>
      <aside className="settings">
        <section className="panel">
          <div className="panel-title"><label>02 / OUTPUT</label><h2>Conversion settings</h2><p>Choose how your audio is exported.</p></div>
          <label className="field-label">Output format <small>5 formats</small></label>
          <div className="format-grid">{OUTPUT_FORMATS.map((format) => <button key={format.id} onClick={() => state.setFormat(format.id)} className={state.format === format.id ? 'selected' : ''} aria-pressed={state.format === format.id}><b>{format.name}</b><small>{format.detail}</small>{state.format === format.id && <Check />}</button>)}</div>
          <div className="control"><div><label htmlFor="bitrate">Audio bitrate</label><small>Higher bitrates preserve more detail.</small></div><select id="bitrate" value={state.bitrate} disabled={!OUTPUT_FORMATS.find((item) => item.id === state.format)?.lossy} onChange={(event) => state.setBitrate(event.target.value)}>{['96k','128k','192k','256k','320k'].map((rate) => <option key={rate}>{rate}</option>)}</select></div>
          <div className="control"><div><label htmlFor="rate">Audio quality</label><small>Choose an output sample rate.</small></div><select id="rate" value={state.sampleRate} onChange={(event) => state.setSampleRate(event.target.value)}><option value="source">Match source</option><option value="44100">44.1 kHz</option><option value="48000">48 kHz</option><option value="96000">96 kHz</option></select></div>
          <p className="hint">{['wav','flac'].includes(state.format) ? 'Lossless format; bitrate selection is not applied.' : 'Bitrate applies to MP3, AAC and OGG.'} Your source file is not modified.</p>
          <button className="primary" disabled={!pending || state.isRunning} onClick={startBatch}>{state.isRunning ? <><LoaderCircle className="spin" /> Converting…</> : <><Sparkles /> Convert {pending} {pending === 1 ? 'file' : 'files'} <ArrowRight /></>}</button>
          <p className="local-note"><LockKeyhole /> No account. No upload. No remote processing.</p>
        </section>
        <section className="engine"><div className="engine-top"><Activity /><span>● READY</span></div><label>LOCAL CONVERSION ENGINE</label><h3>Studio power.<br /><i>Device privacy.</i></h3><p>FFmpeg WebAssembly handles your audio and video locally without sending media to a server.</p><div><span><ShieldCheck /> Files stay local</span><span><Zap /> Batch workflow</span></div></section>
        <section className="panel recent"><div className="queue-head"><b>Recent exports</b><Link to="/history">View all <ArrowRight /></Link></div>{state.history.slice(0, 3).map((item) => <div className="recent-row" key={item.id}><Music2 /><span>{item.name}<small>{formatBytes(item.size)} · {item.format.toUpperCase()}</small></span></div>)}{!state.history.length && <small>No exports yet. Completed files appear here.</small>}</section>
      </aside>
    </div>
  </>;
}

function History() {
  const state = useStudio();
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  async function save(item) {
    setBusy(item.id);
    try { const blob = await readOutput(item.id); if (!blob) throw new Error('This output is no longer available in local browser storage.'); download(blob, item.name); }
    catch (error) { setNotice(error.message); }
    finally { setBusy(''); }
  }
  async function remove(item) {
    try { await deleteOutput(item.id); state.removeHistory(item.id); }
    catch (error) { setNotice(error.message); }
  }
  async function clear() {
    try { await clearOutputs(); state.clearHistory(); setNotice('Local conversion history cleared.'); }
    catch (error) { setNotice(error.message); }
  }
  return <><Heading eyebrow="YOUR PRIVATE LIBRARY" title="Conversion history" description="Completed exports are stored in this browser, ready to download again."><span className="secure">{state.history.length} saved</span></Heading><Notice onClose={() => setNotice('')}>{notice}</Notice><section className="panel history"><div className="queue-head"><div><label>LOCAL EXPORTS</label><h2>Your files</h2></div>{state.history.length > 0 && <button className="text-btn" onClick={clear}><Trash2 /> Clear history</button>}</div>
    {state.history.length ? state.history.map((item) => <article className="history-row" key={item.id}><FileAudio2 /><div><b>{item.name}</b><small>{item.sourceName ? `From ${item.sourceName} · ` : ''}{formatBytes(item.size)} · {dateLabel(item.date)}</small></div><strong>{item.format.toUpperCase()}</strong><button className="secondary" disabled={busy === item.id} onClick={() => save(item)}>{busy === item.id ? <LoaderCircle className="spin" /> : <ArrowDownToLine />} Download</button><button className="icon-btn" onClick={() => remove(item)} aria-label={`Delete ${item.name}`}><Trash2 /></button></article>) : <div className="empty"><Clock3 /><h3>Your history is empty</h3><p>Completed conversions appear here and stay available in this browser.</p><Link className="secondary" to="/"><Plus /> Start a conversion</Link></div>}
  </section><p className="privacy-note"><ShieldCheck /> Browser cleanup or site-data deletion may remove saved exports. Download important files to keep a separate copy.</p></>;
}
function About() {
  const items = [[ShieldCheck,'Private by default','Your selected media is processed in your browser using FFmpeg WebAssembly. Source files are never sent to a conversion server.'],[SlidersHorizontal,'Practical controls','Choose MP3, WAV, FLAC, AAC or OGG. Set a bitrate for lossy formats and a target sample rate.'],[HardDrive,'Local history','Completed output files are stored in IndexedDB on your device, ready to download again.']];
  return <><Heading eyebrow="ABOUT THE STUDIO" title="Built around your files." description="A focused conversion workspace with privacy at its core."/><section className="panel about-hero"><AudioLines /><div><label>CONVERTA STUDIO</label><h2>Good tools should make<br /><i>the work feel simple.</i></h2><p>Choose a format, set your audio preferences and let your browser process the media locally.</p></div></section><div className="about-grid">{items.map(([Icon,title,body]) => <article className="panel" key={title}><Icon /><h3>{title}</h3><p>{body}</p></article>)}</div><section className="panel about-details"><h2>Transparent by design</h2><p><Check /> No account or social sign-in is included.</p><p><Check /> No media upload or server-side conversion endpoint is included.</p><p><Check /> A 300 MB per-file limit helps reduce browser memory pressure.</p><p><Check /> Browser site-data cleanup may remove saved conversions.</p></section></>;
}
function NotFound() { return <section className="panel empty"><b className="code">404</b><h2>That page is not here.</h2><p>The address may have changed or the page may not exist.</p><Link className="primary back" to="/">Back to studio <ArrowRight /></Link></section>; }
export default function App() { return <Layout />; }
