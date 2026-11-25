export const SITE_URL = 'https://convertapro.vercel.app';

export const SEO_PAGES = [
  {
    path: '/', title: 'Private Audio & Video Converter Online | Converta', description: 'Convert audio files and extract sound from video in your browser. Choose MP3, WAV, FLAC, AAC or OGG. Your media stays on your device.', heading: 'Convert media. Keep every file private.', eyebrow: 'CONVERTA STUDIO V5', kind: 'home', indexable: true,
    intro: 'Converta is a private media conversion workspace. Turn common audio files into the format you need, or extract an audio track from a supported video file. Conversion runs in your browser with FFmpeg WebAssembly; your source media is not uploaded to a conversion server.',
    benefits: ['Local browser processing for supported files','Batch queue with per-file and overall progress','MP3, WAV, FLAC, AAC and OGG export options','Dated conversion records and locally stored downloads'],
    sections: [
      { heading: 'A focused audio conversion workspace', body: 'Add one file or a group of files, select an output format, review the conversion settings and start the queue. Converta reports the state of each job and keeps a dated record of completed, failed and cancelled attempts.' },
      { heading: 'Extract audio from video', body: 'When a video contains an audio stream, Converta can extract that stream and export it as MP3, WAV, FLAC, AAC or OGG. It does not create a new video or edit the picture track.' },
      { heading: 'Your files stay in your browser', body: 'The conversion engine runs locally in the browser. Completed output blobs are stored in this browser using IndexedDB, while preferences and conversion records are saved locally. Browser cleanup or clearing site data may remove local exports, so download important files to your device.' }
    ],
    steps: ['Choose audio files or videos that contain an audio track.','Select MP3, WAV, FLAC, AAC or OGG as the output format.','Set a bitrate for lossy formats and an optional sample rate.','Start conversion, follow each progress indicator and download completed files.'],
    faqs: [
      ['Are my files uploaded?', 'No. The conversion engine processes selected media in your browser. Converta does not include a media-upload or server-side conversion service.'],
      ['Which output formats are available?', 'Converta exports MP3, WAV, FLAC, AAC and OGG audio.'],
      ['Can I extract audio from a video?', 'Yes. Supported video containers can be used as sources when they contain an audio stream. The result is an audio file, not a converted video.'],
      ['Where is my conversion history stored?', 'Conversion records and output files are stored locally in your browser. They are not synchronized to a cloud account.']
    ],
    related: ['/audio-studio/','/audio-converter/','/video-to-audio/','/guides/','/about/']
  },
  {
    path:'/audio-studio/',
    title:'Audio Editor, Voice Effects & Lyrics Video Maker | Converta',
    description:'Edit audio clips, mix songs and voiceovers, change pitch and tone, and create timed lyric videos with animated text, gradients and image backgrounds.',
    heading:'Edit audio. Transform voices. Create lyric videos.',
    eyebrow:'AUDIO PRODUCTION STUDIO',kind:'tool',indexable:true,
    intro:'Converta Audio Studio is a local browser-based production workspace. Trim, cut, split, join and combine audio clips; shape tone and pitch with creative effects; record or import voiceovers; and produce synchronized lyric videos with individually timed captions and image backgrounds.',
    benefits:['Audio editing and mixing with non-destructive source handling','33 creative voice profiles plus pitch, speed and tone controls','Import or record layered voiceovers with adjustable timing and gain','Timed lyric video editor with 10 images, 30 backgrounds, 30 gradients and 120 text animation presets'],
    sections:[
      {heading:'Edit and shape audio',body:'Load audio clips to trim their start and end, remove a selected range, split at a chosen time, reverse, fade, normalize peaks, remove quiet sections, change gain and speed, adjust bass and treble, filter frequencies, compress dynamics, and add distortion, echo, reverb or chorus. Exported edits are rendered as playable WAV audio.'},
      {heading:'Change voice character and tone',body:'Choose from 32 creative signal-processing presets, including deep and bright adult voices, playful child-like pitch, robot, radio, telephone, monster, announcer and other effects. Adjust pitch and speed independently as controls, although this browser implementation changes duration as well as pitch. These are DSP effects, not neural voice cloning or natural gender conversion.'},
      {heading:'Build a voiceover mix',body:'Import or record voiceover tracks, position them using start offsets, set their levels and mix them over a selected source track. Multiple audio clips can also be concatenated in order or combined as an overlay mix.'},
      {heading:'Create a synchronized lyric video',body:'Choose a song, add text segments and set each segment’s start and end time in seconds. Style captions with font families, solid color or animated gradient fills, shadows and outlines. Choose animated backgrounds, assign up to ten uploaded still images, and select from 120 parameterized text animation presets. The browser records the canvas with the soundtrack; available video format depends on browser MediaRecorder support.'},
      {heading:'Local processing and export limits',body:'Audio decoding, editing, mixing and lyric-video rendering happen locally in the browser. Edited audio exports use PCM WAV. Lyric videos export as WebM in most browsers, or MP4 only where the browser provides a compatible MediaRecorder encoder. Keep the tab active while rendering long videos and download important outputs to your device.'}
    ],
    steps:['Open Audio Studio and import one or more audio files.','Choose Editor, Voice Lab, or Voiceovers & Mix and configure the controls.','Preview the processed audio, then download the WAV export.','For lyrics video, upload a song, add timed captions, style them, optionally upload up to ten images, then render and download the video.'],
    faqs:[
      ['Can I play and download audio exports?','Yes. Rendered audio appears in a built-in player and can be downloaded as a WAV file. Main converter results also have playback controls and a download action.'],
      ['Does a child or robot voice preset use AI cloning?','No. Voice presets use browser audio processing effects. They do not generate or clone a real person’s voice.'],
      ['Can I change pitch without changing song duration?','The current browser effect changes pitch through playback-rate processing, so pitch changes also affect duration.'],
      ['Which video format can I export?','The editor checks browser MediaRecorder support. WebM is the typical output; MP4 is available only when the browser exposes a compatible MP4 recorder.'],
      ['Can I synchronize every lyric line?','Yes. Each caption has editable start and end times in seconds, and can be assigned an image and a text animation preset.']
    ],
    related:['/audio-converter/','/video-to-audio/','/guides/']
  },
  {
    path:'/audio-converter/',title:'Online Audio Converter – MP3, WAV, FLAC, AAC & OGG | Converta',description:'Convert common audio files to MP3, WAV, FLAC, AAC or OGG in your browser. Adjust bitrate and sample rate with local file processing.',heading:'Audio conversion, with precise controls.',eyebrow:'AUDIO CONVERTER',kind:'tool',indexable:true,format:'mp3',
    intro:'Use one workspace to convert supported audio files into a format that fits your playback, editing or sharing needs. Choose a codec, select a bitrate where it applies, and preserve or change the output sample rate.',
    benefits:['Five practical audio export formats','Bitrate controls for MP3, AAC and OGG','Optional 44.1, 48 or 96 kHz sample rate','Batch processing with dated job records'],
    sections:[{heading:'Choose the right output',body:'MP3 is widely compatible and useful for everyday listening. WAV is uncompressed and convenient for editing workflows. FLAC preserves audio losslessly with compression. AAC and OGG provide lossy alternatives for compatible players.'},{heading:'Set quality before conversion',body:'For MP3, AAC and OGG, choose a bitrate from the available settings. WAV and FLAC do not use the lossy bitrate control. You can preserve the source sample rate or select a supported target rate.'},{heading:'Review every result',body:'The queue shows pending, active, completed and failed files. Each completed export is added to local history with its source name, output format, file sizes and time.'}],
    steps:['Add one or more supported audio files.','Choose an output format.','Set bitrate and sample rate as needed.','Convert, then download the completed files from the queue or history.'],
    faqs:[['Does conversion upload my audio?','No. Files are processed in your browser.'],['Can I convert several tracks?','Yes. Add multiple files and process them in a sequential batch queue.'],['Does WAV use a bitrate setting?','No. WAV uses an uncompressed PCM output profile in this application.'],['Will history survive a browser reset?','Not necessarily. History uses local browser storage and can be cleared by browser settings or site-data cleanup.']],
    related:['/mp3-to-wav/','/wav-to-mp3/','/flac-to-mp3/','/guides/wav-vs-mp3/']
  },
  {
    path:'/video-to-audio/',title:'Extract Audio from Video Online | Converta',description:'Extract an audio track from supported MP4, MOV, MKV, WebM and other video files. Export audio locally as MP3, WAV, FLAC, AAC or OGG.',heading:'Keep the soundtrack. Leave the video behind.',eyebrow:'VIDEO TO AUDIO',kind:'tool',indexable:true,format:'mp3',
    intro:'Extract the audio stream from a supported video file when you only need its sound. Converta reads media locally in your browser and exports an audio file without uploading the source to a conversion server.',
    benefits:['Audio extraction from supported video containers','MP3, WAV, FLAC, AAC and OGG output','Per-file progress and queue-level tracking','No server upload of source media'],
    sections:[{heading:'What video extraction does',body:'The converter selects the first audio stream in a video source, excludes the video stream and encodes an audio output. It does not change the video resolution, trim footage or produce a new video file.'},{heading:'Supported source containers',body:'Common supported sources include MP4, MOV, MKV, WebM, AVI, M4V, MPEG, MPG, 3GP and OGV. Actual decoding depends on the codecs present in the file and the browser runtime.'},{heading:'Choose an audio format',body:'MP3 is convenient for broad playback support. WAV is uncompressed, FLAC is lossless, AAC is efficient and OGG is an open audio container. Select the profile that fits your next workflow.'}],
    steps:['Select a video that contains an audio track.','Choose an audio output such as MP3 or WAV.','Start the conversion and monitor the active file progress.','Download the extracted audio when the job completes.'],
    faqs:[['Does it convert video to another video?','No. This feature extracts audio and exports an audio file.'],['What happens when a video has no audio?','The conversion reports an error because there is no audio stream to extract.'],['Are all video codecs supported?','The app accepts common containers, but decoding depends on the codecs included in the FFmpeg WebAssembly build.'],['Is the video uploaded?','No. Source files are processed in your browser.']],
    related:['/mp4-to-mp3/','/mov-to-mp3/','/mkv-to-mp3/','/webm-to-mp3/','/guides/extract-audio-from-video/']
  },
  {
    path:'/mp4-to-mp3/',title:'MP4 to MP3 Converter – Extract Audio in Your Browser | Converta',description:'Extract the audio track from MP4 files and save it as MP3. Follow conversion progress and keep your video source on your device.',heading:'Convert MP4 video audio to MP3.',eyebrow:'MP4 TO MP3',kind:'tool',indexable:true,format:'mp3',
    intro:'Create an MP3 audio file from an MP4 video that contains sound. Converta selects the audio stream, excludes the video stream and encodes an MP3 download locally in your browser.',
    benefits:['Extract the audio track from MP4','Choose an MP3 bitrate from 96 to 320 kbps','Watch per-file and batch progress','Keep a dated local conversion record'],
    sections:[{heading:'How MP4 to MP3 extraction works',body:'An MP4 file can contain video, audio and other streams. This workflow maps the first audio stream, disables video output and encodes the result with the MP3 audio codec. It does not alter the original MP4.'},{heading:'Select a bitrate',body:'A higher MP3 bitrate generally uses more storage and can preserve more detail from the encoded source. The available choices are 96, 128, 192, 256 and 320 kbps. The original audio quality and codec still set an upper limit on the result.'},{heading:'Private, local processing',body:'The source MP4 is read by the browser conversion engine. The output is stored locally in IndexedDB until downloaded or removed, subject to browser storage limits.'}],
    steps:['Add an MP4 file with an audio stream.','Choose MP3 and set the bitrate.','Start the queue and follow the progress bar.','Download the resulting MP3 file.'],
    faqs:[['Can an MP4 without sound be converted?','No. An audio stream is required.'],['Does MP3 improve the source quality?','No. Conversion changes the encoding format; it cannot restore detail that is absent from the source.'],['Can I process more than one MP4?','Yes. Add multiple source files to the batch queue.'],['Does the tool change the source video?','No. The original video file is not modified.']],
    related:['/video-to-audio/','/mov-to-mp3/','/webm-to-mp3/','/guides/extract-audio-from-video/']
  },
  {
    path:'/mov-to-mp3/',title:'MOV to MP3 – Extract Audio from QuickTime Video | Converta',description:'Extract audio from supported MOV files and export an MP3 in your browser with local processing and clear progress tracking.',heading:'Extract MP3 audio from MOV files.',eyebrow:'MOV TO MP3',kind:'tool',indexable:true,format:'mp3',
    intro:'Use Converta to extract the audio stream from supported QuickTime MOV files and save it as MP3. Processing runs locally in the browser; the MOV source remains on your device.',
    benefits:['MOV audio stream extraction','Configurable MP3 bitrate','Batch queue and progress updates','Dated history stored in this browser'],
    sections:[{heading:'Check the audio stream',body:'A MOV container can hold different media streams. This workflow needs an audio stream to create an MP3. Files with unsupported codecs or no audio stream may fail with a clear job status.'},{heading:'Choose an MP3 profile',body:'Select 96, 128, 192, 256 or 320 kbps depending on your storage and playback needs. A larger bitrate does not create information that was not present in the source.'},{heading:'Save the finished track',body:'Completed MP3 files appear in the conversion queue and history. Download them to a normal device folder because local browser storage can be cleared.'}],
    steps:['Choose a MOV video with sound.','Select MP3 and the required bitrate.','Run the conversion and monitor progress.','Download the finished audio file.'],
    faqs:[['Does the MOV video upload?','No. Processing takes place in the browser.'],['Will every MOV codec work?','Not necessarily. Supported decoding depends on the codec and FFmpeg build.'],['Can I choose WAV instead?','Yes. Choose WAV from the output format settings.']],
    related:['/video-to-audio/','/mp4-to-mp3/','/mkv-to-mp3/']
  },
  {
    path:'/mkv-to-mp3/',title:'MKV to MP3 – Extract Audio from Matroska Video | Converta',description:'Extract sound from supported MKV files and export MP3 audio locally. Monitor conversion status, progress and dated results.',heading:'Extract an MP3 track from MKV.',eyebrow:'MKV TO MP3',kind:'tool',indexable:true,format:'mp3',
    intro:'Extract the first audio stream from a supported Matroska MKV file and encode it as an MP3. The browser handles the conversion and keeps the source video on your device.',
    benefits:['Extract the first available audio stream','Adjust MP3 bitrate','Sequential batch conversion','Local export library with dates'],
    sections:[{heading:'MKV audio extraction',body:'MKV is a container that can hold multiple audio, video and subtitle streams. Converta maps the first audio stream for this export. It does not merge subtitles or create a replacement video.'},{heading:'Output and quality',body:'The MP3 output can use one of the supported bitrate settings. If a source audio stream is already heavily compressed, converting it to MP3 will not restore lost details.'},{heading:'Keep a record',body:'A completed job records the source name, output format, sizes, settings and completion time in local history.'}],
    steps:['Add a supported MKV file with audio.','Choose MP3 as the output format.','Select bitrate and start conversion.','Download the completed MP3.'],
    faqs:[['Can I select another audio track from MKV?','The current conversion workflow uses the first audio stream.'],['What if the MKV has subtitles?','Subtitles are not included in the audio-only output.'],['Are files stored online?','No. Outputs are stored in local browser storage.']],
    related:['/video-to-audio/','/mp4-to-mp3/','/webm-to-mp3/']
  },
  {
    path:'/webm-to-mp3/',title:'WebM to MP3 – Extract Browser Video Audio | Converta',description:'Turn the audio stream in a supported WebM file into an MP3. Convert locally with batch progress and dated history.',heading:'Extract MP3 audio from WebM.',eyebrow:'WEBM TO MP3',kind:'tool',indexable:true,format:'mp3',
    intro:'Create an MP3 from the audio track in a supported WebM video. Converta processes the selected file in the browser and gives you a downloadable audio result.',
    benefits:['WebM audio extraction','MP3 bitrate selection','Batch progress tracking','Local-only output storage'],
    sections:[{heading:'A practical audio-only export',body:'This workflow reads a WebM source, maps its first audio stream and exports MP3 without rendering a new video. Audio must be present and decodable by the bundled FFmpeg build.'},{heading:'Tune the export',body:'Choose the MP3 bitrate for your expected playback and storage needs. Keep the source sample rate or select a supported target rate in the workspace.'},{heading:'Track every job',body:'The interface reports queued, active, completed and failed items. Each attempt is recorded with a timestamp in the local history.'}],
    steps:['Add a WebM file that includes audio.','Choose MP3 and set the quality.','Start the job and watch its progress.','Save the completed file to your device.'],
    faqs:[['Does this create an MP3 from video-only WebM?','No. A source audio stream is required.'],['Can I convert several WebM files?','Yes. Add several files to the batch queue.'],['Is the source uploaded?','No. Browser-local conversion is used.']],
    related:['/video-to-audio/','/mp4-to-mp3/','/guides/extract-audio-from-video/']
  },
  {
    path:'/wav-to-mp3/',title:'WAV to MP3 Converter – Reduce Audio File Size | Converta',description:'Convert WAV audio to MP3 with selectable bitrate and sample rate. Process locally and save the result in dated history.',heading:'Make a compact MP3 from WAV.',eyebrow:'WAV TO MP3',kind:'tool',indexable:true,format:'mp3',
    intro:'Convert an uncompressed WAV file into a smaller MP3 for everyday listening, sharing or portable playback. Select the bitrate and optional sample rate before running the conversion.',
    benefits:['Convert WAV to MP3','Choose bitrate up to 320 kbps','Batch multiple audio files','Record output size and conversion date'],
    sections:[{heading:'Why convert WAV to MP3?',body:'WAV files often store uncompressed PCM audio and can be large. MP3 uses lossy compression to reduce file size, which is useful when storage or transfer size matters more than preserving an uncompressed master.'},{heading:'Choose a suitable bitrate',body:'A higher MP3 bitrate generally produces a larger file. For a typical music library, compare 192 kbps and 320 kbps with your source material and listening needs. The best setting depends on the source and use case.'},{heading:'Keep WAV as a master',body:'For editing or archiving, keep the original WAV if you need an uncompressed source. Re-encoding a lossy MP3 does not improve its quality.'}],
    steps:['Add a WAV file.','Choose MP3 and the preferred bitrate.','Start conversion and monitor the progress.','Download the new MP3 while keeping the source WAV unchanged.'],
    faqs:[['Will MP3 be smaller than WAV?','Usually, yes, because MP3 uses lossy compression.'],['Does 320 kbps restore quality?','No. It cannot restore detail that is not present in the source.'],['Can I batch convert WAV files?','Yes. Add multiple WAV files to the queue.']],
    related:['/audio-converter/','/mp3-to-wav/','/guides/mp3-bitrate-guide/','/guides/wav-vs-mp3/']
  },
  {
    path:'/flac-to-mp3/',title:'FLAC to MP3 Converter – Export for Wider Playback | Converta',description:'Convert FLAC audio to MP3 for compatible players and sharing. Select bitrate, follow progress and keep a dated local record.',heading:'Create an MP3 copy of FLAC audio.',eyebrow:'FLAC TO MP3',kind:'tool',indexable:true,format:'mp3',
    intro:'Export a lossy MP3 copy from a FLAC source when you need a smaller file or wider compatibility. Keep the original FLAC as your lossless source file.',
    benefits:['FLAC source support','Adjustable MP3 bitrate','Local batch processing','Dated output and activity history'],
    sections:[{heading:'Understand the quality trade-off',body:'FLAC stores audio losslessly. MP3 is a lossy format, so this conversion reduces file size by discarding some audio information. The source FLAC remains unchanged.'},{heading:'Select the bitrate',body:'Choose a bitrate that fits the intended use. Higher bitrates increase file size and can reduce encoding loss, but cannot add detail beyond the original FLAC.'},{heading:'Preserve your archive',body:'For long-term preservation and future editing, retain the FLAC source. Use the MP3 copy for devices or services that prefer MP3.'}],
    steps:['Select your FLAC source.','Set MP3 as the output and choose a bitrate.','Run conversion and review progress.','Download the MP3 copy; retain the FLAC master.'],
    faqs:[['Is FLAC to MP3 lossless?','No. MP3 uses lossy compression.'],['Should I delete the FLAC source?','Keep it if you value a lossless archive or may edit the audio later.'],['Can it process multiple FLAC files?','Yes. Use the batch queue.']],
    related:['/audio-converter/','/wav-to-mp3/','/mp3-to-flac/','/guides/flac-vs-mp3/']
  },
  {
    path:'/mp3-to-wav/',title:'MP3 to WAV Converter – Export PCM Audio | Converta',description:'Convert MP3 audio into a WAV PCM file for compatible editing workflows. Understand quality limits and process media in your browser.',heading:'Export MP3 audio as WAV.',eyebrow:'MP3 TO WAV',kind:'tool',indexable:true,format:'wav',
    intro:'Create a WAV PCM file from an MP3 source for applications that require WAV input. The conversion runs in your browser and leaves the original MP3 untouched.',
    benefits:['WAV PCM output','Batch conversion queue','Local progress indicators','Dated history of each conversion'],
    sections:[{heading:'What changes in MP3 to WAV?',body:'The MP3 audio is decoded and written into a WAV container using PCM encoding. The resulting file is usually much larger, but it does not regain audio information removed during the original MP3 encoding.'},{heading:'Use WAV for compatibility',body:'Some editing, sampling or production tools request WAV or PCM audio. Exporting to WAV can make an MP3 source easier to import into those applications, but it does not turn the source into a lossless master.'},{heading:'Keep expectations realistic',body:'If you need the original lossless recording, obtain the WAV or FLAC master rather than converting an MP3 to WAV.'}],
    steps:['Add an MP3 file.','Choose WAV as the output format.','Start the job and monitor progress.','Download the WAV file for the next workflow.'],
    faqs:[['Will WAV sound better than MP3?','No. Converting MP3 to WAV does not restore compressed audio data.'],['Why is the WAV file larger?','WAV PCM is typically uncompressed, so the file uses more storage.'],['Can WAV be used for editing?','Many editors accept WAV PCM, but source quality remains limited by the MP3.']],
    related:['/wav-to-mp3/','/audio-converter/','/guides/wav-vs-mp3/']
  },
  {
    path:'/mp3-to-flac/',title:'MP3 to FLAC Converter – Create a Lossless Container Copy | Converta',description:'Convert MP3 to FLAC when an application requires FLAC output. Learn why transcoding does not restore the original audio quality.',heading:'Convert MP3 audio to FLAC.',eyebrow:'MP3 TO FLAC',kind:'tool',indexable:true,format:'flac',
    intro:'Convert an MP3 source into a FLAC file when a workflow requires FLAC format. This is a format conversion only: the decoded sound still reflects the quality limits of the original lossy MP3.',
    benefits:['FLAC output','Local batch conversion','Progress tracking per file','Dated conversion history'],
    sections:[{heading:'FLAC does not restore MP3 quality',body:'FLAC uses lossless compression for the audio data it receives. When the source is already MP3, discarded information cannot be reconstructed by saving it in FLAC.'},{heading:'When this conversion can help',body:'A tool or workflow may require a FLAC container even when the available source is MP3. This converter can create a compatible FLAC file, but the result should not be treated as a true lossless original.'},{heading:'Keep the original',body:'Retain your source MP3, and obtain an original lossless recording when archive quality matters.'}],
    steps:['Add an MP3 source file.','Choose FLAC as the output.','Run the conversion and follow its progress.','Download the FLAC file and retain the original MP3.'],
    faqs:[['Does MP3 to FLAC improve quality?','No. FLAC cannot recover data lost during MP3 compression.'],['Will the file become larger?','Often yes, because FLAC stores the decoded audio losslessly.'],['Why convert it then?','For workflow or compatibility requirements that specifically accept FLAC.']],
    related:['/flac-to-mp3/','/audio-converter/','/guides/flac-vs-mp3/']
  },
  {
    path:'/aac-to-mp3/',title:'AAC to MP3 Converter – Create Compatible Audio Files | Converta',description:'Convert supported AAC audio files to MP3 in your browser with bitrate controls, batch conversion and dated local history.',heading:'Convert AAC audio to MP3.',eyebrow:'AAC TO MP3',kind:'tool',indexable:true,format:'mp3',
    intro:'Create an MP3 copy from a supported AAC audio source when a player or workflow needs MP3 compatibility. Conversion is performed locally in your browser.',
    benefits:['AAC input support','Selectable MP3 bitrate','Batch queue and file progress','Local history with date and settings'],
    sections:[{heading:'AAC and MP3 are both lossy formats',body:'Converting AAC to MP3 decodes and re-encodes the audio. Some quality loss may occur during the second lossy encoding. Keep the original AAC file when you can.'},{heading:'Choose a bitrate for the destination',body:'Select from the available MP3 bitrates based on compatibility, storage and listening requirements. A higher value may create a larger output without improving the quality of the AAC source.'},{heading:'Download and track the result',body:'Completed conversions are recorded with their source, output format, file size and timestamp. Download the export to preserve it outside browser storage.'}],
    steps:['Add a supported AAC audio file.','Choose MP3 and a suitable bitrate.','Start conversion and follow progress.','Download the finished MP3.'],
    faqs:[['Can AAC to MP3 lose quality?','Yes. Both are lossy codecs, and re-encoding can add another generation of loss.'],['Can I convert M4A files?','Supported M4A files can be added as audio sources when their codec is decodable.'],['Is my file uploaded?','No. The browser handles conversion.']],
    related:['/audio-converter/','/wav-to-mp3/','/flac-to-mp3/']
  },
  {
    path:'/ogg-to-mp3/',title:'OGG to MP3 Converter – Export Audio for Compatibility | Converta',description:'Convert supported OGG audio to MP3 locally in your browser. Choose bitrate, monitor batch progress and save dated results.',heading:'Convert OGG audio to MP3.',eyebrow:'OGG TO MP3',kind:'tool',indexable:true,format:'mp3',
    intro:'Convert a supported OGG audio source into MP3 for apps and devices that prefer MP3. Select the output bitrate and keep track of each conversion locally.',
    benefits:['Supported OGG source input','Configurable MP3 bitrate','Batch queue progress','Dated history and local downloads'],
    sections:[{heading:'OGG audio to MP3',body:'OGG is a container commonly used with Vorbis audio. Converta reads supported audio streams and encodes them as MP3. Exact compatibility depends on the codec contained in the OGG file.'},{heading:'Avoid unnecessary re-encoding',body:'If a destination supports OGG, keeping the original may avoid another lossy encoding generation. Convert to MP3 when compatibility requires it.'},{heading:'Local output tracking',body:'The application records successful and unsuccessful attempts locally and stores completed output blobs in IndexedDB until they are downloaded or removed.'}],
    steps:['Choose an OGG file.','Select MP3 and the bitrate.','Start the conversion and watch progress.','Download the resulting MP3 file.'],
    faqs:[['Is OGG always Vorbis?','No. OGG is a container and can hold different codecs.'],['Can conversion reduce quality?','Yes. A lossy source re-encoded as MP3 can lose additional detail.'],['Can I convert several OGG files?','Yes. Add them together to the queue.']],
    related:['/audio-converter/','/wav-to-mp3/','/mp3-to-wav/']
  },
  {
    path:'/guides/',title:'Audio Conversion Guides & Format Advice | Converta',description:'Practical guides to MP3 bitrate, WAV and MP3, FLAC and MP3, and extracting audio from video files.',heading:'Understand the format before you convert.',eyebrow:'CONVERTA GUIDES',kind:'guides',indexable:true,
    intro:'Use these practical guides to choose an audio format, understand bitrate and sample rate, and extract sound from supported video containers. The advice focuses on the conversion features available in Converta.',
    benefits:['Clear codec and container explanations','Practical bitrate and sample-rate notes','Honest guidance about lossy transcoding','Step-by-step video audio extraction'],
    sections:[{heading:'Audio format basics',body:'The file extension is only part of the story. A container can hold different codecs, and the codec determines how audio is encoded. Choose an output based on compatibility, quality needs and storage.'},{heading:'Keep original sources',body:'Lossy-to-lossy or lossy-to-lossless transcoding does not restore detail. Preserve the original file when it matters.'}],
    steps:['Choose a guide that matches your task.','Review the format limitations and workflow.','Open the linked converter for the actual conversion.'],
    faqs:[['Are these guides for professional mastering?','They are practical format explanations, not a substitute for a mastering or archival workflow.'],['Do these guides upload files?','No file is needed to read a guide. Conversion stays local to the browser.']],
    related:['/guides/mp3-bitrate-guide/','/guides/wav-vs-mp3/','/guides/flac-vs-mp3/','/guides/extract-audio-from-video/']
  },
  {
    path:'/guides/mp3-bitrate-guide/',title:'MP3 Bitrate Guide – 96, 128, 192, 256 or 320 kbps? | Converta',description:'Understand MP3 bitrate trade-offs, file size and listening use cases before choosing an export setting in Converta.',heading:'Choose an MP3 bitrate with context.',eyebrow:'AUDIO QUALITY GUIDE',kind:'guide',indexable:true,
    intro:'MP3 bitrate describes how many kilobits of encoded audio data are used per second. Higher bitrates generally produce larger files and can preserve more detail, but the source recording and encoder also matter.',
    benefits:['Understand kbps and file size','Compare common MP3 bitrate options','Avoid assuming a higher value restores source quality','Choose a profile for the intended use'],
    sections:[{heading:'96 and 128 kbps',body:'Lower bitrates produce smaller files and may be useful when storage or bandwidth is the priority. They can produce more audible compression artifacts on complex music.'},{heading:'192 and 256 kbps',body:'These are common middle-to-high options for everyday listening. They balance file size and encoded audio detail for many sources.'},{heading:'320 kbps',body:'320 kbps is a high MP3 bitrate and typically produces a larger file. It cannot improve an already compressed source, and the audible difference depends on the material and listener.'},{heading:'Bitrate is not the same as sample rate',body:'Bitrate measures encoded data per second. Sample rate measures how many audio samples are represented each second. They describe different parts of an audio format.'}],
    steps:['Identify the device or platform where the file will be used.','Choose a bitrate based on storage and listening needs.','Keep an original lossless source when archiving matters.','Compare the file size and listen to representative excerpts.'],
    faqs:[['Does 320 kbps always sound better?','Not always. The source, encoder and listening conditions affect audible differences.'],['Does a higher bitrate make a file larger?','Generally yes, because more data is used per second.'],['Can bitrate restore details?','No. It cannot recreate information absent from the source.']],
    related:['/wav-to-mp3/','/flac-to-mp3/','/audio-converter/']
  },
  {
    path:'/guides/wav-vs-mp3/',title:'WAV vs MP3 – File Size, Quality and When to Use Each | Converta',description:'Compare WAV PCM and MP3 compression. Learn which format suits editing, archiving, playback and sharing.',heading:'WAV or MP3? Choose for the job.',eyebrow:'FORMAT COMPARISON',kind:'guide',indexable:true,
    intro:'WAV and MP3 solve different problems. WAV commonly stores uncompressed PCM audio, while MP3 uses lossy compression to reduce file size. The right choice depends on the next step in your workflow.',
    benefits:['Understand PCM and lossy compression','Compare typical file-size trade-offs','Choose a format for editing or playback','Know why transcoding cannot restore lost detail'],
    sections:[{heading:'WAV for editing and uncompressed audio',body:'WAV PCM is widely accepted by audio editors and production tools. It is useful when an uncompressed working file is required, but it takes more storage than a comparable MP3.'},{heading:'MP3 for compact playback copies',body:'MP3 reduces file size using perceptual lossy compression. It is useful for portable playback, sharing and applications where broad compatibility matters.'},{heading:'Avoid converting a compressed source into a master',body:'Converting MP3 to WAV only decodes the MP3 into PCM. It does not restore the original recording quality. For a true lossless source, use an original WAV or FLAC file.'}],
    steps:['Choose WAV when an uncompressed PCM file is required.','Choose MP3 when compact size and compatibility are more important.','Keep the original recording for editing or archiving.'],
    faqs:[['Is WAV higher quality than MP3?','WAV PCM can preserve uncompressed samples; MP3 is lossy. The actual content of the source still matters.'],['Can MP3 become lossless by converting to WAV?','No. Converting containers cannot recover data removed by lossy compression.'],['Which is smaller?','MP3 is typically much smaller than uncompressed WAV.']],
    related:['/mp3-to-wav/','/wav-to-mp3/','/audio-converter/']
  },
  {
    path:'/guides/flac-vs-mp3/',title:'FLAC vs MP3 – Lossless Audio and Everyday Listening | Converta',description:'Compare FLAC lossless compression with MP3 lossy compression. Learn when to keep FLAC and when to export MP3.',heading:'FLAC archive. MP3 copy. Know the difference.',eyebrow:'FORMAT COMPARISON',kind:'guide',indexable:true,
    intro:'FLAC and MP3 are not interchangeable quality profiles. FLAC compresses audio without losing decoded sample information, while MP3 reduces size by discarding information according to a lossy encoding model.',
    benefits:['Understand lossless and lossy formats','Choose a source for archiving','Export MP3 for compatible playback','Avoid quality claims that transcoding cannot support'],
    sections:[{heading:'FLAC for a lossless library',body:'FLAC reduces storage compared with uncompressed PCM while preserving the original decoded audio data. It is suitable for lossless libraries and many editing or playback workflows.'},{heading:'MP3 for smaller distribution copies',body:'MP3 is supported by many devices and services. It can provide much smaller files but uses lossy compression.'},{heading:'Do not treat MP3-to-FLAC as restoration',body:'FLAC can preserve the decoded MP3 samples without adding further loss at the FLAC stage, but it cannot recreate detail removed by the MP3 encoder. The output is not equivalent to an original FLAC master.'}],
    steps:['Keep FLAC when you need a lossless archive.','Create MP3 copies when smaller files or wider compatibility are useful.','Retain the highest-quality available source before transcoding.'],
    faqs:[['Is FLAC lossless?','Yes. FLAC is a lossless audio codec.'],['Is MP3 lossless?','No. MP3 is a lossy audio codec.'],['Can MP3 to FLAC restore audio?','No. FLAC only stores the decoded MP3 signal losslessly from that point onward.']],
    related:['/flac-to-mp3/','/mp3-to-flac/','/audio-converter/']
  },
  {
    path:'/guides/extract-audio-from-video/',title:'How to Extract Audio from a Video File | Converta',description:'Learn how audio stream extraction works for supported MP4, MOV, MKV and WebM videos, including container and codec limitations.',heading:'Extract the sound track from a video.',eyebrow:'HOW-TO GUIDE',kind:'guide',indexable:true,
    intro:'A video container may hold a video stream, one or more audio streams and subtitle tracks. Audio extraction selects an audio stream and exports it as a separate sound file.',
    benefits:['Understand containers and audio streams','Know why source audio is required','Choose an export codec','Keep the original video unchanged'],
    sections:[{heading:'Container and codec are different',body:'MP4, MOV, MKV and WebM are containers. The audio inside may use different codecs. A file extension alone does not guarantee that every codec can be decoded by a particular application.'},{heading:'What the extraction process changes',body:'An audio-only export maps an audio stream, excludes video and encodes the selected sound into an output format. It does not make a new video, edit images or combine subtitles.'},{heading:'Quality depends on the source',body:'Re-encoding may reduce quality when a lossy codec is used. Choose a suitable output format and preserve the original when quality or archival requirements are important.'}],
    steps:['Add a supported video file that includes audio.','Choose an audio output format.','Run the extraction and monitor progress.','Download the separate audio file.'],
    faqs:[['Can I extract from a silent video?','No. The source must contain a decodable audio stream.'],['Can I choose which audio stream?','The current workflow selects the first audio stream.'],['Does extraction upload my video?','No. Processing takes place in the browser.']],
    related:['/video-to-audio/','/mp4-to-mp3/','/mov-to-mp3/','/mkv-to-mp3/']
  },
  {
    path:'/history/',title:'Private Conversion History & Activity | Converta',description:'Review locally stored conversion jobs, downloads, statuses and timestamps in your private Converta workspace.',heading:'Your conversion records, organized by date.',eyebrow:'PRIVATE WORKSPACE HISTORY',kind:'history',indexable:false,
    intro:'The Converta history page is a private workspace view. It lists conversion outcomes and activity events saved by this browser, including successful exports, failed attempts, cancellations and downloads.',
    benefits:['Date and time for each recorded event','Completed, failed and cancelled job outcomes','Source and output file details where available','Local records that are not synchronized to an account'],
    sections:[{heading:'Local records, not a cloud account',body:'History metadata is saved in browser storage and export files are stored in IndexedDB. The application does not synchronize this private record to a server. Clearing browser site data can remove the history and saved exports.'}],
    steps:['Open History from the workspace navigation.','Choose Conversions to review job outcomes or Activity log to review actions.','Search by file name, format or activity.','Download available exports or remove records you no longer need.'],
    faqs:[['Can another device see this history?','No. Records are stored in this browser and are not synchronized.'],['Are failed conversions recorded?','Yes. Failed and cancelled conversion attempts are recorded with their status and timestamp.'],['Can I restore cleared history?','No. Clearing browser site data or deleting local records may permanently remove the local history.']],
    related:['/','/audio-converter/','/about/']
  },
  {
    path:'/about/',title:'About Converta – Private Browser-Based Media Conversion',description:'Learn how Converta processes media locally, stores downloads and records conversion activity in your browser.',heading:'A simpler studio for everyday media conversion.',eyebrow:'ABOUT CONVERTA',kind:'about',indexable:true,
    intro:'Converta is a browser-based media conversion studio focused on useful formats, transparent processing and a dated local record of conversion jobs.',
    benefits:['Browser-local media processing','Clear output settings and progress states','Local file library and conversion records','No account or remote media conversion service'],
    sections:[{heading:'What Converta does',body:'Converta converts supported audio media and extracts audio streams from supported video containers. The available exports are MP3, WAV, FLAC, AAC and OGG.'},{heading:'What Converta does not claim',body:'The application does not include cloud syncing, server-side conversion, sign-in, video editing or restoration of information lost in lossy source files.'},{heading:'Local storage is not a backup',body:'The browser stores export blobs in IndexedDB and preferences and activity metadata in local storage. Users should download important files to a regular device folder because browser data can be removed.'}],
    steps:['Open the studio and add supported media.','Choose the output profile.','Monitor progress and status.','Download the file and review the dated history.'],
    faqs:[['Does Converta require an account?','No account is included in this version.'],['Where does it store completed exports?','In the browser using IndexedDB.'],['Can I use Converta offline?','The application shell and engine must be available in the browser; first loading the conversion engine requires loading its locally hosted WebAssembly assets from the site.']],
    related:['/audio-converter/','/video-to-audio/','/guides/']
  }
];

export const getSeoPage = (pathname) => {
  const normalized = pathname === '/' ? '/' : (pathname.endsWith('/') ? pathname : pathname + '/');
  return SEO_PAGES.find((page) => page.path === normalized) || null;
};
