import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import AudioPlayerModal from './AudioPlayerModal.jsx';
import AudioStudio from './AudioStudio.jsx';
import { Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, ArrowDownToLine, ArrowRight, AudioLines, AudioWaveform, BadgeCheck, BookOpen,
  Check, CheckCircle2, ChevronDown, CircleHelp, Clock3, Command, Download, FileAudio2,
  FileVideo2, Files, Filter, FolderOpen, Gauge, HardDrive, Headphones, History as HistoryIcon,
  Info, ListFilter, LoaderCircle, LockKeyhole, Menu, Music2, Pause, Play, Plus, Search,
  Settings2, ShieldCheck, SlidersHorizontal, Sparkles, Trash2, Upload, UploadCloud, X,
  XCircle, Zap
} from 'lucide-react';
import searchIndex from './data/search-index.json';
import { getSeoPage, SEO_PAGES, SITE_URL } from './data/seo-pages.js';
import { OUTPUT_FORMATS, formatBytes, isSupportedMedia } from './conversion.js';
import { convertMedia, getEngine, terminateEngine } from './engine.js';
import { clearOutputs, deleteOutput, readOutput, saveOutput } from './storage.js';
import { useStudio } from './store.js';

const dateTime = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};
const dateHeading = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Earlier records';
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(date);
};
const makeId = () => crypto.randomUUID();
function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}
function fileIsVideo(file) {
  return file?.type?.startsWith('video/') || /\.(mp4|mov|mkv|webm|avi|m4v|mpeg|mpg|3gp|ogv)$/i.test(file?.name || '');
}
function fileExtension(name) {
  return (name || '').split('.').pop()?.toUpperCase() || 'FILE';
}

function StoredOutputPreview({ resultId, outputName }) {
  const [url,setUrl] = useState('');
  const [status,setStatus] = useState('Loading playable preview…');
  useEffect(() => {
    let active = true;
    let objectUrl = '';
    readOutput(resultId).then((blob) => {
      if (!active) return;
      if (!blob) { setStatus('Preview unavailable; download the saved file again.'); return; }
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
      setStatus('');
    }).catch(() => { if (active) setStatus('Could not load this local preview.'); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  },[resultId]);
  return <div className="queue-preview-wrap">
    {url ? <AudioPlayerModal src={url} title={outputName} subtitle="CONVERSION OUTPUT" buttonLabel="Play converted audio" /> : <small>{status}</small>}
  </div>;
}
function record(action, detail = {}) {
  useStudio.getState().recordActivity({ action, ...detail, date: new Date().toISOString() });
}
function usePageSEO() {
  const location = useLocation();
  useEffect(() => {
    const page = getSeoPage(location.pathname);
    const isAudioStudio = location.pathname === '/audio-studio/';
    const title = isAudioStudio ? 'Audio Editor, Voice Effects & Lyrics Video Maker | Converta' : page?.title || 'Page not found | Converta';
    const description = isAudioStudio ? 'Edit audio, trim and mix clips, transform voice tones, record voiceovers and create timed lyric videos with animated text and backgrounds.' : page?.description || 'The requested Converta page could not be found.';
    const canonical = SITE_URL + (location.pathname.endsWith('/') ? location.pathname : location.pathname + '/');
    document.title = title;
    const setMeta = (selector, attributes) => {
      let node = document.head.querySelector(selector);
      if (!node) { node = document.createElement('meta'); document.head.appendChild(node); }
      Object.entries(attributes).forEach(([key,value]) => node.setAttribute(key,value));
    };
    setMeta('meta[name="description"]',{name:'description',content:description});
    setMeta('meta[name="robots"]',{name:'robots',content:location.pathname === '/history/' ? 'noindex,follow' : 'index,follow,max-image-preview:large'});
    setMeta('meta[property="og:title"]',{'property':'og:title',content:title});
    setMeta('meta[property="og:description"]',{'property':'og:description',content:description});
    setMeta('meta[property="og:url"]',{'property':'og:url',content:canonical});
    let canonicalNode = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalNode) { canonicalNode = document.createElement('link'); canonicalNode.rel = 'canonical'; document.head.appendChild(canonicalNode); }
    canonicalNode.href = canonical;
    let schema = document.getElementById('converta-route-schema');
    if (!schema) { schema = document.createElement('script'); schema.id = 'converta-route-schema'; schema.type = 'application/ld+json'; document.head.appendChild(schema); }
    schema.textContent = JSON.stringify([
      {'@context':'https://schema.org','@type':'WebApplication','name':'Converta Studio','applicationCategory':'MultimediaApplication','operatingSystem':'Any modern browser','url':canonical,'description':description,'offers':{'@type':'Offer','price':'0','priceCurrency':'USD'}},
      {'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Home','item':SITE_URL + '/'},{'@type':'ListItem','position':2,'name':page?.heading || title,'item':canonical}]}
    ]);
  },[location.pathname]);
}

