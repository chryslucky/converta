import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useStudio=create(persist((set)=>({
 files:[],format:'mp3',quality:'192k',history:[],progress:0,activeName:'',engineLoading:false,
 addFiles:(files)=>set(s=>({files:[...s.files,...files.map(file=>({id:crypto.randomUUID(),file,name:file.name,size:file.size,status:'ready',progress:0}))]})),
 removeFile:(id)=>set(s=>({files:s.files.filter(f=>f.id!==id)})),clearFiles:()=>set({files:[],progress:0,activeName:''}),
 setFormat:(format)=>set({format}),setQuality:(quality)=>set({quality}),setEngine:(p)=>set(p),
 updateFile:(id,p)=>set(s=>({files:s.files.map(f=>f.id===id?{...f,...p}:f)})),
 updateProgress:(id,progress,total,name)=>set(s=>({progress:total,activeName:name,files:s.files.map(f=>f.id===id?{...f,status:'converting',progress}:f)})),
 addHistory:(record)=>set(s=>({history:[record,...s.history].slice(0,40)})),clearHistory:()=>set({history:[]})
}),{name:'converta-studio-v2',partialize:s=>({format:s.format,quality:s.quality,history:s.history})}));
