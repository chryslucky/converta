import { useMemo, useState } from 'react';
import { Clock3, FileAudio2, Import, LoaderCircle } from 'lucide-react';
import { formatBytes } from './conversion.js';
import { readOutput } from './storage.js';
import { useStudio } from './store.js';

const MIME_BY_EXTENSION = {
  mp3: 'audio/mpeg', wav: 'audio/wav', flac: 'audio/flac',
  aac: 'audio/aac', ogg: 'audio/ogg', opus: 'audio/ogg',
  m4a: 'audio/mp4', webm: 'audio/webm'
};

function mediaType(name, blob) {
  if (blob?.type) return blob.type;
  const extension = String(name || '').split('.').pop()?.toLowerCase();
  return MIME_BY_EXTENSION[extension] || 'application/octet-stream';
}

function shortDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Saved export'
    : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
}

export default function RecentMediaShelf({
  onImport,
  title = 'Recently converted',
  actionLabel = 'Reuse',
  limit = 4
}) {
  const history = useStudio((state) => state.history);
  const items = useMemo(() => history
    .filter((item) => item.status === 'completed' && (item.outputId || item.id))
    .slice()
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, limit), [history, limit]);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  async function reuse(item) {
    if (!onImport || busy) return;
    setBusy(item.id);
    setMessage('');
    try {
      const blob = await readOutput(item.outputId || item.id);
      if (!(blob instanceof Blob) || !blob.size) {
        throw new Error('This saved export is no longer available in this browser.');
      }
      const file = new File([blob], item.name || 'recent-media', {
        type: mediaType(item.name, blob),
        lastModified: Date.now()
      });
      await onImport(file, item);
      setMessage(item.name + ' added to your workspace.');
    } catch (error) {
      setMessage(error?.message || 'The saved export could not be imported.');
    } finally {
      setBusy('');
    }
  }

  return <section className="recent-media-shelf" aria-label={title}>
    <div className="recent-media-heading">
      <span className="recent-media-heading-icon"><Clock3 /></span>
      <div><b>{title}</b><small>Saved on this device · no re-download needed</small></div>
      <span className="recent-media-count">{items.length}</span>
    </div>
    {items.length ? <div className="recent-media-list">
      {items.map((item) => <article className="recent-media-item" key={item.id}>
        <span className="recent-media-file-icon"><FileAudio2 /></span>
        <div className="recent-media-copy">
          <b title={item.name}>{item.name}</b>
          <small>{formatBytes(item.size || 0)} · {shortDate(item.date)}</small>
        </div>
        <button type="button" onClick={() => reuse(item)} disabled={Boolean(busy)} aria-label={actionLabel + ' ' + item.name}>
          {busy === item.id ? <LoaderCircle className="spin" /> : <Import />}
          <span>{busy === item.id ? 'Adding…' : actionLabel}</span>
        </button>
      </article>)}
    </div> : <p className="recent-media-empty">Your completed exports will appear here for one-click reuse.</p>}
    {message && <p className="recent-media-message" role="status">{message}</p>}
  </section>;
}
