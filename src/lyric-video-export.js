const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 30;
const VIDEO_BITRATE = 7_000_000;
const AUDIO_BITRATE = 192_000;

export const VIDEO_FORMATS = [
  {id:'mp4',label:'MP4',detail:'H.264 video · AAC audio',extension:'mp4'},
  {id:'mov',label:'MOV',detail:'QuickTime · H.264 + AAC',extension:'mov'},
  {id:'webm',label:'WebM',detail:'VP9/VP8 video · Opus audio',extension:'webm'},
  {id:'mkv',label:'MKV',detail:'Matroska · VP9/Opus or H.264/AAC',extension:'mkv'},
  {id:'ts',label:'MPEG-TS',detail:'Transport stream · H.264 + AAC',extension:'ts'}
];

async function safeCheck(check) {
  try { return Boolean(await check()); }
  catch { return false; }
}

async function getMediabunny() {
  return await import('mediabunny');
}

async function ensureAacEncoder(media) {
  if (await safeCheck(()=>media.canEncodeAudio('aac'))) return true;
  try {
    const extension = await import('@mediabunny/aac-encoder');
    extension.registerAacEncoder();
    return await safeCheck(()=>media.canEncodeAudio('aac'));
  } catch {
    return false;
  }
}

export async function detectVideoExportFormats() {
  const media = await getMediabunny();
  const quality = new media.Quality({bitrate:VIDEO_BITRATE});
  const [avc,vp9,vp8,opus] = await Promise.all([
    safeCheck(()=>media.canEncodeVideo('avc',{width:WIDTH,height:HEIGHT,frameRate:FPS,quality})),
    safeCheck(()=>media.canEncodeVideo('vp9',{width:WIDTH,height:HEIGHT,frameRate:FPS,quality})),
    safeCheck(()=>media.canEncodeVideo('vp8',{width:WIDTH,height:HEIGHT,frameRate:FPS,quality})),
    safeCheck(()=>media.canEncodeAudio('opus'))
  ]);
  const aac = await ensureAacEncoder(media);
  const useMkvAvc = avc && aac;
  const mkvVideo = useMkvAvc ? 'avc' : vp9 ? 'vp9' : vp8 ? 'vp8' : null;
  const mkvAudio = useMkvAvc ? 'aac' : opus ? 'opus' : null;
  const candidates = VIDEO_FORMATS.map((format)=>{
    let videoCodec=null;
    let audioCodec=null;
    if(format.id==='mp4'||format.id==='mov'||format.id==='ts'){
      videoCodec='avc'; audioCodec='aac';
    } else if(format.id==='webm'){
      videoCodec=vp9?'vp9':'vp8'; audioCodec='opus';
    } else if(format.id==='mkv'){
      videoCodec=mkvVideo; audioCodec=mkvAudio;
    }
    return {...format,videoCodec,audioCodec};
  });
  const formats=[];
  for(const candidate of candidates){
    let available=Boolean(candidate.videoCodec&&candidate.audioCodec);
    if(available){
      try{
        const container=createOutputFormat(media,candidate.id);
        available=container.getSupportedVideoCodecs().includes(candidate.videoCodec)
          && container.getSupportedAudioCodecs().includes(candidate.audioCodec);
      }catch{
        available=false;
      }
    }
    formats.push({...candidate,available});
  }
  return {
    ready:true,
    formats,
    codecs:{avc,vp9,vp8,aac,opus}
  };
}

function createOutputFormat(media,formatId) {
  switch(formatId){
    case 'mp4': return new media.Mp4OutputFormat({fastStart:'in-memory'});
    case 'mov': return new media.MovOutputFormat({fastStart:'in-memory'});
    case 'webm': return new media.WebMOutputFormat();
    case 'mkv': return new media.MkvOutputFormat();
    case 'ts': return new media.MpegTsOutputFormat();
    default: throw new Error('Choose a supported video export format.');
  }
}

export async function renderLyricVideoFile({
  audioBuffer,
  canvas,
  lines,
  design,
  images,
  formatId='mp4',
  drawFrame,
  onProgress=()=>{},
  signal
}) {
  if(!audioBuffer) throw new Error('Upload a song before rendering the lyric video.');
  if(!canvas) throw new Error('The video drawing surface is unavailable.');
  const media=await getMediabunny();
  const capabilities=await detectVideoExportFormats();
  const selected=capabilities.formats.find((format)=>format.id===formatId);
  if(!selected?.available){
    throw new Error(formatId.toUpperCase()+' export is not supported by the available encoders on this device. Select one of the enabled formats.');
  }
  const outputFormat=createOutputFormat(media,formatId);
  const target=new media.BufferTarget();
  const output=new media.Output({format:outputFormat,target});
  const videoSource=new media.CanvasSource(canvas,{
    codec:selected.videoCodec,
    quality:new media.Quality({bitrate:VIDEO_BITRATE}),
    latencyMode:'quality',
    hardwareAcceleration:'no-preference'
  });
  const audioSource=new media.AudioBufferSource({
    codec:selected.audioCodec,
    quality:new media.Quality({bitrate:AUDIO_BITRATE})
  });
  output.addVideoTrack(videoSource,{frameRate:FPS,name:'Lyrics'});
  output.addAudioTrack(audioSource,{name:'Original soundtrack'});
  const frameCount=Math.max(1,Math.ceil(audioBuffer.duration*FPS));
  let finalized=false;
  try {
    if(signal?.aborted) throw new DOMException('Video rendering cancelled.','AbortError');
    await output.start();
    await audioSource.add(audioBuffer);
    await Promise.resolve(audioSource.close());
    onProgress({percent:2,frame:0,total:frameCount,label:'Preparing video and soundtrack'});
    const context=canvas.getContext('2d');
    if(!context) throw new Error('The browser could not create a 2D canvas context.');
    for(let frame=0;frame<frameCount;frame++){
      if(signal?.aborted) throw new DOMException('Video rendering cancelled.','AbortError');
      const timestamp=frame/FPS;
      drawFrame(context,WIDTH,HEIGHT,timestamp,lines,design,images);
      await videoSource.add(timestamp,1/FPS);
      if(frame%Math.max(1,Math.floor(FPS/2))===0 || frame===frameCount-1){
        const percent=Math.min(97,Math.round(((frame+1)/frameCount)*95)+2);
        onProgress({percent,frame:frame+1,total:frameCount,label:'Encoding frame '+(frame+1)+' of '+frameCount});
        await new Promise((resolve)=>requestAnimationFrame(resolve));
      }
    }
    await Promise.resolve(videoSource.close());
    await output.finalize();
    finalized=true;
    const buffer=target.buffer;
    if(!buffer || !buffer.byteLength) throw new Error('The encoder produced an empty video file.');
    const mimeType=outputFormat.mimeType;
    const blob=new Blob([buffer],{type:mimeType||outputFormat.mimeType});
    onProgress({percent:100,frame:frameCount,total:frameCount,label:'Video export complete'});
    return {blob,format:selected,frameCount,duration:audioBuffer.duration,mimeType};
  } catch(error) {
    if(!finalized) await output.cancel().catch(()=>undefined);
    throw error;
  }
}