function Brand() {
  return <Link to="/" className="brand" aria-label="Converta home">
    <span className="brand-mark"><AudioWaveform /></span>
    <span className="brand-word">converta<span>.</span><small>MEDIA WORKSPACE</small></span>
  </Link>;
}
function Sidebar() {
  return <aside className="sidebar">
    <Brand />
    <div className="sidebar-section">
      <p className="sidebar-label">WORKSPACE</p>
      <nav className="side-nav" aria-label="Workspace navigation">
        <NavLink to="/" end><LayersIcon />Studio</NavLink>
        <NavLink to="/history/"><HistoryIcon />History</NavLink>
      </nav>
    </div>
    <div className="sidebar-section">
      <p className="sidebar-label">EXPLORE</p>
      <nav className="side-nav" aria-label="Information navigation">
        <NavLink to="/audio-studio/"><AudioWaveform />Audio Studio 5.0</NavLink>
        <NavLink to="/audio-converter/"><AudioLines />Audio converter</NavLink>
        <NavLink to="/video-to-audio/"><FileVideo2 />Video to audio</NavLink>
        <NavLink to="/guides/"><BookOpen />Guides</NavLink>
        <NavLink to="/about/"><Info />About Converta</NavLink>
      </nav>
    </div>
    <div className="sidebar-spacer" />
    <div className="privacy-card">
      <div className="privacy-icon"><ShieldCheck /></div>
      <b>Private by design</b>
      <p>Source media is processed in this browser. Your files are not uploaded to a conversion server.</p>
      <span className="privacy-status"><i /> LOCAL ENGINE</span>
    </div>
    <div className="sidebar-bottom"><span>CONVERTA STUDIO</span><b>VERSION 5.0</b></div>
  </aside>;
}
function LayersIcon() { return <Command />; }

function SearchBox() {
  const [query,setQuery] = useState('');
  const [open,setOpen] = useState(false);
  const navigate = useNavigate();
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const results = useMemo(() => {
    if (deferredQuery.length < 2) return [];
    const seen = new Set();
    const matches = [];
    for (const item of searchIndex.terms) {
      if (item.term.toLowerCase().includes(deferredQuery)) {
        const key = item.route + '|' + item.source + '|' + item.target;
        if (!seen.has(key)) {
          seen.add(key);
          matches.push(item);
        }
      }
      if (matches.length >= 7) break;
    }
    return matches;
  },[deferredQuery]);
  function submit(event) {
    event.preventDefault();
    if (results.length) navigate(results[0].route);
    else if (query.trim()) navigate('/audio-converter/');
    setOpen(false);
  }
  return <div className="search-wrap">
    <form className="global-search" role="search" onSubmit={submit}>
      <Search aria-hidden="true" />
      <input value={query} onChange={(event) => {setQuery(event.target.value);setOpen(true);}} onFocus={() => setOpen(true)} onKeyDown={(event) => {if(event.key === 'Escape') setOpen(false);}} placeholder="Search converters and formats..." aria-label="Search converters and formats" aria-expanded={open && results.length > 0} />
      <kbd>CTRL K</kbd>
      {query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}><X /></button>}
    </form>
    {open && results.length > 0 && <div className="search-results">
      <div className="search-results-label">SUGGESTED CONVERSIONS</div>
      {results.map((item) => <button key={item.route + item.term} type="button" onClick={() => {navigate(item.route);setQuery('');setOpen(false);}}>
        <span className="search-result-icon"><Search /></span><span><b>{item.term}</b><small>{item.source} to {item.target}</small></span><ArrowRight />
      </button>)}
    </div>}
  </div>;
}
function Topbar() {
  const [menuOpen,setMenuOpen] = useState(false);
  return <header className="topbar">
    <div className="mobile-brand"><Brand /></div>
    <div className="topbar-leading"><span className="status-dot" /> ALL SYSTEMS LOCAL</div>
    <SearchBox />
    <div className="topbar-actions">
      <Link to="/guides/" className="topbar-help" aria-label="Read conversion guides"><CircleHelp /></Link>
      <Link to="/history/" className="topbar-history"><Clock3 /> History</Link>
    </div>
    <button className="mobile-menu" aria-label="Open navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><Menu /></button>
    {menuOpen && <nav className="mobile-menu-panel">
      <NavLink to="/" onClick={() => setMenuOpen(false)}>Studio</NavLink>
      <NavLink to="/history/" onClick={() => setMenuOpen(false)}>History</NavLink>
      <NavLink to="/audio-studio/" onClick={() => setMenuOpen(false)}>Audio Studio 5.0</NavLink>
      <NavLink to="/audio-converter/" onClick={() => setMenuOpen(false)}>Audio converter</NavLink>
      <NavLink to="/video-to-audio/" onClick={() => setMenuOpen(false)}>Video to audio</NavLink>
      <NavLink to="/guides/" onClick={() => setMenuOpen(false)}>Guides</NavLink>
      <NavLink to="/about/" onClick={() => setMenuOpen(false)}>About</NavLink>
    </nav>}
  </header>;
}
function Footer() {
  return <footer className="site-footer">
    <div className="footer-brand"><Brand /><p>Private media conversion, built for a better workflow.</p></div>
    <div className="footer-links"><Link to="/audio-studio/">Audio Studio 5.0</Link><Link to="/audio-converter/">Audio converter</Link><Link to="/video-to-audio/">Video to audio</Link><Link to="/guides/">Guides</Link><Link to="/about/">About</Link><Link to="/history/">History</Link></div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Converta Studio</span><span><LockKeyhole /> Your files remain on this device</span><a href="https://github.com/chryslucky/converta" target="_blank" rel="noreferrer">Source code <ArrowRight /></a></div>
  </footer>;
}

