import { useEffect, useRef, useState } from 'react';
import {
  AudioLines, ChevronDown, Maximize2, Pause, Play, RotateCcw, RotateCw,
  Volume1, Volume2, VolumeX, X
} from 'lucide-react';
import './audio-player-modal.css';

const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
const formatTime = (value) => {
  if (!Number.isFinite(value) || value < 0) return '0:00';
  const total=Math.floor(value);
  const hours=Math.floor(total/3600);
  const minutes=Math.floor((total%3600)/60);
  const seconds=total%60;
  return hours
    ? hours+':'+String(minutes).padStart(2,'0')+':'+String(seconds).padStart(2,'0')
    : minutes+':'+String(seconds).padStart(2,'0');
};

export default function AudioPlayerModal({
  src,
  title='Audio track',
  subtitle='Converta Audio Studio',
  buttonLabel='Play audio',
  onTimeUpdate
}) {
  const audioRef=useRef(null);
  const [open,setOpen]=useState(false);
  const [playing,setPlaying]=useState(false);
  const [currentTime,setCurrentTime]=useState(0);
  const [duration,setDuration]=useState(0);
  const [volume,setVolume]=useState(0.86);
  const [muted,setMuted]=useState(false);
  const [error,setError]=useState('');
  const progress=duration>0?clamp(currentTime/duration*100,0,100):0;

  useEffect(()=>{
    const audio=audioRef.current;
    if(!audio) return undefined;
    const sync=()=>{
      setCurrentTime(audio.currentTime||0);
      if(Number.isFinite(audio.duration)) setDuration(audio.duration);
      onTimeUpdate?.(audio.currentTime||0);
    };
    const loaded=()=>{
      setDuration(Number.isFinite(audio.duration)?audio.duration:0);
      setError('');
    };
    const ended=()=>setPlaying(false);
    const failed=()=>setError('This audio file could not be played in this browser.');
    const started=()=>setPlaying(true);
    const paused=()=>setPlaying(false);
    audio.addEventListener('timeupdate',sync);
    audio.addEventListener('loadedmetadata',loaded);
    audio.addEventListener('durationchange',loaded);
    audio.addEventListener('ended',ended);
    audio.addEventListener('error',failed);
    audio.addEventListener('playing',started);
    audio.addEventListener('pause',paused);
    return ()=>{
      audio.removeEventListener('timeupdate',sync);
      audio.removeEventListener('loadedmetadata',loaded);
      audio.removeEventListener('durationchange',loaded);
      audio.removeEventListener('ended',ended);
      audio.removeEventListener('error',failed);
      audio.removeEventListener('playing',started);
      audio.removeEventListener('pause',paused);
    };
  },[src,onTimeUpdate]);

  useEffect(()=>{
    const audio=audioRef.current;
    if(!audio) return;
    audio.volume=volume;
    audio.muted=muted;
  },[volume,muted]);

  useEffect(()=>{
    if(!open) return undefined;
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const onKeyDown=(event)=>{
      if(event.key==='Escape') closePlayer();
      if(event.code==='Space' && !['INPUT','TEXTAREA','BUTTON'].includes(document.activeElement?.tagName)){
        event.preventDefault();
        togglePlayback();
      }
    };
    window.addEventListener('keydown',onKeyDown);
    return ()=>{
      document.body.style.overflow=previous;
      window.removeEventListener('keydown',onKeyDown);
    };
  },[open,playing]);

  useEffect(()=>{
    if(!src){
      audioRef.current?.pause();
      setOpen(false);
      setPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    } else {
      setError('');
      setCurrentTime(0);
      setDuration(0);
    }
  },[src]);

  function togglePlayback(){
    const audio=audioRef.current;
    if(!audio||!src) return;
    if(audio.paused){
      setError('');
      audio.play().catch(()=>setError('Playback was blocked. Press play again to start the audio.'));
    } else audio.pause();
  }

  function openPlayer(){
    if(!src) return;
    setError('');
    setOpen(true);
    const audio=audioRef.current;
    if(audio){
      audio.play().catch(()=>setError('Press the play button to start this track.'));
    }
  }

  function closePlayer(){
    audioRef.current?.pause();
    setOpen(false);
  }

  function seek(value){
    const audio=audioRef.current;
    if(!audio||!Number.isFinite(audio.duration)) return;
    const next=clamp(Number(value),0,audio.duration);
    audio.currentTime=next;
    setCurrentTime(next);
    onTimeUpdate?.(next);
  }

  function skip(offset){
    const audio=audioRef.current;
    if(!audio) return;
    seek((audio.currentTime||0)+offset);
  }

  return <>
    <audio ref={audioRef} src={src||undefined} preload="metadata" className="converta-audio-engine" aria-hidden="true" tabIndex={-1}/>
    <button className="converta-audio-open" type="button" onClick={openPlayer} disabled={!src}>
      <span className="converta-audio-open-icon"><Play fill="currentColor"/></span>
      <span className="converta-audio-open-copy"><b>{buttonLabel}</b><small>{title}</small></span>
      <Maximize2 className="converta-audio-open-expand"/>
    </button>

    {open&&<div className="converta-audio-overlay" onMouseDown={(event)=>{if(event.target===event.currentTarget)closePlayer();}}>
      <section className="converta-audio-modal" role="dialog" aria-modal="true" aria-label={'Audio player: '+title}>
        <div className="converta-audio-modal-top">
          <div className="converta-audio-modal-brand"><span><AudioLines/></span><div><b>CONVERTA PLAYER</b><small>{subtitle}</small></div></div>
          <button className="converta-audio-close" type="button" onClick={closePlayer} aria-label="Close audio player"><X/></button>
        </div>
        <div className="converta-audio-art">
          <div className="converta-audio-art-glow"/>
          <div className="converta-audio-art-mark"><AudioLines/></div>
          <div className="converta-audio-art-wave" aria-hidden="true">
            {Array.from({length:48},(_,index)=><i key={index} style={{'--bar-height':(14+Math.abs(Math.sin(index*1.73)*Math.cos(index*.31))*70)+'%'}}/>)}
          </div>
        </div>
        <div className="converta-audio-track-heading">
          <div><span>NOW PLAYING</span><h2 title={title}>{title}</h2><p>{subtitle}</p></div>
          <span className="converta-audio-live"><i/> LOCAL</span>
        </div>
        <div className="converta-audio-timeline">
          <input
            aria-label="Seek audio"
            type="range"
            min="0"
            max={Math.max(duration,.01)}
            step="0.01"
            value={Math.min(currentTime,duration||0)}
            style={{'--audio-progress':progress+'%'}}
            onChange={(event)=>seek(event.target.value)}
            disabled={!duration}
          />
          <div><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
        </div>
        <div className="converta-audio-transport">
          <button type="button" onClick={()=>skip(-10)} aria-label="Rewind ten seconds"><RotateCcw/><small>10</small></button>
          <button type="button" className="converta-audio-main-play" onClick={togglePlayback} aria-label={playing?'Pause audio':'Play audio'}>
            {playing?<Pause fill="currentColor"/>:<Play fill="currentColor"/>}
          </button>
          <button type="button" onClick={()=>skip(10)} aria-label="Forward ten seconds"><RotateCw/><small>10</small></button>
        </div>
        <div className="converta-audio-volume">
          <button type="button" onClick={()=>setMuted((value)=>!value)} aria-label={muted?'Unmute':'Mute'}>
            {muted||volume===0?<VolumeX/>:volume<.48?<Volume1/>:<Volume2/>}
          </button>
          <input aria-label="Volume" style={{"--audio-progress":(muted?0:volume*100)+"%"}} type="range" min="0" max="1" step=".01" value={muted?0:volume} onChange={(event)=>{setVolume(Number(event.target.value));setMuted(false);}}/>
          <span>{Math.round((muted?0:volume)*100)}%</span>
          <button type="button" className="converta-audio-collapse" onClick={closePlayer}><ChevronDown/> Close player</button>
        </div>
        {error&&<p className="converta-audio-error" role="alert">{error}</p>}
        <div className="converta-audio-modal-foot">Audio plays locally in this browser. Your source file is not uploaded.</div>
      </section>
    </div>}
  </>;
}
