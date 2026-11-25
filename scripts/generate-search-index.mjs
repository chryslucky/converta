import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const sources = ['MP4','MOV','MKV','WebM','AVI','M4V','MPEG','MPG','3GP','OGV','MP3','WAV','FLAC','AAC','OGG','OPUS','M4A','WMA','AIFF','AIF'];
const outputs = ['MP3','WAV','FLAC','AAC','OGG'];
const actions = ['convert','change','turn','export','save','transform','encode','make','create','re-encode','prepare','get'];
const endings = ['audio','audio file','sound file','music file','download','browser conversion','private conversion','local conversion'];
const descriptors = ['online','in browser','locally','without uploading','on this device','for playback','for sharing','for editing','with quality settings','with batch processing','with progress tracking','with local history'];
const video = new Set(['MP4','MOV','MKV','WebM','AVI','M4V','MPEG','MPG','3GP','OGV']);
const routeByPair = {
  'MP4-MP3':'/mp4-to-mp3/','MOV-MP3':'/mov-to-mp3/','MKV-MP3':'/mkv-to-mp3/','WebM-MP3':'/webm-to-mp3/',
  'WAV-MP3':'/wav-to-mp3/','FLAC-MP3':'/flac-to-mp3/','MP3-WAV':'/mp3-to-wav/','MP3-FLAC':'/mp3-to-flac/',
  'AAC-MP3':'/aac-to-mp3/','OGG-MP3':'/ogg-to-mp3/'
};
const entries = new Map();
const add = (text, source, target) => {
  const value = text.replace(/\s+/g,' ').trim();
  const key = value.toLowerCase();
  if (!entries.has(key)) {
    entries.set(key,{term:value,route:routeByPair[source + '-' + target] || (video.has(source) ? '/video-to-audio/' : '/audio-converter/'),source,target});
  }
};
for (const source of sources) {
  for (const target of outputs) {
    for (const action of actions) add(action + ' ' + source + ' to ' + target,source,target);
    add(source + ' to ' + target + ' converter',source,target);
    add(source + ' ' + target + ' conversion',source,target);
    add(source + ' audio to ' + target,source,target);
    if (video.has(source)) {
      add('extract audio from ' + source + ' as ' + target,source,target);
      add('get ' + target + ' sound from ' + source + ' video',source,target);
    }
  }
}
const phraseEntries = Array.from(entries.values());
const searchableTerms = new Map();
for (const item of phraseEntries) {
  searchableTerms.set(item.term.toLowerCase(),item);
  const tokens = item.term.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  for (const token of tokens) if (!searchableTerms.has(token)) searchableTerms.set(token,{term:token,route:item.route,source:item.source,target:item.target});
}
for (const item of phraseEntries) {
  if (searchableTerms.size >= 2600) break;
  const pair = item.source + ' ' + item.target;
  for (const descriptor of descriptors) {
    const term = pair + ' ' + descriptor;
    if (!searchableTerms.has(term.toLowerCase())) searchableTerms.set(term.toLowerCase(),{term,route:item.route,source:item.source,target:item.target});
    if (searchableTerms.size >= 2600) break;
  }
}
const payload = {
  version: 4,
  generatedAt: new Date().toISOString(),
  phraseCount: phraseEntries.length,
  termCount: searchableTerms.size,
  phrases: phraseEntries,
  terms: Array.from(searchableTerms.values())
};
if (payload.phraseCount < 1000 || payload.termCount < 2000) throw new Error('Search index is smaller than the v4 minimum.');
const destination = resolve('src/data/search-index.json');
await mkdir(dirname(destination),{recursive:true});
await writeFile(destination,JSON.stringify(payload));
console.log('Generated ' + payload.phraseCount + ' query phrases and ' + payload.termCount + ' searchable terms.');