function Layout() {
  usePageSEO();
  return <div className="app-shell">
    <Sidebar />
    <div className="app-main">
      <Topbar />
      <div className="page-content">
        <Routes>
          <Route path="/" element={<Studio />} />
          <Route path="/history/" element={<HistoryPage />} />
          <Route path="/audio-studio/" element={<AudioStudio />} />
          <Route path="/about/" element={<SEOContentPage page={getSeoPage('/about/')} />} />
          <Route path="/guides/" element={<GuidesIndex />} />
          <Route path="/:slug/" element={<DynamicSeoRoute />} />
          <Route path="*" element={<DynamicSeoRoute />} />
        </Routes>
      </div>
      <Footer />
    </div>
  </div>;
}

function Eyebrow({children}) { return <div className="eyebrow"><span />{children}</div>; }
function PageHeading({eyebrow,title,description,actions}) {
  return <div className="page-heading">
    <div><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p>{description}</p></div>
    {actions && <div className="heading-actions">{actions}</div>}
  </div>;
}
function Notice({message,onClose}) {
  if (!message) return null;
  return <div className="notice" role="status"><CheckCircle2 /><span>{message}</span><button onClick={onClose} aria-label="Dismiss notice"><X /></button></div>;
}
function StatCard({icon:Icon,label,value,detail,accent}) {
  return <article className={'stat-card ' + (accent || '')}><span className="stat-icon"><Icon /></span><div><small>{label}</small><strong>{value}</strong><span>{detail}</span></div></article>;
}

