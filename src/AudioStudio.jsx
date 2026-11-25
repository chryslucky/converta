import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, AudioLines, AudioWaveform, Check, ChevronDown, CircleHelp, Clapperboard,
  Download, FileAudio2, Film, Headphones, ImagePlus, Layers, Mic, Pause, Play, Plus,
  Radio, RotateCcw, Scissors, SlidersHorizontal, Sparkles, Trash2, Upload, Video, WandSparkles, X
} from 'lucide-react';
import {
  audioBufferToWav, decodeAudioFile, joinAudioBuffers, mixAudioBuffers,
  processAudioBuffer, sliceAudioBuffer
} from './audio-tools.js';
import './audio-studio.css';

const id = () => globalThis.crypto?.randomUUID?.() || String(Date.now()) + Math.random().toString(16).slice(2);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const seconds = (value) => Number.isFinite(value) ? value.toFixed(2) + ' s' : '—';
const VOICES = [
  ['Natural',{}],['Adult man · deep',{pitch:-4,bass:5,treble:-2}],['Adult man · bright',{pitch:-2,bass:2,treble:4}],
  ['Child · playful',{pitch:5,speed:1.03,treble:3}],['Teen · light',{pitch:2,treble:2}],['Robot · classic',{pitch:-1,robot:0.9,distortion:12}],
  ['Android · digital',{pitch:2,robot:0.65,chorus:0.35,highpass:140}],['Alien · space',{pitch:7,robot:0.5,echo:0.25}],['Giant · cinematic',{pitch:-7,speed:0.88,reverb:0.28}],
  ['Tiny · squeaky',{pitch:9,speed:1.16}],['Chipmunk',{pitch:8,speed:1.22,treble:4}],['Monster · growl',{pitch:-9,distortion:22,bass:7,lowpass:6000}],
  ['Demon · dark',{pitch:-6,distortion:30,reverb:0.35,lowpass:5000}],['Whisper · airy',{pitch:1,highpass:250,treble:7,gain:75}],
  ['Radio presenter',{highpass:380,lowpass:3400,distortion:8,compress:true}],['Telephone',{highpass:480,lowpass:2800,distortion:14}],
  ['Megaphone',{highpass:300,lowpass:4200,distortion:25,compress:true}],['Announcer',{pitch:-1,bass:3,compress:true,reverb:0.12}],
  ['Cartoon',{pitch:5,chorus:0.45,echo:0.12}],['Vintage tape',{pitch:-1,lowpass:7500,distortion:10,chorus:0.18}],
  ['Underwater',{pitch:-2,lowpass:850,reverb:0.4}],['Cave echo',{reverb:0.85,echo:0.48}],['Space radio',{robot:0.5,echo:0.35,highpass:180}],
  ['Synth voice',{robot:0.72,chorus:0.55,distortion:16}],['Retro game',{pitch:7,robot:0.5,distortion:20}],
  ['Dreamy',{pitch:1,reverb:0.65,chorus:0.4}],['Warm narrator',{pitch:-2,bass:4,treble:1,compress:true}],
  ['Broadcast FM',{highpass:90,lowpass:11000,compress:true,chorus:0.12}],['Dark villain',{pitch:-5,bass:5,lowpass:6200,reverb:0.22}],
  ['Bright mascot',{pitch:4,treble:6,chorus:0.22}],['Glitch voice',{robot:0.8,distortion:36,echo:0.2}],
  ['Large hall',{reverb:0.95,echo:0.18}],['Close studio',{highpass:60,lowpass:15000,compress:true}]
].map(([name, settings]) => ({name, settings}));

const FONTS = [
  'Arial','Arial Black','Georgia','Times New Roman','Verdana','Tahoma','Trebuchet MS','Impact',
  'Courier New','Lucida Console','Palatino Linotype','Garamond','Comic Sans MS','Segoe UI',
  'system-ui','serif','sans-serif','monospace','cursive','fantasy','Franklin Gothic Medium',
  'Century Gothic','Gill Sans','Bookman Old Style','Copperplate','Brush Script MT','Rockwell',
  'American Typewriter','Optima','Futura','Didot','Baskerville'
];
const GRADIENTS = Array.from({length:30},(_,i)=>({
  name:['Aurora','Emerald glow','Solar flare','Ocean glass','Violet haze','Rose gold','Arctic light','Citrus pop','Midnight','Coral bloom'][i%10]+' '+String(Math.floor(i/10)+1),
  colors:['hsl('+(i*31+154)%360+' 82% 52%)','hsl('+(i*31+244)%360+' 78% 45%)','hsl('+(i*31+42)%360+' 85% 58%)'],
  angle:(i*37)%360
}));
const BACKGROUNDS = [
  'Aurora ribbons','Particle field','Moving light beams','Star drift','Neon grid','Soft bokeh','Liquid waves','Orbit rings','Spectrum bars','Glowing dust',
  'Diagonal motion','Solar pulse','Bubble drift','Digital rain','Ribbon tunnel','Prism rays','Electric arcs','Comet trails','Pulse circles','Flow field',
  'Laser sweep','Northern sky','Pixel field','Radiant halo','Soft clouds','Geometric mesh','Moving dots','Wave contours','Shimmer lines','Chromatic fog'
];
const ANIMATION_VARIANTS = [
  ['Soft fade','Quick fade','Slow fade','Fade through','Blur fade','Glow fade','Flicker fade','Color fade','Zoom fade','Smooth fade'],
  ['Rise','Rise stagger','Rise bounce','Rise elastic','Rise blur','Rise glow','Rise quick','Rise slow','Rise diagonal','Rise float'],
  ['Drop','Drop stagger','Drop bounce','Drop elastic','Drop blur','Drop glow','Drop quick','Drop slow','Drop diagonal','Drop float'],
  ['Slide left','Glide left','Elastic left','Fast left','Soft left','Blur left','Stagger left','Bounce left','Diagonal left','Fade left'],
  ['Slide right','Glide right','Elastic right','Fast right','Soft right','Blur right','Stagger right','Bounce right','Diagonal right','Fade right'],
  ['Zoom in','Soft zoom','Quick zoom','Overshoot zoom','Zoom blur','Zoom glow','Zoom pulse','Zoom bounce','Zoom from far','Zoom focus'],
  ['Bounce','Rubber bounce','Spring bounce','Double bounce','Soft bounce','Heavy bounce','Bounce up','Bounce down','Bounce drift','Bounce pulse'],
  ['Rotate in','Spin clockwise','Spin counter','Tilt reveal','Pendulum','Swing in','Swing out','Card turn','Vertical roll','Horizontal roll'],
  ['Typewriter','Character cascade','Word cascade','Kinetic type','Letter fade','Word fade','Type bounce','Character roll','Decode type','Karaoke reveal'],
  ['Wave','Wave baseline','Wave in','Wave out','Ripple in','Ripple out','Flowing wave','Sine drift','Wave pulse','Liquid motion'],
  ['Jitter','Glitch slice','Chromatic glitch','Digital strobe','Neon flicker','Pixel scatter','Micro shake','Signal noise','Prism split','Static burst'],
  ['Pop','Stamp','Elastic pop','Flash pop','Pulse glow','Heartbeat','Spotlight','Shimmer reveal','Morph pop','Focus snap']
];
const ANIMATIONS = ANIMATION_VARIANTS.flatMap((variants,family)=>variants.map((name,variant)=>({name,index:family*10+variant})));

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),60000);
}
function addBlobTrack(blob,name) {
  return new File([blob],name,{type:blob.type || 'audio/wav',lastModified:Date.now()});
}
function durationOf(buffer) { return buffer ? buffer.duration : 0; }

