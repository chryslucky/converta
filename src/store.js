import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const now = () => new Date().toISOString();
const makeId = () => globalThis.crypto?.randomUUID?.() || String(Date.now()) + Math.random().toString(16).slice(2);

export const useStudio = create(persist((set) => ({
  files: [],
  format: 'mp3',
  bitrate: '192k',
  sampleRate: 'source',
  history: [],
  activity: [],
  isRunning: false,
  isEngineLoading: false,
  engineProgress: 0,
  activeId: null,
  addFiles: (files) => set((state) => ({
    files: [...state.files, ...files.map((file) => ({
      id: makeId(), file, name: file.name, size: file.size, type: file.type || '',
      status: 'ready', progress: 0, resultId: null, outputName: null, error: null,
      addedAt: now()
    }))]
  })),
  removeFile: (id) => set((state) => ({ files: state.files.filter((file) => file.id !== id) })),
  clearFiles: () => set({ files: [], activeId: null }),
  setFormat: (format) => set({ format }),
  setBitrate: (bitrate) => set({ bitrate }),
  setSampleRate: (sampleRate) => set({ sampleRate }),
  updateFile: (id, patch) => set((state) => ({ files: state.files.map((file) => file.id === id ? { ...file, ...patch } : file) })),
  setRunning: (isRunning) => set({ isRunning }),
  setEngineLoading: (isEngineLoading) => set({ isEngineLoading }),
  setEngineProgress: (engineProgress) => set({ engineProgress }),
  setActiveId: (activeId) => set({ activeId }),
  addHistory: (item) => set((state) => ({ history: [item, ...state.history.filter((entry) => entry.id !== item.id)] })),
  removeHistory: (id) => set((state) => ({ history: state.history.filter((entry) => entry.id !== id) })),
  clearHistory: () => set({ history: [] }),
  recordActivity: (entry) => set((state) => ({
    activity: [{ id: entry.id || makeId(), date: entry.date || now(), ...entry }, ...state.activity].slice(0, 10000)
  })),
  clearActivity: () => set({ activity: [] })
}), {
  name: 'converta-studio-v4',
  version: 4,
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    format: state.format,
    bitrate: state.bitrate,
    sampleRate: state.sampleRate,
    history: state.history,
    activity: state.activity
  }),
  migrate: (persisted) => ({
    ...persisted,
    files: [],
    activity: Array.isArray(persisted.activity) ? persisted.activity : [],
    history: Array.isArray(persisted.history) ? persisted.history.map((item) => ({
      ...item,
      status: item.status || 'completed',
      date: item.date || item.completedAt || now()
    })) : []
  })
}));