function Studio() {
  const state = useStudio();
  const picker = useRef(null);
  const dropRef = useRef(null);
  const cancelled = useRef(false);
  const [notice,setNotice] = useState('');
  const [dragging,setDragging] = useState(false);
  const [batchTotal,setBatchTotal] = useState(0);
  const [batchFinished,setBatchFinished] = useState(0);
  const [filter,setFilter] = useState('all');
  const [showSettings,setShowSettings] = useState(true);
  const pendingFiles = state.files.filter((file) => file.status !== 'done');
  const completed = state.history.filter((item) => item.status === 'completed').length;
  const failed = state.history.filter((item) => item.status === 'failed').length;
  const totalProgress = state.isRunning && batchTotal ? Math.min(100,Math.round(((batchFinished + (state.files.find((file) => file.id === state.activeId)?.progress || (state.isEngineLoading ? state.engineProgress : 0))/100) / batchTotal) * 100)) : 0;
  const visibleFiles = state.files.filter((file) => filter === 'all' || file.status === filter);
  const storageUsed = state.history.filter((item) => item.status === 'completed').reduce((sum,item) => sum + (item.size || 0),0);

  function addFiles(list) {
    const input = Array.from(list || []);
    const accepted = input.filter(isSupportedMedia);
    const rejected = input.length - accepted.length;
    if (accepted.length) {
      state.addFiles(accepted);
      accepted.forEach((file) => record('File added',{fileName:file.name,fileSize:file.size,fileType:file.type || 'unknown',status:'queued'}));
    }
    if (rejected) record('Unsupported file skipped',{count:rejected,status:'skipped'});
    setNotice(input.length === accepted.length ? accepted.length + ' file(s) added to the queue.' : accepted.length + ' added; ' + rejected + ' unsupported file(s) skipped.');
  }
  async function startBatch() {
    const queue = useStudio.getState().files.filter((file) => file.status !== 'done');
    if (!queue.length || useStudio.getState().isRunning) return;
    cancelled.current = false;
    setBatchTotal(queue.length);
    setBatchFinished(0);
    state.setRunning(true);
    state.setEngineLoading(true);
    state.setEngineProgress(0);
    setNotice('');
    record('Batch started',{count:queue.length,status:'started'});
    try {
      await getEngine((progress) => useStudio.getState().setEngineProgress(progress));
      state.setEngineLoading(false);
      for (const queued of queue) {
        if (cancelled.current) break;
        const file = useStudio.getState().files.find((item) => item.id === queued.id);
        if (!file || file.status === 'done') { setBatchFinished((value) => value + 1); continue; }
        const startedAt = Date.now();
        const settings = useStudio.getState();
        const format = settings.format;
        const outputName = file.name.replace(/\.[^.]+$/,'') + '.' + format;
        state.setActiveId(file.id);
        state.updateFile(file.id,{status:'converting',progress:0,error:null});
        record('Conversion started',{fileName:file.name,sourceSize:file.size,format,status:'running'});
        try {
          const blob = await convertMedia(file.file,settings,(progress) => useStudio.getState().updateFile(file.id,{progress}));
          if (cancelled.current) throw new Error('Conversion cancelled.');
          const id = makeId();
          await saveOutput(id,blob);
          const endedAt = Date.now();
          const entry = {
            id,outputId:id,name:outputName,sourceName:file.name,sourceType:file.type,format,
            sourceSize:file.size,size:blob.size,bitrate:settings.bitrate,sampleRate:settings.sampleRate,
            status:'completed',date:new Date(endedAt).toISOString(),startedAt:new Date(startedAt).toISOString(),
            durationMs:endedAt-startedAt
          };
          state.addHistory(entry);
          state.updateFile(file.id,{status:'done',progress:100,resultId:id,outputName});
          record('Conversion completed',{fileName:file.name,outputName,format,sourceSize:file.size,outputSize:blob.size,durationMs:endedAt-startedAt,status:'completed'});
          setNotice(file.name + ' converted successfully.');
        } catch (error) {
          const endedAt = Date.now();
          const wasCancelled = cancelled.current || error?.message === 'Conversion cancelled.';
          const status = wasCancelled ? 'cancelled' : 'failed';
          state.updateFile(file.id,{status:status === 'cancelled' ? 'cancelled' : 'error',error:error?.message || 'Conversion failed.'});
          state.addHistory({
            id:makeId(),name:outputName,sourceName:file.name,format,sourceSize:file.size,size:0,status,
            date:new Date(endedAt).toISOString(),startedAt:new Date(startedAt).toISOString(),
            durationMs:endedAt-startedAt,error:error?.message || 'Conversion failed.'
          });
          record(wasCancelled ? 'Conversion cancelled' : 'Conversion failed',{fileName:file.name,format,error:error?.message || 'Conversion failed.',durationMs:endedAt-startedAt,status});
          if (!wasCancelled) setNotice(file.name + ': ' + (error?.message || 'Conversion failed.'));
          if (wasCancelled) break;
        } finally {
          setBatchFinished((value) => value + 1);
        }
      }
      if (cancelled.current) record('Batch stopped',{status:'cancelled'});
      else record('Batch finished',{status:'completed',processed:queue.length});
    } catch (error) {
      setNotice(error?.message || 'The conversion engine could not be loaded.');
      record('Engine initialization failed',{error:error?.message || 'Unknown error',status:'failed'});
    } finally {
      state.setRunning(false);
      state.setEngineLoading(false);
      state.setEngineProgress(0);
      state.setActiveId(null);
      cancelled.current = false;
    }
  }
  function stopBatch() {
    cancelled.current = true;
    const activeId = useStudio.getState().activeId;
    if (activeId) useStudio.getState().updateFile(activeId,{status:'cancelled',progress:0,error:'Cancelled by user.'});
    terminateEngine();
    setNotice('Cancellation requested. The current task will stop and queued files will remain.');
  }
  async function downloadResult(file) {
    try {
      const blob = await readOutput(file.resultId);
      if (!blob) throw new Error('This output is no longer available in local browser storage.');
      download(blob,file.outputName);
      record('Export downloaded',{fileName:file.outputName,outputSize:blob.size,status:'downloaded'});
    } catch (error) { setNotice(error.message); }
  }
  function clearQueue() {
    if (state.isRunning) return;
    state.clearFiles();
    record('Queue cleared',{status:'cleared'});
  }

  return <>
    <section className="hero-panel">
      <div className="hero-copy">
        <Eyebrow>PRIVATE MEDIA WORKSPACE · V5.0</Eyebrow>
        <h1>Make your media<br /><em>work better.</em></h1>
        <p>Convert audio and extract sound from video with a private, focused studio that runs on your device.</p>
        <div className="hero-points"><span><ShieldCheck /> Local processing</span><span><Gauge /> Live progress</span><span><HistoryIcon /> Dated history</span></div>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="wave-orbit orbit-one" /><div className="wave-orbit orbit-two" />
        <div className="hero-disc"><AudioWaveform /><span>CONVERTA</span></div>
        <div className="hero-format format-mp3">MP3 <Check /></div>
        <div className="hero-format format-wav">WAV</div>
        <div className="hero-format format-flac">FLAC</div>
        <div className="hero-art-caption"><span className="art-live" /> BROWSER-POWERED ENGINE</div>
      </div>
    </section>

    <div className="stats-grid">
      <StatCard icon={Files} label="IN YOUR QUEUE" value={state.files.length} detail={pendingFiles.length + ' still to process'} />
      <StatCard icon={CheckCircle2} label="COMPLETED JOBS" value={completed} detail="Recorded conversions" accent="green" />
      <StatCard icon={XCircle} label="FAILED JOBS" value={failed} detail="Visible in history" accent="rose" />
      <StatCard icon={HardDrive} label="OUTPUT LIBRARY" value={formatBytes(storageUsed)} detail="Stored in this browser" accent="blue" />
    </div>

    <Notice message={notice} onClose={() => setNotice('')} />

    <div className="studio-layout">
      <section className="workspace-card">
        <div className="section-header">
          <div><span className="step-number">01</span><div><h2>Import your media</h2><p>Add a file or build a batch queue.</p></div></div>
          <button className="quiet-button" onClick={clearQueue} disabled={!state.files.length || state.isRunning}><Trash2 /> Clear queue</button>
        </div>
        <div ref={dropRef} className={'dropzone ' + (dragging ? 'is-dragging' : '')} role="button" tabIndex={0}
          onClick={() => picker.current?.click()}
          onKeyDown={(event) => {if(event.key === 'Enter' || event.key === ' '){event.preventDefault();picker.current?.click();}}}
          onDragOver={(event) => {event.preventDefault();setDragging(true);}}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {event.preventDefault();setDragging(false);addFiles(event.dataTransfer.files);}}>
          <input ref={picker} type="file" multiple accept="audio/*,video/*,.mkv,.avi,.opus,.flac,.aac,.ogg" hidden onChange={(event) => {addFiles(event.target.files);event.target.value='';}} />
          <span className="drop-icon"><UploadCloud /></span>
          <strong>Drop files to start building your queue</strong>
          <span className="drop-subtext">or <u>browse your device</u></span>
          <div className="format-list"><span>MP3</span><span>WAV</span><span>FLAC</span><span>AAC</span><span>OGG</span><span>MP4</span><span>MOV</span></div>
          <small>Audio and video sources · Multiple files · 300 MB maximum per file</small>
        </div>

        {state.isRunning && <section className="batch-progress">
          <div className="batch-progress-heading"><div><span className="status-pulse" /><b>{state.isEngineLoading ? 'Preparing local conversion engine' : 'Batch conversion in progress'}</b></div><strong>{totalProgress}%</strong></div>
          <div className="progress-track" role="progressbar" aria-label="Overall batch progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={totalProgress}><span style={{width:totalProgress + '%'}} /></div>
          <div className="batch-progress-foot"><span>{state.isEngineLoading ? 'Loading the browser conversion runtime' : batchFinished + ' of ' + batchTotal + ' jobs processed'}</span><button onClick={stopBatch}><Pause /> Stop batch</button></div>
        </section>}

        <div className="queue-toolbar">
          <div><span className="toolbar-label">CONVERSION QUEUE</span><b>{state.files.length} {state.files.length === 1 ? 'file' : 'files'}</b></div>
          <div className="queue-filters">
            <label><Filter /><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter queue"><option value="all">All files</option><option value="ready">Waiting</option><option value="converting">Converting</option><option value="done">Completed</option><option value="error">Failed</option><option value="cancelled">Cancelled</option></select><ChevronDown /></label>
          </div>
        </div>

        {visibleFiles.length ? <div className="file-queue">{visibleFiles.map((file) => <article className="queue-item" key={file.id}>
          <span className={'file-type-icon ' + (fileIsVideo(file) ? 'video' : 'audio')}>{fileIsVideo(file) ? <FileVideo2 /> : <FileAudio2 />}</span>
          <div className="file-main">
            <div className="file-name-line"><b title={file.name}>{file.name}</b><span>{fileExtension(file.name)}</span></div>
            <div className="file-meta"><span>{formatBytes(file.size)}</span><i /> <span className={'status-text ' + file.status}>{file.status === 'ready' ? 'Waiting' : file.status === 'done' ? 'Completed' : file.status === 'error' ? 'Failed' : file.status === 'cancelled' ? 'Cancelled' : 'Converting'}</span></div>
            {file.status === 'converting' && <div className="file-progress"><span style={{width:file.progress + '%'}} /></div>}
            {file.status === 'error' && <p className="file-error">{file.error}</p>}
            {file.status === 'done' && <><div className="file-success"><CheckCircle2 /> Saved as {file.outputName}</div><StoredOutputPreview resultId={file.resultId} outputName={file.outputName} /></>}
          </div>
          <div className="queue-actions">{file.status === 'done' && <button onClick={() => downloadResult(file)} aria-label={'Download ' + file.outputName}><Download /></button>}<button onClick={() => {record('File removed from queue',{fileName:file.name,fileSize:file.size,status:'removed'});state.removeFile(file.id);}} disabled={state.activeId === file.id} aria-label={'Remove ' + file.name}><X /></button></div>
        </article>)}</div> : <div className="queue-empty"><FolderOpen /><b>{state.files.length ? 'No matching files' : 'Your conversion queue is empty'}</b><p>{state.files.length ? 'Change the filter to see other jobs.' : 'Add a supported audio or video file to begin.'}</p></div>}

        <div className="queue-bottom"><span><LockKeyhole /> Your source files are not uploaded.</span><span>Sequential processing helps manage browser memory.</span></div>
      </section>

      <aside className="settings-column">
        <section className="settings-card">
          <div className="section-header compact">
            <div><span className="step-number">02</span><div><h2>Output settings</h2><p>Choose your audio profile.</p></div></div>
            <button className="icon-quiet" onClick={() => setShowSettings(!showSettings)} aria-label={showSettings ? 'Collapse output settings' : 'Expand output settings'}><SlidersHorizontal /><ChevronDown className={showSettings ? '' : 'rotated'} /></button>
          </div>
          {showSettings && <>
            <label className="control-label">OUTPUT FORMAT</label>
            <div className="output-options">{OUTPUT_FORMATS.map((format) => <button key={format.id} type="button" className={state.format === format.id ? 'output-option active' : 'output-option'} onClick={() => state.setFormat(format.id)} aria-pressed={state.format === format.id}>
              <span className="format-symbol">{format.id.toUpperCase().slice(0,2)}</span><span><b>{format.name}</b><small>{format.detail}</small></span>{state.format === format.id && <CheckCircle2 />}
            </button>)}</div>
            <div className="setting-field"><div><label htmlFor="bitrate">Audio bitrate</label><small>Applies to MP3, AAC and OGG.</small></div><select id="bitrate" value={state.bitrate} disabled={!OUTPUT_FORMATS.find((item) => item.id === state.format)?.lossy} onChange={(event) => state.setBitrate(event.target.value)}>{['96k','128k','192k','256k','320k'].map((rate) => <option key={rate}>{rate}</option>)}</select></div>
            <div className="setting-field"><div><label htmlFor="sample-rate">Sample rate</label><small>Keep the source or resample.</small></div><select id="sample-rate" value={state.sampleRate} onChange={(event) => state.setSampleRate(event.target.value)}><option value="source">Match source</option><option value="44100">44.1 kHz</option><option value="48000">48 kHz</option><option value="96000">96 kHz</option></select></div>
            <div className="quality-note"><Info /><span>{['wav','flac'].includes(state.format) ? 'Lossless output profile. Bitrate does not apply.' : 'Use a higher bitrate for larger output files. Conversion cannot restore quality missing from the source.'}</span></div>
          </>}
          <button className="convert-button" disabled={!pendingFiles.length || state.isRunning} onClick={startBatch}>
            {state.isRunning ? <><LoaderCircle className="spin" /> Processing queue</> : <><Sparkles /> Convert {pendingFiles.length} {pendingFiles.length === 1 ? 'file' : 'files'} <ArrowRight /></>}
          </button>
          <div className="settings-assurance"><ShieldCheck /> Files processed on this device</div>
        </section>
        <section className="engine-card">
          <div className="engine-card-top"><span className="engine-icon"><Activity /></span><span className="engine-ready"><i /> ENGINE READY</span></div>
          <p className="engine-kicker">BROWSER-POWERED ENGINE</p>
          <h3>Powerful processing.<br /><em>Personal privacy.</em></h3>
          <p>FFmpeg WebAssembly handles supported media inside your browser. No remote conversion account is required.</p>
          <div className="engine-badges"><span><LockKeyhole /> Local</span><span><Zap /> Batch ready</span></div>
        </section>
        <section className="recent-card">
          <div className="recent-heading"><b>Recent exports</b><Link to="/history/">View history <ArrowRight /></Link></div>
          {state.history.filter((item) => item.status === 'completed').slice(0,3).map((item) => <div className="recent-export" key={item.id}><span><Music2 /></span><div><b>{item.name}</b><small>{formatBytes(item.size)} · {dateTime(item.date)}</small></div></div>)}
          {!state.history.some((item) => item.status === 'completed') && <p className="no-recent">Completed exports appear here.</p>}
        </section>
      </aside>
    </div>
    <section className="discover-section">
      <div><Eyebrow>EXPLORE CONVERTA</Eyebrow><h2>Start with the format you have.</h2><p>Use a dedicated conversion guide for common audio and video workflows.</p></div>
      <div className="discover-links">{['/audio-studio/','/mp4-to-mp3/','/wav-to-mp3/','/flac-to-mp3/','/mp3-to-wav/'].map((path) => {const page = getSeoPage(path);return <Link to={path} key={path}><span><AudioLines /></span><b>{page.heading}</b><ArrowRight /></Link>;})}</div>
    </section>
  </>;
}

