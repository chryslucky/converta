import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useStudio = create(persist((set) => ({
  files: [],
  format: 'mp3',
  bitrate: '192k',
  sampleRate: 'source',
  history: [],
  isRunning: false,
  isEngineLoading: false,
  engineProgress: 0,
  activeId: null,
  addFiles: (files) => set((state) => ({
    files: [...state.files, ...files.map((file) => ({
      id: crypto.randomUUID(), file, name: file.name, size: file.size,
      status: 'ready', progress: 0, resultId: null, outputName: null, error: null
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
  addHistory: (item) => set((state) => ({ history: [item, ...state.history.filter((entry) => entry.id !== item.id)].slice(0, 60) })),
  removeHistory: (id) => set((state) => ({ history: state.history.filter((entry) => entry.id !== id) })),
  clearHistory: () => set({ history: [] })
}), {
  name: 'converta-studio-preferences',
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({ format: state.format, bitrate: state.bitrate, sampleRate: state.sampleRate, history: state.history })
}));