export default function AudioStudio() {
  const [tab,setTab] = useState('editor');
  const [tracks,setTracks] = useState([]);
  const [selectedId,setSelectedId] = useState('');
  const [selectedMix,setSelectedMix] = useState([]);
  const [voiceovers,setVoiceovers] = useState([]);
  const [sourceBuffer,setSourceBuffer] = useState(null);
  const [sourceLoading,setSourceLoading] = useState(false);
  const [settings,setSettings] = useState({trimStart:0,trimEnd:0,cutStart:null,cutEnd:null,fadeIn:0,fadeOut:0,gain:100,speed:1,pitch:0,bass:0,treble:0,highpass:0,lowpass:0,distortion:0,echo:0,reverb:0,chorus:0,normalize:false,reverse:false,removeSilence:false,mono:false,compress:true,gateDb:-42});
  const [voiceIndex,setVoiceIndex] = useState(0);
  const [notice,setNotice] = useState('');
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  const [previewBlob,setPreviewBlob] = useState(null);
  const [previewUrl,setPreviewUrl] = useState('');
  const [outputName,setOutputName] = useState('');
  const audioRef = useRef(null);
  const micRef = useRef(null);
  const [recording,setRecording] = useState(false);

  const selectedTrack = tracks.find((track)=>track.id===selectedId);
  const activePreset = VOICES[voiceIndex] || VOICES[0];
  const featureCount = 36;
  const activeDuration = durationOf(sourceBuffer);

  useEffect(()=>{
    let cancelled=false;
    async function load() {
      if (!selectedTrack) { setSourceBuffer(null); return; }
      setSourceLoading(true); setError('');
      try {
        const decoded=await decodeAudioFile(selectedTrack.file);
        if (!cancelled) {
          setSourceBuffer(decoded);
          setSettings((old)=>({...old,trimStart:0,trimEnd:decoded.duration,cutStart:null,cutEnd:null}));
        }
      } catch (e) { if (!cancelled) setError(e.message); }
      finally { if (!cancelled) setSourceLoading(false); }
    }
    load();
    return ()=>{cancelled=true;};
  },[selectedId,selectedTrack?.file]);

  useEffect(()=>{
    if (!previewBlob) { setPreviewUrl(''); return; }
    const url=URL.createObjectURL(previewBlob);
    setPreviewUrl(url);
    return ()=>URL.revokeObjectURL(url);
  },[previewBlob]);

  function patchSettings(patch) { setSettings((old)=>({...old,...patch})); }
  function importTracks(fileList) {
    const items=Array.from(fileList||[]).filter((file)=>(file.type||'').startsWith('audio/') || /\.(mp3|wav|flac|aac|m4a|ogg|opus|weba|webm|aif|aiff)$/i.test(file.name));
    if (!items.length) { setError('Choose audio files (MP3, WAV, FLAC, AAC, M4A, OGG or WebM).'); return; }
    const next=items.map((file)=>({id:id(),file,name:file.name,include:true}));
    setTracks((old)=>[...old,...next]);
    setSelectedId((old)=>old||next[0].id);
    setSelectedMix((old)=>[...old,...next.map((item)=>item.id)]);
    setError('');
    setNotice(items.length+' audio clip(s) added to the workspace.');
  }
  function removeTrack(trackId) {
    setTracks((old)=>old.filter((track)=>track.id!==trackId));
    setSelectedMix((old)=>old.filter((value)=>value!==trackId));
    if (selectedId===trackId) {
      const next=tracks.find((track)=>track.id!==trackId);
      setSelectedId(next?.id || '');
    }
  }
  async function exportBuffer(buffer,name) {
    const blob=audioBufferToWav(buffer);
    setPreviewBlob(blob);
    setOutputName(name.endsWith('.wav')?name:name.replace(/\.[^.]+$/,'')+'.wav');
    setNotice('Audio is rendered as WAV. Preview it here or download the export.');
    return blob;
  }
  async function applyAndExport() {
    if (!sourceBuffer || busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const processed=await processAudioBuffer(sourceBuffer,{...settings,voicePreset:activePreset.settings});
      let finalBuffer=processed;
      if (voiceovers.length) {
        const layers=[{buffer:processed,gain:100,offset:0}];
        for (const voice of voiceovers) {
          const buffer=await decodeAudioFile(voice.file);
          layers.push({buffer,gain:voice.gain,offset:voice.offset});
        }
        finalBuffer=await mixAudioBuffers(layers);
      }
      await exportBuffer(finalBuffer,(selectedTrack?.name||'audio')+'-studio-edit.wav');
    } catch(e) { setError(e.message || 'Audio processing failed.'); }
    finally { setBusy(false); }
  }
  async function buildMix(sequential) {
    const list=tracks.filter((track)=>selectedMix.includes(track.id));
    if (!list.length || busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const buffers=[];
      for (const track of list) buffers.push(await decodeAudioFile(track.file));
      const output=sequential?joinAudioBuffers(buffers):await mixAudioBuffers(buffers.map((buffer,index)=>({buffer,offset:0,gain:100,pan:0})));
      await exportBuffer(output,sequential?'merged-clips.wav':'combined-mix.wav');
    } catch(e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function splitAtCursor() {
    if (!sourceBuffer) return;
    const point=clamp(Number(settings.cutStart ?? sourceBuffer.duration/2),0.1,sourceBuffer.duration-0.1);
    const left=sliceAudioBuffer(sourceBuffer,0,point);
    const right=sliceAudioBuffer(sourceBuffer,point,sourceBuffer.duration);
    const base=(selectedTrack?.name||'clip').replace(/\.[^.]+$/,'');
    const additions=[
      {id:id(),file:addBlobTrack(audioBufferToWav(left),base+'-part-1.wav'),name:base+'-part-1.wav',include:true},
      {id:id(),file:addBlobTrack(audioBufferToWav(right),base+'-part-2.wav'),name:base+'-part-2.wav',include:true}
    ];
    setTracks((old)=>[...old,...additions]);
    setSelectedMix((old)=>[...old,...additions.map((item)=>item.id)]);
    setNotice('Split created two separate editable clips in the library.');
  }
  async function duplicateClip() {
    if (!sourceBuffer) return;
    const name=(selectedTrack?.name||'clip').replace(/\.[^.]+$/,'')+'-copy.wav';
    const file=addBlobTrack(audioBufferToWav(sourceBuffer),name);
    const item={id:id(),file,name,include:true};
    setTracks((old)=>[...old,item]);
    setSelectedId(item.id);
  }
  function addVoiceovers(fileList) {
    const files=Array.from(fileList||[]).filter((file)=>(file.type||'').startsWith('audio/') || /\.(mp3|wav|m4a|ogg|webm)$/i.test(file.name));
    setVoiceovers((old)=>[...old,...files.map((file)=>({id:id(),file,name:file.name,offset:0,gain:100}))]);
  }
  function updateVoice(idValue,patch) { setVoiceovers((old)=>old.map((voice)=>voice.id===idValue?{...voice,...patch}:voice)); }
  async function recordVoiceover() {
    if (recording) { micRef.current?.stop(); return; }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { setError('Microphone recording is not supported in this browser.'); return; }
    try {
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      const recorder=new MediaRecorder(stream);
      const chunks=[];
      recorder.ondataavailable=(event)=>{if(event.data.size) chunks.push(event.data);};
      recorder.onstop=()=>{
        const blob=new Blob(chunks,{type:recorder.mimeType||'audio/webm'});
        const name='voiceover-'+new Date().toISOString().replace(/[:.]/g,'-')+'.webm';
        setVoiceovers((old)=>[...old,{id:id(),file:addBlobTrack(blob,name),name,offset:0,gain:100}]);
        stream.getTracks().forEach((track)=>track.stop());
        setRecording(false); micRef.current=null;
      };
      micRef.current=recorder; recorder.start(); setRecording(true); setError('');
    } catch(e) { setError('Microphone permission was denied or the input device is unavailable. '+e.message); }
  }

  const [lyricsFile,setLyricsFile]=useState(null);
  const [lyricsAudioURL,setLyricsAudioURL]=useState('');
  const [images,setImages]=useState([]);
  const [lines,setLines]=useState([]);
  const [design,setDesign]=useState({font:'Arial',fontSize:58,color:'#ffffff',gradientIndex:0,backgroundIndex:0,animationIndex:0,useGradient:true,shadow:true,outline:false,position:'center',backgroundImage:-1});
  const [currentTime,setCurrentTime]=useState(0);
  const [videoBusy,setVideoBusy]=useState(false);
  const [videoBlob,setVideoBlob]=useState(null);
  const [videoURL,setVideoURL]=useState('');
  const [videoFileName,setVideoFileName]=useState('');
  const [videoFormat,setVideoFormat]=useState('');
  const lyricsAudioRef=useRef(null);
  const videoCanvasRef=useRef(null);
  const imageObjectsRef=useRef([]);
  const [imageVersion,setImageVersion]=useState(0);

  useEffect(()=>{
    if (!lyricsFile) { setLyricsAudioURL(''); return; }
    const url=URL.createObjectURL(lyricsFile); setLyricsAudioURL(url);
    return ()=>URL.revokeObjectURL(url);
  },[lyricsFile]);
  useEffect(()=>{
    if (!videoBlob) { setVideoURL(''); return; }
    const url=URL.createObjectURL(videoBlob); setVideoURL(url);
    return ()=>URL.revokeObjectURL(url);
  },[videoBlob]);
  useEffect(()=>{
    const loaded=images.map((image)=>({file:image,url:URL.createObjectURL(image)}));
    imageObjectsRef.current=loaded.map((item)=>({file:item.file,url:item.url,image:null}));
    loaded.forEach((item,index)=>{
      const image=new Image();
      image.onload=()=>{if(imageObjectsRef.current[index]){imageObjectsRef.current[index].image=image;setImageVersion((v)=>v+1);}};
      image.src=item.url;
    });
    return ()=>loaded.forEach((item)=>URL.revokeObjectURL(item.url));
  },[images]);

  const activeLyric=useMemo(()=>lines.find((line)=>currentTime>=line.start&&currentTime<=line.end),[lines,currentTime]);
  const previewCanvas=videoCanvasRef.current;
  useEffect(()=>{
    if (!previewCanvas) return;
    const ctx=previewCanvas.getContext('2d');
    if (!ctx) return;
    drawLyricFrame(ctx,1280,720,currentTime,lines,design,imageObjectsRef.current);
  },[previewCanvas,currentTime,lines,design,images,imageVersion]);

  function importLyricsAudio(file) {
    if (!file) return;
    if (!(file.type||'').startsWith('audio/') && !/\.(mp3|wav|m4a|aac|ogg|flac|webm)$/i.test(file.name)) { setError('Choose an audio file for the lyrics video.'); return; }
    setLyricsFile(file); setCurrentTime(0); setLines([]);
    setVideoBlob(null);
  }
  function importImages(fileList) {
    const accepted=Array.from(fileList||[]).filter((file)=>file.type.startsWith('image/'));
    setImages((old)=>[...old,...accepted].slice(0,10));
    if (accepted.length) setNotice('Added image backgrounds. A maximum of 10 images is supported.');
  }
  function addLyricLine() {
    const start=lines.length ? Math.max(...lines.map((line)=>line.end)) : 0;
    setLines((old)=>[...old,{id:id(),text:'Your lyric goes here',start,end:start+4,font:design.font,fontSize:design.fontSize,color:design.color,gradientIndex:design.gradientIndex,animationIndex:design.animationIndex,backgroundImage:design.backgroundImage}]);
  }
  function updateLine(lineId,patch) { setLines((old)=>old.map((line)=>line.id===lineId?{...line,...patch}:line)); }
  function removeLine(lineId) { setLines((old)=>old.filter((line)=>line.id!==lineId)); }

  async function renderLyricVideo() {
    if (!lyricsFile || !lines.length || videoBusy) return;
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) { setError('This browser does not support canvas video recording. Use a current desktop Chrome or Edge browser.'); return; }
    setVideoBusy(true); setError(''); setNotice('');
    let context;
    let recorder;
    try {
      const bytes=await lyricsFile.arrayBuffer();
      context=new (window.AudioContext||window.webkitAudioContext)();
      const audio=await context.decodeAudioData(bytes.slice(0));
      await context.resume();
      const canvas=document.createElement('canvas'); canvas.width=1280; canvas.height=720;
      const ctx=canvas.getContext('2d');
      const canvasStream=canvas.captureStream(30);
      const audioDestination=context.createMediaStreamDestination();
      const source=context.createBufferSource(); source.buffer=audio;
      source.connect(audioDestination);
      const combined=new MediaStream([...canvasStream.getVideoTracks(),...audioDestination.stream.getAudioTracks()]);
      const mimeTypes=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
      const supported=mimeTypes.find((mime)=>MediaRecorder.isTypeSupported(mime))||'';
      if (!supported) throw new Error('No supported video recording format was found in this browser.');
      recorder=new MediaRecorder(combined,{mimeType:supported,videoBitsPerSecond:6500000,audioBitsPerSecond:192000});
      const chunks=[];
      recorder.ondataavailable=(event)=>{if(event.data.size)chunks.push(event.data);};
      const complete=new Promise((resolve,reject)=>{
        recorder.onstop=()=>resolve(new Blob(chunks,{type:recorder.mimeType||'video/webm'}));
        recorder.onerror=()=>reject(new Error('The browser video recorder stopped unexpectedly.'));
      });
      recorder.start(250);
      const started=context.currentTime;
      const renderFrame=()=>{
        const time=clamp(context.currentTime-started,0,audio.duration);
        drawLyricFrame(ctx,1280,720,time,lines,design,imageObjectsRef.current);
        if (recorder.state==='recording' && time<audio.duration) requestAnimationFrame(renderFrame);
      };
      drawLyricFrame(ctx,1280,720,0,lines,design,imageObjectsRef.current);
      requestAnimationFrame(renderFrame);
      source.onended=()=>{if(recorder.state==='recording')recorder.stop();};
      source.start(0);
      window.setTimeout(()=>{if(recorder.state==='recording')recorder.stop();},Math.ceil((audio.duration+0.5)*1000));
      const blob=await complete;
      setVideoBlob(blob);
      const extension=blob.type.includes('mp4')?'mp4':'webm';
      const name=(lyricsFile.name.replace(/\.[^.]+$/,'')||'lyrics-video')+'-lyrics.'+extension;
      setVideoFileName(name); setVideoFormat(extension.toUpperCase());
      setNotice('Lyric video rendered with its audio track. Preview or download the video below.');
      combined.getTracks().forEach((track)=>track.stop());
    } catch(e) { setError(e.message||'The lyrics video could not be rendered.'); }
    finally { if(context) await context.close().catch(()=>undefined); setVideoBusy(false); }
  }

  return <div className="audio-studio">
    <section className="audio-studio-hero">
      <div className="audio-studio-hero-copy">
        <span className="audio-studio-kicker"><AudioWaveform /> CONVERTA STUDIO · VERSION 5.0</span>
        <h1>Shape the sound.<br/><em>Produce your story.</em></h1>
        <p>A browser-based audio workstation for editing, voice effects, voiceovers, mixing clips and producing timed lyric videos.</p>
        <div className="audio-studio-hero-meta"><span><Activity/> {featureCount}+ audio controls</span><span><WandSparkles/> {VOICES.length} voice profiles</span><span><Film/> 120 text animations</span></div>
      </div>
      <div className="audio-hero-mark"><div><AudioWaveform/></div><span>CONVERTA</span><small>LOCAL AUDIO LAB</small></div>
    </section>

    {error&&<div className="audio-alert error" role="alert"><X/><span>{error}</span><button onClick={()=>setError('')} aria-label="Dismiss"><X/></button></div>}
    {notice&&<div className="audio-alert success" role="status"><Check/><span>{notice}</span><button onClick={()=>setNotice('')} aria-label="Dismiss"><X/></button></div>}

    <nav className="audio-tabs" aria-label="Audio tools">
      <button className={tab==='editor'?'active':''} onClick={()=>setTab('editor')}><Scissors/> Audio editor</button>
      <button className={tab==='voice'?'active':''} onClick={()=>setTab('voice')}><Radio/> Voice lab</button>
      <button className={tab==='voiceover'?'active':''} onClick={()=>setTab('voiceover')}><Mic/> Voiceovers & mix</button>
      <button className={tab==='lyrics'?'active':''} onClick={()=>setTab('lyrics')}><Clapperboard/> Lyrics video</button>
    </nav>

    {tab!=='lyrics'&&<div className="audio-workspace">
      <section className="audio-panel audio-library">
        <div className="audio-panel-heading"><div><small>01 · MEDIA LIBRARY</small><h2>Your audio clips</h2></div><span>{tracks.length} files</span></div>
        <label className="audio-upload-button"><Upload/><span>Import audio files</span><input type="file" accept="audio/*,.flac,.opus,.m4a,.aiff" multiple onChange={(event)=>{importTracks(event.target.files);event.target.value='';}}/></label>
        <div className="audio-track-list">
          {tracks.map((track)=> <article className={'audio-track-row '+(selectedId===track.id?'selected':'')} key={track.id}>
            <button className="audio-track-select" onClick={()=>setSelectedId(track.id)}><span className="audio-track-icon"><FileAudio2/></span><span><b>{track.name}</b><small>{(track.file.size/1048576).toFixed(2)} MB</small></span></button>
            <label className="audio-include" title="Include in merge or mix"><input type="checkbox" checked={selectedMix.includes(track.id)} onChange={(event)=>setSelectedMix((old)=>event.target.checked?[...old,track.id]:old.filter((value)=>value!==track.id))}/><span>Mix</span></label>
            <button className="audio-icon-button" onClick={()=>removeTrack(track.id)} aria-label={'Remove '+track.name}><Trash2/></button>
          </article>)}
          {!tracks.length&&<div className="audio-empty"><Headphones/><b>No clips yet</b><span>Import one or more audio files to begin.</span></div>}
        </div>
        <div className="audio-library-actions">
          <button onClick={()=>buildMix(true)} disabled={!selectedMix.length||busy}>Merge in order</button>
          <button onClick={()=>buildMix(false)} disabled={!selectedMix.length||busy}>Combine / overlay</button>
        </div>
        {selectedTrack&&<div className="audio-selected-meta"><span>SELECTED SOURCE</span><b>{selectedTrack.name}</b><small>{sourceLoading?'Decoding audio…':sourceBuffer?seconds(sourceBuffer.duration)+' · '+sourceBuffer.sampleRate+' Hz':'Select a supported audio file'}</small></div>}
      </section>

      {tab==='editor'&&<section className="audio-panel audio-controls-panel">
        <div className="audio-panel-heading"><div><small>02 · NON-DESTRUCTIVE CONTROLS</small><h2>Precision audio editor</h2></div><button className="audio-reset" onClick={()=>setSettings({trimStart:0,trimEnd:activeDuration,cutStart:null,cutEnd:null,fadeIn:0,fadeOut:0,gain:100,speed:1,pitch:0,bass:0,treble:0,highpass:0,lowpass:0,distortion:0,echo:0,reverb:0,chorus:0,normalize:false,reverse:false,removeSilence:false,mono:false,compress:true,gateDb:-42})}><RotateCcw/> Reset</button></div>
        {sourceLoading&&<div className="audio-loading"><span/> Decoding source audio…</div>}
        {!sourceBuffer&&!sourceLoading&&<div className="audio-empty large"><AudioLines/><b>Choose an audio clip</b><span>Upload a source in the library to open its editing controls.</span></div>}
        {sourceBuffer&&<>
          <div className="audio-waveform"><div className="waveform-bars">{Array.from({length:76},(_,i)=><i key={i} style={{height:(16+Math.abs(Math.sin(i*12.9898)*Math.cos(i*2.443))*82)+'%'}} />)}</div><div className="waveform-labels"><span>00:00</span><b>{seconds(activeDuration)}</b></div></div>
          <div className="audio-dual-fields"><label>Trim start (seconds)<input type="number" min="0" max={activeDuration} step="0.05" value={settings.trimStart} onChange={(e)=>patchSettings({trimStart:Number(e.target.value)})}/></label><label>Trim end (seconds)<input type="number" min="0" max={activeDuration} step="0.05" value={settings.trimEnd} onChange={(e)=>patchSettings({trimEnd:Number(e.target.value)})}/></label></div>
          <div className="audio-tool-grid">
            <label>Cut from (s)<input type="number" min="0" step="0.05" value={settings.cutStart??''} placeholder="Start" onChange={(e)=>patchSettings({cutStart:e.target.value===''?null:Number(e.target.value)})}/></label>
            <label>Cut to (s)<input type="number" min="0" step="0.05" value={settings.cutEnd??''} placeholder="End" onChange={(e)=>patchSettings({cutEnd:e.target.value===''?null:Number(e.target.value)})}/></label>
            <label>Fade in (s)<input type="number" min="0" max="30" step="0.1" value={settings.fadeIn} onChange={(e)=>patchSettings({fadeIn:Number(e.target.value)})}/></label>
            <label>Fade out (s)<input type="number" min="0" max="30" step="0.1" value={settings.fadeOut} onChange={(e)=>patchSettings({fadeOut:Number(e.target.value)})}/></label>
          </div>
          <div className="audio-sliders">
            <Range label="Master gain" value={settings.gain} min={0} max={200} suffix="%" onChange={(v)=>patchSettings({gain:v})}/>
            <Range label="Playback speed" value={settings.speed} min={0.5} max={2} step={0.01} suffix="×" onChange={(v)=>patchSettings({speed:v})}/>
            <Range label="Pitch / transpose" value={settings.pitch} min={-12} max={12} suffix=" st" onChange={(v)=>patchSettings({pitch:v})}/>
            <Range label="Bass shelf" value={settings.bass} min={-18} max={18} suffix=" dB" onChange={(v)=>patchSettings({bass:v})}/>
            <Range label="Treble shelf" value={settings.treble} min={-18} max={18} suffix=" dB" onChange={(v)=>patchSettings({treble:v})}/>
            <Range label="Distortion" value={settings.distortion} min={0} max={100} suffix="%" onChange={(v)=>patchSettings({distortion:v})}/>
            <Range label="Echo" value={settings.echo} min={0} max={0.9} step={0.01} suffix="" onChange={(v)=>patchSettings({echo:v})}/>
            <Range label="Reverb" value={settings.reverb} min={0} max={1} step={0.01} suffix="" onChange={(v)=>patchSettings({reverb:v})}/>
            <Range label="Chorus" value={settings.chorus} min={0} max={1} step={0.01} suffix="" onChange={(v)=>patchSettings({chorus:v})}/>
            <Range label="High-pass filter" value={settings.highpass} min={0} max={1500} suffix=" Hz" onChange={(v)=>patchSettings({highpass:v})}/>
            <Range label="Low-pass filter" value={settings.lowpass} min={0} max={15000} suffix=" Hz" onChange={(v)=>patchSettings({lowpass:v})}/>
          </div>
          <div className="audio-toggle-grid">
            <Toggle label="Normalize peaks" value={settings.normalize} onChange={(v)=>patchSettings({normalize:v})}/>
            <Toggle label="Reverse audio" value={settings.reverse} onChange={(v)=>patchSettings({reverse:v})}/>
            <Toggle label="Remove quiet gaps" value={settings.removeSilence} onChange={(v)=>patchSettings({removeSilence:v})}/>
            <Toggle label="Mono output" value={settings.mono} onChange={(v)=>patchSettings({mono:v})}/>
            <Toggle label="Dynamic compression" value={settings.compress} onChange={(v)=>patchSettings({compress:v})}/>
          </div>
          <div className="audio-action-row">
            <button className="audio-secondary-action" onClick={splitAtCursor}><Scissors/> Split at cursor</button>
            <button className="audio-secondary-action" onClick={duplicateClip}><Layers/> Duplicate clip</button>
            <button className="audio-primary-action" onClick={applyAndExport} disabled={busy}>{busy?'Rendering…':<><WandSparkles/> Apply processing & export</>}</button>
          </div>
        </>}
      </section>}

      {tab==='voice'&&<section className="audio-panel audio-controls-panel">
        <div className="audio-panel-heading"><div><small>03 · CREATIVE VOICE PROCESSING</small><h2>Voice transformation lab</h2></div><WandSparkles/></div>
        <p className="audio-panel-intro">Select a character profile, then fine-tune pitch, speed, resonance and spatial effects. These are real-time DSP-style render presets, not AI voice cloning or a guarantee of natural gender conversion.</p>
        <div className="voice-preset-grid">{VOICES.map((voice,index)=><button key={voice.name} className={voiceIndex===index?'chosen':''} onClick={()=>setVoiceIndex(index)}><span><AudioWaveform/></span><b>{voice.name}</b>{voiceIndex===index&&<Check/>}</button>)}</div>
        <div className="audio-sliders">
          <Range label="Additional pitch shift" value={settings.pitch} min={-12} max={12} suffix=" semitones" onChange={(v)=>patchSettings({pitch:v})}/>
          <Range label="Speed / time change" value={settings.speed} min={0.5} max={2} step={0.01} suffix="×" onChange={(v)=>patchSettings({speed:v})}/>
          <Range label="Voice gain" value={settings.gain} min={0} max={200} suffix="%" onChange={(v)=>patchSettings({gain:v})}/>
          <Range label="Brightness / bass" value={settings.bass} min={-18} max={18} suffix=" dB" onChange={(v)=>patchSettings({bass:v})}/>
          <Range label="Presence / treble" value={settings.treble} min={-18} max={18} suffix=" dB" onChange={(v)=>patchSettings({treble:v})}/>
        </div>
        <div className="voice-selected-note"><span><Radio/></span><div><b>{activePreset.name}</b><small>Choose an audio source in the library, then apply this preset to export the transformed sound.</small></div></div>
        <button className="audio-primary-action full" onClick={applyAndExport} disabled={!sourceBuffer||busy}>{busy?'Rendering voice profile…':<><WandSparkles/> Render voice transformation</>}</button>
      </section>}

      {tab==='voiceover'&&<section className="audio-panel audio-controls-panel">
        <div className="audio-panel-heading"><div><small>04 · MULTITRACK PRODUCTION</small><h2>Voiceover & audio mix</h2></div><Mic/></div>
        <p className="audio-panel-intro">Import spoken narration, record a microphone take, or layer several voiceover clips over the selected music or audio source.</p>
        <div className="voiceover-actions">
          <label className="audio-upload-button"><Upload/><span>Import voiceover files</span><input type="file" accept="audio/*,.webm" multiple onChange={(e)=>{addVoiceovers(e.target.files);e.target.value='';}}/></label>
          <button className={recording?'recording':''} onClick={recordVoiceover}>{recording?<><Pause/> Stop recording</>:<><Mic/> Record microphone</>}</button>
        </div>
        {voiceovers.map((voice,index)=><article className="voiceover-row" key={voice.id}>
          <div className="voiceover-title"><span>{index+1}</span><b>{voice.name}</b><button onClick={()=>setVoiceovers((old)=>old.filter((item)=>item.id!==voice.id))} aria-label="Remove voiceover"><Trash2/></button></div>
          <div className="voiceover-controls"><label>Start at (s)<input type="number" min="0" step="0.1" value={voice.offset} onChange={(e)=>updateVoice(voice.id,{offset:Math.max(0,Number(e.target.value))})}/></label><label>Level <strong>{voice.gain}%</strong><input type="range" min="0" max="150" value={voice.gain} onChange={(e)=>updateVoice(voice.id,{gain:Number(e.target.value)})}/></label></div>
        </article>)}
        {!voiceovers.length&&<div className="audio-empty compact"><Mic/><b>No voiceover tracks yet</b><span>Upload narration or record your voice to add a layer.</span></div>}
        <div className="audio-mix-note"><Layers/><span>Set each track's start offset and volume. Exporting from the editor mixes every voiceover with the processed source track.</span></div>
        <button className="audio-primary-action full" onClick={applyAndExport} disabled={!sourceBuffer||busy}>{busy?'Mixing tracks…':<><AudioLines/> Mix voiceover with selected audio</>}</button>
      </section>}

      {previewUrl&&<section className="audio-panel audio-export-panel">
        <div className="audio-panel-heading"><div><small>EXPORT READY</small><h2>Processed audio output</h2></div><span className="audio-export-status"><Check/> READY</span></div>
        <audio ref={audioRef} className="audio-player" src={previewUrl} controls preload="metadata"/>
        <div className="audio-export-bottom"><div><b>{outputName}</b><small>{(previewBlob.size/1048576).toFixed(2)} MB · WAV PCM · playable preview</small></div><button onClick={()=>downloadBlob(previewBlob,outputName)}><Download/> Download WAV</button></div>
      </section>}
    </div>}

    {tab==='lyrics'&&<section className="lyrics-studio">
      <div className="lyrics-top-grid">
        <div className="audio-panel lyrics-source-panel">
          <div className="audio-panel-heading"><div><small>01 · SOUNDTRACK</small><h2>Choose your song</h2></div><AudioLines/></div>
          <label className="audio-upload-button"><Upload/><span>{lyricsFile?lyricsFile.name:'Upload song or audio file'}</span><input type="file" accept="audio/*,.flac,.m4a,.webm" onChange={(e)=>importLyricsAudio(e.target.files?.[0])}/></label>
          {lyricsAudioURL&&<audio className="audio-player" src={lyricsAudioURL} controls ref={lyricsAudioRef} onTimeUpdate={(e)=>setCurrentTime(e.currentTarget.currentTime)}/>}
          <div className="lyrics-time-display"><span>PLAYHEAD</span><b>{seconds(currentTime)}</b></div>
          <div className="lyrics-images-header"><div><b>Background image library</b><small>Upload up to 10 still images</small></div><label className="image-add-button"><ImagePlus/><input type="file" accept="image/*" multiple onChange={(e)=>{importImages(e.target.files);e.target.value='';}}/> Add images</label></div>
          <div className="lyrics-image-grid">{images.map((image,index)=><div key={index}><span>{String(index+1).padStart(2,'0')}</span><b>{image.name}</b><button onClick={()=>setImages((old)=>old.filter((_,i)=>i!==index))} aria-label="Remove image"><X/></button></div>)}
            {!images.length&&<p>Optional: add up to ten photos for your lyric video background.</p>}</div>
        </div>
        <div className="audio-panel lyrics-preview-panel">
          <div className="audio-panel-heading"><div><small>02 · LIVE CANVAS PREVIEW</small><h2>Video composition</h2></div><span className="preview-live-dot">LIVE PREVIEW</span></div>
          <canvas ref={videoCanvasRef} width="1280" height="720" className="lyrics-preview-canvas"/>
          <div className="lyrics-preview-foot"><span>{activeLyric?.text||'No lyric at this time'}</span><span>{seconds(currentTime)}</span></div>
        </div>
      </div>

      <div className="lyrics-edit-grid">
        <section className="audio-panel lyrics-lines-panel">
          <div className="audio-panel-heading"><div><small>03 · SECOND-BY-SECOND CAPTIONS</small><h2>Lyrics timeline</h2></div><button className="audio-secondary-action" onClick={addLyricLine} disabled={!lyricsFile}><Plus/> Add line</button></div>
          <p className="audio-panel-intro">Each caption has its own start and end time. Use the audio player to find the exact moment, then adjust the timing in seconds.</p>
          {lines.map((line,index)=><article className="lyric-line-card" key={line.id}>
            <div className="lyric-line-title"><span>{String(index+1).padStart(2,'0')}</span><b>Lyric segment</b><button onClick={()=>removeLine(line.id)} aria-label="Delete lyric segment"><Trash2/></button></div>
            <textarea value={line.text} onChange={(e)=>updateLine(line.id,{text:e.target.value})} rows="2" placeholder="Type lyric text here"/>
            <div className="lyric-time-fields"><label>Start (s)<input type="number" min="0" step="0.01" value={line.start} onChange={(e)=>updateLine(line.id,{start:Number(e.target.value)})}/></label><label>End (s)<input type="number" min="0" step="0.01" value={line.end} onChange={(e)=>updateLine(line.id,{end:Number(e.target.value)})}/></label><label>Background image<select value={line.backgroundImage??-1} onChange={(e)=>updateLine(line.id,{backgroundImage:Number(e.target.value)})}><option value={-1}>Animated</option>{images.map((image,imageIndex)=><option value={imageIndex} key={imageIndex}>{image.name}</option>)}</select></label></div>
            <label className="lyrics-field-label">Text animation<select value={line.animationIndex??design.animationIndex} onChange={(e)=>updateLine(line.id,{animationIndex:Number(e.target.value)})}>{ANIMATIONS.map((animation)=><option value={animation.index} key={animation.index}>{String(animation.index+1).padStart(3,'0')} · {animation.name}</option>)}</select></label>
          </article>)}
          {!lines.length&&<div className="audio-empty compact"><Clapperboard/><b>No lyric captions yet</b><span>Upload a song and add timed text segments.</span></div>}
        </section>

        <section className="audio-panel lyrics-design-panel">
          <div className="audio-panel-heading"><div><small>04 · DESIGN SYSTEM</small><h2>Style & motion controls</h2></div><SlidersHorizontal/></div>
          <label className="lyrics-field-label">Font family<select value={design.font} onChange={(e)=>setDesign((old)=>({...old,font:e.target.value}))}>{FONTS.map((font)=><option key={font}>{font}</option>)}</select></label>
          <Range label="Text size" value={design.fontSize} min={22} max={112} suffix=" px" onChange={(v)=>setDesign((old)=>({...old,fontSize:v}))}/>
          <label className="lyrics-field-label">Text color<input type="color" value={design.color} onChange={(e)=>setDesign((old)=>({...old,color:e.target.value}))}/></label>
          <label className="lyrics-field-label">Animated linear gradient<select value={design.gradientIndex} onChange={(e)=>setDesign((old)=>({...old,gradientIndex:Number(e.target.value)}))}>{GRADIENTS.map((gradient,index)=><option value={index} key={gradient.name}>{gradient.name}</option>)}</select></label>
          <label className="lyrics-field-label">Animated background<select value={design.backgroundIndex} onChange={(e)=>setDesign((old)=>({...old,backgroundIndex:Number(e.target.value)}))}>{BACKGROUNDS.map((name,index)=><option value={index} key={name}>{String(index+1).padStart(2,'0')} · {name}</option>)}</select></label>
          <label className="lyrics-field-label">Text animation · 120 styles<select value={design.animationIndex} onChange={(e)=>setDesign((old)=>({...old,animationIndex:Number(e.target.value)}))}>{ANIMATIONS.map((animation)=><option value={animation.index} key={animation.index}>{String(animation.index+1).padStart(3,'0')} · {animation.name}</option>)}</select></label>
          <label className="lyrics-field-label">Vertical alignment<select value={design.position} onChange={(e)=>setDesign((old)=>({...old,position:e.target.value}))}><option value="center">Center</option><option value="top">Upper third</option><option value="bottom">Lower third</option></select></label>
          
          <div className="audio-toggle-grid"><Toggle label="Animated gradient text" value={design.useGradient} onChange={(v)=>setDesign((old)=>({...old,useGradient:v}))}/><Toggle label="Text shadow" value={design.shadow} onChange={(v)=>setDesign((old)=>({...old,shadow:v}))}/><Toggle label="Text outline" value={design.outline} onChange={(v)=>setDesign((old)=>({...old,outline:v}))}/></div>
          <button className="audio-secondary-action" onClick={()=>setLines((old)=>old.map((line)=>({...line,font:design.font,fontSize:design.fontSize,color:design.color,gradientIndex:design.gradientIndex,animationIndex:design.animationIndex})))} disabled={!lines.length}>Apply style to all captions</button>
          <div className="lyrics-count-row"><span><b>{FONTS.length}</b> font families</span><span><b>{GRADIENTS.length}</b> gradients</span><span><b>{BACKGROUNDS.length}</b> backgrounds</span><span><b>{ANIMATIONS.length}</b> text animation presets</span></div>
          <button className="audio-primary-action full" onClick={renderLyricVideo} disabled={!lyricsFile||!lines.length||videoBusy}>{videoBusy?'Rendering full video…':<><Video/> Render lyric video with soundtrack</>}</button>
          <p className="lyrics-export-note">Exports a synchronized WebM video with the uploaded audio track. Rendering happens locally in your browser; keep this tab active until it finishes.</p>
        </section>
      </div>
      {videoURL&&<section className="audio-panel lyric-video-export">
        <div className="audio-panel-heading"><div><small>05 · VIDEO EXPORT</small><h2>Your lyric video is ready</h2></div><span className="audio-export-status"><Check/> {videoFormat}</span></div>
        <video src={videoURL} controls playsInline className="lyric-video-player"/>
        <div className="audio-export-bottom"><div><b>{videoFileName}</b><small>{(videoBlob.size/1048576).toFixed(2)} MB · Video and soundtrack included</small></div><button onClick={()=>downloadBlob(videoBlob,videoFileName)}><Download/> Download video</button></div>
      </section>}
    </section>}

    <footer className="audio-studio-footnote"><CircleHelp/><span>Audio editing, voice filters and lyric-video rendering are executed locally. Browser codec support varies; WAV and WebM are the reliable export paths. Pitch shifting changes playback duration as well as pitch, and this version uses creative DSP profiles rather than neural voice conversion.</span></footer>
  </div>;
}

function Range({label,value,min,max,step=1,suffix='',onChange}) {
  return <label className="audio-range"><span>{label}<b>{value}{suffix}</b></span><input type="range" min={min} max={max} step={step} value={value} onChange={(event)=>onChange(Number(event.target.value))}/></label>;
}
function Toggle({label,value,onChange}) {
  return <label className="audio-toggle"><span>{label}</span><input type="checkbox" checked={Boolean(value)} onChange={(event)=>onChange(event.target.checked)}/><i/></label>;
}

function drawLyricFrame(ctx,width,height,time,lines,design,loadedImages) {
  const gradient=GRADIENTS[(line?.gradientIndex ?? design.gradientIndex)]||GRADIENTS[0];
  const hue=(design.backgroundIndex*29+time*12)%360;
  const background=ctx.createLinearGradient(Math.cos(time*.18)*width,0,width,Math.sin(time*.13)*height);
  background.addColorStop(0,'hsl('+hue+' 58% 12%)');
  background.addColorStop(.55,'hsl('+((hue+65)%360)+' 68% 20%)');
  background.addColorStop(1,'hsl('+((hue+150)%360)+' 70% 10%)');
  ctx.fillStyle=background; ctx.fillRect(0,0,width,height);
  const line=lines.find((item)=>time>=item.start&&time<=item.end);
  const imageIndex=line?.backgroundImage??design.backgroundImage;
  const image=imageIndex>=0?loadedImages[imageIndex]?.image:null;
  if(image) {
    const scale=Math.max(width/image.width,height/image.height)*(1+Math.sin(time*.14)*.04);
    const w=image.width*scale, h=image.height*scale;
    ctx.save(); ctx.translate(width/2+Math.sin(time*.25)*10,height/2); ctx.drawImage(image,-w/2,-h/2,w,h); ctx.restore();
    ctx.fillStyle='rgba(4,12,23,.43)';ctx.fillRect(0,0,width,height);
  }
  drawBackgroundMotion(ctx,width,height,time,design.backgroundIndex);
  ctx.fillStyle='rgba(4,11,20,.16)';ctx.fillRect(0,0,width,height);
  if (!line || !line.text) {
    ctx.fillStyle='rgba(255,255,255,.58)';ctx.font='600 24px Arial';ctx.textAlign='center';ctx.fillText('CONVERTA LYRIC VIDEO',width/2,height*.88);
    return;
  }
  const selectedAnimation=(line.animationIndex??design.animationIndex);
  const family=Math.floor(selectedAnimation/10)%12;
  const variant=selectedAnimation%10;
  const intensity=.58+variant*.095;
  const tempo=.75+variant*.14;
  const progress=clamp((time-line.start)/Math.max(.12,Math.min(.8,(line.end-line.start)*.32)),0,1);
  const fontSize=line.fontSize||design.fontSize;
  const text=String(line.text);
  const maxWidth=width*.84;
  ctx.save();
  let alpha=1,x=width/2,y=height*.56,scale=1,scaleX=1,rotation=0,blur=0,displayText=text;
  const distance=55+variant*10;
  if(family===0) alpha=Math.pow(progress,.65+variant*.16);
  else if(family===1) y+=distance*intensity*(1-progress);
  else if(family===2) y-=distance*intensity*(1-progress);
  else if(family===3) {x-=distance*(1.05+variant*.12)*(1-progress);rotation=-(1-progress)*.025*variant;}
  else if(family===4) {x+=distance*(1.05+variant*.12)*(1-progress);rotation=(1-progress)*.025*variant;}
  else if(family===5) scale=.24+progress*(.76+variant*.045)+Math.sin(time*tempo+variant)*.012;
  else if(family===6) y-=Math.sin(progress*Math.PI*(1.1+variant*.12))*(1-progress)*distance*intensity;
  else if(family===7) rotation=(1-progress)*(variant%2?-.12:.12)*(1+variant*.18);
  else if(family===8) displayText=text.slice(0,Math.max(1,Math.floor(text.length*Math.pow(clamp((time-line.start)/Math.max(.2,(line.end-line.start)*(.28+variant*.025)),0,1),.6+variant*.09))));
  else if(family===9) y+=Math.sin(time*(2.8+variant*.65)+variant)* (3+variant*1.4);
  else if(family===10) {x+=Math.sin(time*(15+variant*3)+variant)*(2+variant*1.1);rotation=Math.sin(time*(10+variant*2))*.008*(variant+1);}
  else if(family===11) scale=progress<.6?.48+progress*(.55+variant*.055):1+Math.sin(time*tempo+variant)*.008*variant;
  else if(family===12) {rotation=(1-progress)*Math.PI*.7;scale=.8+progress*.2;}
  else if(family===13) {scaleX=.75+progress*.25;}
  else if(family===14) blur=(1-progress)*16;
  else if(family===15) alpha=progress>.5?1:progress*2;
  else if(family===16) scale=1+Math.sin(time*4+variant)*.025;
  else if(family===17) y+=Math.sin(time*1.8+variant)*12;
  else if(family===18) scale=1+Math.sin(progress*Math.PI)*.15*(variant+1)/10;
  else if(family===19) {x+=Math.sin(time*28)*5;alpha=.78+Math.abs(Math.sin(time*40+variant))*.22;}
  else if(family===20) x+=(progress<.5?-1:1)*distance*(1-progress);
  else if(family===21) {x+=Math.cos(time*2)*25;y+=Math.sin(time*2)*18;}
  else if(family===22) blur=(1-progress)*8;
  else if(family===23) x+=Math.sin(time*9)*3;
  else if(family===24) scaleX=.7+progress*.3;
  else if(family===25) rotation=Math.sin(progress*Math.PI)*.08;
  else if(family===26) y+=distance*(1-progress);
  else if(family===27) y-=distance*(1-progress);
  else if(family===28) rotation=(1-progress)*Math.PI*2;
  if (variant%3===0 && family!==0 && family!==8) alpha*=clamp(progress*1.3,0,1);
  if (design.position==='top') y=height*.28;
  if (design.position==='bottom') y=height*.79;
  ctx.globalAlpha=alpha;
  ctx.translate(x,y);ctx.rotate(rotation);ctx.scale(scale*scaleX,scale);
  if(blur) ctx.filter='blur('+blur+'px)';
  const words=displayText.split(/\s+/);
  ctx.font='800 '+fontSize+'px "'+(line.font||design.font||'Arial')+'"';
  ctx.textAlign='center';ctx.textBaseline='middle';
  const rows=[];let current='';
  for(const word of words){const test=current?current+' '+word:word;if(ctx.measureText(test).width>maxWidth&&current){rows.push(current);current=word;}else current=test;}
  if(current)rows.push(current);
  const lineHeight=fontSize*1.22;
  const yStart=-(rows.length-1)*lineHeight/2;
  rows.forEach((row,index)=>{
    let rowText=row;
    if(family===9) rowText=row.split('').map((char,charIndex)=>char).join('');
    if(design.useGradient!==false) {
      const fill=ctx.createLinearGradient(-maxWidth/2+Math.sin(time*.9)*35,index*lineHeight,maxWidth/2+Math.cos(time*.7)*35,index*lineHeight+fontSize);
      fill.addColorStop(0,gradient.colors[0]);
      fill.addColorStop(.5,gradient.colors[1]);
      fill.addColorStop(1,gradient.colors[2]);
      ctx.fillStyle=fill;
    } else ctx.fillStyle=line.color||design.color||'#ffffff';
    ctx.shadowColor=design.shadow?'rgba(0,0,0,.7)':'transparent';
    ctx.shadowBlur=design.shadow?18:0;
    if(design.outline){ctx.lineWidth=4;ctx.strokeStyle='rgba(0,0,0,.8)';ctx.strokeText(rowText,0,yStart+index*lineHeight,maxWidth);}
    ctx.fillText(rowText,0,yStart+index*lineHeight,maxWidth);
  });
  ctx.restore();
  ctx.globalAlpha=1;ctx.filter='none';
  ctx.fillStyle='rgba(255,255,255,.55)';ctx.font='600 18px Arial';ctx.textAlign='right';ctx.fillText('CONVERTA',width-36,height-28);
}

function drawBackgroundMotion(ctx,width,height,time,index) {
  const mode=index%30;
  const hue=(index*27+time*12)%360;
  ctx.save();
  ctx.globalAlpha=.2;
  if(mode===0||mode===5||mode===10||mode===20||mode===29){
    for(let i=0;i<7;i++){
      ctx.strokeStyle='hsl('+(hue+i*28)+' 90% 72%)';ctx.lineWidth=2+i%3;
      ctx.beginPath();ctx.ellipse(width/2,height/2,180+i*86,70+i*48,time*.12+i*.2,0,Math.PI*2);ctx.stroke();
    }
  } else if(mode===1||mode===4||mode===17||mode===26){
    for(let i=0;i<90;i++){
      const x=(i*137+time*(15+i%8)*((i%2)?1:-1))%(width+80);
      const y=(i*71+Math.sin(time+i)*22)%(height);
      ctx.fillStyle='hsl('+(hue+i*4)+' 90% 74%)';ctx.beginPath();ctx.arc(x,y,1+(i%4),0,Math.PI*2);ctx.fill();
    }
  } else if(mode===2||mode===8||mode===14||mode===24){
    for(let i=0;i<18;i++){
      const x=(i*100+time*(35+i%4))%(width+120)-60;
      ctx.fillStyle='hsl('+(hue+i*11)+' 95% 62%)';ctx.fillRect(x,0,3,height);
    }
  } else if(mode===3||mode===12||mode===18||mode===28){
    for(let i=0;i<35;i++){
      const x=(i*73+Math.sin(time*1.2+i)*50+width)%(width);
      const y=(i*47+time*(8+i%4))%height;
      ctx.strokeStyle='hsl('+(hue+i*9)+' 95% 72%)';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(x,y,8+i%20,0,Math.PI*2);ctx.stroke();
    }
  } else {
    ctx.strokeStyle='hsl('+hue+' 95% 72%)';ctx.lineWidth=1.5;
    for(let y=0;y<height;y+=42){
      ctx.beginPath();
      for(let x=0;x<=width;x+=24){
        const py=y+Math.sin(x*.012+time*1.8+index)*12+Math.cos(x*.02-time)*8;
        if(x===0)ctx.moveTo(x,py);else ctx.lineTo(x,py);
      }
      ctx.stroke();
    }
  }
  ctx.restore();
}