function HistoryPage() {
  const state = useStudio();
  const [tab,setTab] = useState('conversions');
  const [query,setQuery] = useState('');
  const [filter,setFilter] = useState('all');
  const [notice,setNotice] = useState('');
  const [busy,setBusy] = useState('');
  const history = useMemo(() => {
    return state.history.filter((item) => {
      const matchQuery = !query || (item.name + ' ' + (item.sourceName || '') + ' ' + item.format).toLowerCase().includes(query.toLowerCase());
      const matchFilter = filter === 'all' || item.status === filter;
      return matchQuery && matchFilter;
    }).slice().sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0));
  },[state.history,query,filter]);
  const activity = useMemo(() => state.activity.filter((item) => !query || (item.action + ' ' + (item.fileName || '') + ' ' + (item.outputName || '')).toLowerCase().includes(query.toLowerCase())).slice().sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0)),[state.activity,query]);
  const completed = state.history.filter((item) => item.status === 'completed');
  const savedSize = completed.reduce((sum,item) => sum + (item.size || 0),0);
  const grouped = groupByDate(tab === 'conversions' ? history : activity);

  async function downloadItem(item) {
    if (!item.outputId) return;
    setBusy(item.id);
    try {
      const blob = await readOutput(item.outputId);
      if (!blob) throw new Error('This export is no longer available in browser storage.');
      download(blob,item.name);
      record('Export downloaded',{fileName:item.name,outputSize:blob.size,status:'downloaded'});
    } catch (error) { setNotice(error.message); }
    finally { setBusy(''); }
  }
  async function deleteItem(item) {
    try {
      if (item.outputId) await deleteOutput(item.outputId);
      state.removeHistory(item.id);
      record('History record deleted',{fileName:item.name,status:'deleted'});
    } catch (error) { setNotice(error.message); }
  }
  async function clearAll() {
    try {
      await clearOutputs();
      state.clearHistory();
      state.clearActivity();
      setNotice('Local history and activity records cleared.');
    } catch (error) { setNotice(error.message); }
  }

  return <>
    <PageHeading eyebrow="YOUR LOCAL LIBRARY" title="History & activity" description="A dated record of conversion jobs, exported files and important workspace actions." actions={<button className="secondary-button" onClick={clearAll} disabled={!state.history.length && !state.activity.length}><Trash2 /> Clear records</button>} />
    <Notice message={notice} onClose={() => setNotice('')} />
    <div className="history-stats"><StatCard icon={Files} label="TOTAL JOBS" value={state.history.length} detail="All conversion outcomes" /><StatCard icon={CheckCircle2} label="COMPLETED" value={completed.length} detail="Successful exports" accent="green" /><StatCard icon={HardDrive} label="OUTPUT SIZE" value={formatBytes(savedSize)} detail="Completed export files" accent="blue" /><StatCard icon={Activity} label="ACTIVITY EVENTS" value={state.activity.length} detail="Saved locally by date" accent="violet" /></div>
    <section className="history-panel">
      <div className="history-panel-head"><div><h2>Workspace records</h2><p>Use the tabs and filters to find a past event.</p></div><div className="history-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your records" aria-label="Search history" /></div></div>
      <div className="history-controls"><div className="history-tabs"><button className={tab === 'conversions' ? 'selected' : ''} onClick={() => setTab('conversions')}>Conversions <span>{state.history.length}</span></button><button className={tab === 'activity' ? 'selected' : ''} onClick={() => setTab('activity')}>Activity log <span>{state.activity.length}</span></button></div>
        {tab === 'conversions' && <label className="history-filter"><ListFilter /><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All outcomes</option><option value="completed">Completed</option><option value="failed">Failed</option><option value="cancelled">Cancelled</option></select><ChevronDown /></label>}
      </div>
      {tab === 'conversions' && history.length ? <div className="record-list">{grouped.map(([day,items]) => <section className="date-group" key={day}><h3>{day}</h3>{items.map((item) => <article className="history-record" key={item.id}>
        <span className={'record-icon ' + item.status}>{item.status === 'completed' ? <FileAudio2 /> : item.status === 'failed' ? <XCircle /> : <Pause />}</span>
        <div className="record-main"><b>{item.name}</b><small>{item.sourceName ? 'Source: ' + item.sourceName + ' · ' : ''}{dateTime(item.date)} · {formatBytes(item.size || item.sourceSize || 0)}</small>{item.error && <p className="record-error">{item.error}</p>}{item.outputId && <StoredOutputPreview resultId={item.outputId} outputName={item.name} />}</div>
        <span className={'record-status ' + item.status}>{item.status}</span>
        {item.outputId && <button className="record-action" disabled={busy === item.id} onClick={() => downloadItem(item)} aria-label={'Download ' + item.name}>{busy === item.id ? <LoaderCircle className="spin" /> : <Download />}</button>}
        <button className="record-action subtle" onClick={() => deleteItem(item)} aria-label={'Delete history item ' + item.name}><Trash2 /></button>
      </article>)}</section>)}</div> : tab === 'activity' && activity.length ? <div className="timeline">{grouped.map(([day,items]) => <section className="date-group" key={day}><h3>{day}</h3>{items.map((item) => <article className="activity-record" key={item.id}><span className="timeline-dot" /><div><b>{item.action}</b><small>{dateTime(item.date)}{item.fileName ? ' · ' + item.fileName : ''}{item.outputName ? ' · ' + item.outputName : ''}</small>{item.error && <p className="record-error">{item.error}</p>}</div><span className={'record-status ' + (item.status || 'info')}>{item.status || 'recorded'}</span></article>)}</section>)}</div> : <div className="history-empty"><HistoryIcon /><h3>No matching records</h3><p>{tab === 'conversions' ? 'Completed, failed and cancelled conversion attempts appear here.' : 'Files added, conversions started, exports downloaded and other actions are recorded here.'}</p><Link to="/" className="secondary-button"><Plus /> Start a conversion</Link></div>}
    </section>
    <p className="local-storage-note"><ShieldCheck /> Records and exports are stored in this browser. They are not a cloud backup and may be removed when browser site data is cleared.</p>
  </>;
}
function groupByDate(items) {
  const groups = new Map();
  items.forEach((item) => {
    const day = dateHeading(item.date);
    if (!groups.has(day)) groups.set(day,[]);
    groups.get(day).push(item);
  });
  return Array.from(groups.entries());
}

function GuidesIndex() {
  const pages = SEO_PAGES.filter((page) => page.kind === 'guide');
  return <SEOContentPage page={getSeoPage('/guides/')} extraPages={pages} />;
}
function DynamicSeoRoute() {
  const location = useLocation();
  const page = getSeoPage(location.pathname);
  if (!page) return <NotFound />;
  return <SEOContentPage page={page} />;
}
function SEOContentPage({page,extraPages=[]}) {
  if (!page) return <NotFound />;
  const isGuide = page.kind === 'guide' || page.kind === 'guides';
  return <div className="seo-page">
    <div className="seo-hero">
      <div className="seo-hero-copy"><Eyebrow>{page.eyebrow}</Eyebrow><h1>{page.heading}</h1><p>{page.intro}</p><div className="seo-hero-actions"><Link className="convert-button" to="/"><Sparkles /> Open the converter <ArrowRight /></Link><span><ShieldCheck /> Local browser processing</span></div></div>
      <div className="seo-visual"><span className="seo-visual-icon">{isGuide ? <BookOpen /> : <AudioWaveform />}</span><div className="seo-visual-wave"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><b>{page.kind === 'guide' ? 'FORMAT GUIDE' : page.kind === 'guides' ? 'KNOWLEDGE LIBRARY' : 'LOCAL CONVERSION'}</b><small>CONVERTA STUDIO V5</small></div>
    </div>
    <div className="seo-feature-grid">{(page.benefits || []).map((benefit,index) => <article key={benefit}><span>{index === 0 ? <ShieldCheck /> : index === 1 ? <Gauge /> : index === 2 ? <HistoryIcon /> : <CheckCircle2 />}</span><p>{benefit}</p></article>)}</div>
    <article className="article-card">
      <div className="article-header"><Eyebrow>{isGuide ? 'PRACTICAL INFORMATION' : 'HOW IT WORKS'}</Eyebrow><h2>{page.kind === 'guides' ? 'Guides for better conversion decisions' : 'A clear workflow from source to result'}</h2></div>
      {(page.sections || []).map((section) => <section className="article-section" key={section.heading}><h3>{section.heading}</h3><p>{section.body}</p></section>)}
      {page.steps?.length > 0 && <section className="article-section how-to"><h3>{page.kind === 'guide' ? 'Practical steps' : 'How to use this workflow'}</h3><ol>{page.steps.map((step,index) => <li key={step}><span>{String(index + 1).padStart(2,'0')}</span>{step}</li>)}</ol></section>}
      {extraPages.length > 0 && <section className="article-section"><h3>Browse the guides</h3><div className="guide-grid">{extraPages.map((item) => <Link className="guide-card" to={item.path} key={item.path}><BookOpen /><b>{item.heading}</b><p>{item.description}</p><span>Read guide <ArrowRight /></span></Link>)}</div></section>}
      {page.faqs?.length > 0 && <section className="article-section"><h3>Frequently asked questions</h3><div className="faq-list">{page.faqs.map((faq) => <details key={faq[0]}><summary>{faq[0]}<ChevronDown /></summary><p>{faq[1]}</p></details>)}</div></section>}
    </article>
    <div className="seo-cta"><span><AudioWaveform /></span><div><h2>Ready to convert your file?</h2><p>Choose an output format and follow every step in the conversion queue.</p></div><Link to="/" className="convert-button">Go to studio <ArrowRight /></Link></div>
    {page.related?.length > 0 && <section className="related-pages"><div><Eyebrow>CONTINUE EXPLORING</Eyebrow><h2>Related tools and resources</h2></div><div>{page.related.map((path) => {const related = getSeoPage(path);return related ? <Link key={path} to={path}>{related.heading}<ArrowRight /></Link> : null;})}</div></section>}
  </div>;
}
function NotFound() {
  return <section className="not-found"><span>404</span><h1>This page is not available.</h1><p>The address may have changed or the page may not exist.</p><Link to="/" className="convert-button">Return to the studio <ArrowRight /></Link></section>;
}

export default function App() {
  return <Layout />;
}
