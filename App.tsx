import React, { useState, useRef, useEffect } from 'react';
import { AppState, AudioFile, RemixResult } from './types';
import { FileDropzone } from './components/FileDropzone';
import { processAudioRemix } from './services/geminiService';
import { MusicVisualizer } from './components/MusicVisualizer';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [inputFile, setInputFile] = useState<AudioFile | null>(null);
  const [remixResult, setRemixResult] = useState<RemixResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  const [isPlayingInput, setIsPlayingInput] = useState(false);
  const [isPlayingRemix, setIsPlayingRemix] = useState(false);
  
  const inputAudioRef = useRef<HTMLAudioElement>(null);
  const remixAudioRef = useRef<HTMLAudioElement>(null);

  const handleFileSelected = (file: AudioFile) => {
    setInputFile(file);
    setAppState(AppState.READY);
    setRemixResult(null);
  };

  const handleStartRemix = async () => {
    if (!inputFile) return;

    setAppState(AppState.PROCESSING);
    setErrorMsg('');

    try {
      const result = await processAudioRemix(inputFile.base64, inputFile.mimeType);
      setRemixResult(result);
      setAppState(AppState.READY); // Ready to play remix
    } catch (e: any) {
      console.error(e);
      setAppState(AppState.ERROR);
      setErrorMsg('Произошла ошибка при создании ремикса. Попробуйте другой файл или повторите позже.');
    }
  };

  const reset = () => {
    setInputFile(null);
    setRemixResult(null);
    setAppState(AppState.IDLE);
    setIsPlayingInput(false);
    setIsPlayingRemix(false);
  };

  // Audio Event Listeners
  useEffect(() => {
    const inputAudio = inputAudioRef.current;
    const remixAudio = remixAudioRef.current;

    const onPlayInput = () => setIsPlayingInput(true);
    const onPauseInput = () => setIsPlayingInput(false);
    const onPlayRemix = () => setIsPlayingRemix(true);
    const onPauseRemix = () => setIsPlayingRemix(false);

    if (inputAudio) {
      inputAudio.addEventListener('play', onPlayInput);
      inputAudio.addEventListener('pause', onPauseInput);
      inputAudio.addEventListener('ended', onPauseInput);
    }
    if (remixAudio) {
      remixAudio.addEventListener('play', onPlayRemix);
      remixAudio.addEventListener('pause', onPauseRemix);
      remixAudio.addEventListener('ended', onPauseRemix);
    }

    return () => {
      if (inputAudio) {
        inputAudio.removeEventListener('play', onPlayInput);
        inputAudio.removeEventListener('pause', onPauseInput);
        inputAudio.removeEventListener('ended', onPauseInput);
      }
      if (remixAudio) {
        remixAudio.removeEventListener('play', onPlayRemix);
        remixAudio.removeEventListener('pause', onPauseRemix);
        remixAudio.removeEventListener('ended', onPauseRemix);
      }
    };
  }, [inputFile, remixResult]);

  return (
    <div className="min-h-screen bg-[#050511] text-white flex flex-col items-center relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

      {/* Header */}
      <header className="w-full py-8 z-10">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
             </div>
             <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
               AI Sonic Remix
             </h1>
          </div>
          <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">v1.0 Beta</a>
        </div>
      </header>

      <main className="container mx-auto px-4 flex-1 flex flex-col z-10 max-w-4xl pb-12">
        
        {/* Intro Text */}
        {appState === AppState.IDLE && (
          <div className="text-center mb-12 mt-10">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Ваш трек. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                Новое звучание.
              </span>
            </h2>
            <p className="text-lg text-slate-400 max-w-xl mx-auto">
              Загрузите любую музыку, и Gemini AI создаст уникальный аудио-ремикс, битбокс или аккомпанемент в реальном времени.
            </p>
          </div>
        )}

        {/* Upload Area */}
        {appState === AppState.IDLE && (
          <FileDropzone onFileSelected={handleFileSelected} />
        )}

        {/* Processing View */}
        {appState === AppState.PROCESSING && (
           <div className="flex flex-col items-center justify-center flex-1 min-h-[400px]">
             <div className="relative w-24 h-24 mb-8">
               <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <svg className="w-8 h-8 text-purple-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                 </svg>
               </div>
             </div>
             <h3 className="text-2xl font-bold animate-pulse text-white mb-2">AI обрабатывает звук...</h3>
             <p className="text-slate-400">Анализ ритма, тональности и генерация ремикса</p>
           </div>
        )}

        {/* Error View */}
        {appState === AppState.ERROR && (
           <div className="glass-panel rounded-2xl p-8 text-center max-w-lg mx-auto mt-10">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Ошибка</h3>
              <p className="text-slate-300 mb-6">{errorMsg}</p>
              <button 
                onClick={reset}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-colors"
              >
                Попробовать снова
              </button>
           </div>
        )}

        {/* Result View & Player */}
        {(appState === AppState.READY && inputFile) && (
          <div className="w-full space-y-8 animate-fade-in mt-6">
            
            {/* Original Track Card */}
            <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-cyan-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                   <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-1">Оригинал</h3>
                   <p className="text-xl font-medium text-white truncate max-w-md">{inputFile.name}</p>
                </div>
                <div className="flex-1 w-full max-w-md">
                   <audio ref={inputAudioRef} controls src={inputFile.url} className="w-full h-10 opacity-80" />
                </div>
              </div>
            </div>

            {/* Action Button (if not remixed yet) */}
            {!remixResult && (
              <div className="flex justify-center py-8">
                 <button 
                    onClick={handleStartRemix}
                    className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full"
                 >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute inset-0 w-full h-full blur-xl bg-purple-600 opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <span className="relative flex items-center gap-3 text-white font-bold text-lg tracking-wide">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 animate-pulse">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                      </svg>
                      Сделать AI Ремикс
                    </span>
                 </button>
              </div>
            )}

            {/* Remix Result Card */}
            {remixResult && (
               <div className="glass-panel p-8 rounded-2xl border border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.15)] relative overflow-hidden animate-slide-up">
                  {/* Decorative Glow */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 blur-[80px] rounded-full pointer-events-none"></div>

                  <div className="flex flex-col items-center justify-center text-center relative z-10">
                     <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6">
                       AI Remix Готов!
                     </h3>
                     
                     <div className="w-full mb-8">
                        <MusicVisualizer isPlaying={isPlayingRemix} color="bg-gradient-to-t from-purple-600 to-pink-400" />
                     </div>

                     <div className="w-full max-w-xl bg-slate-900/50 rounded-xl p-4 mb-6 backdrop-blur-sm">
                        <audio ref={remixAudioRef} controls src={remixResult.audioUrl} className="w-full h-12" />
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
                        <button 
                          onClick={() => {
                            if(inputAudioRef.current) {
                                inputAudioRef.current.currentTime = 0;
                                inputAudioRef.current.play();
                            }
                            if(remixAudioRef.current) {
                                remixAudioRef.current.currentTime = 0;
                                remixAudioRef.current.play();
                            }
                          }}
                          className="py-3 px-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium border border-slate-600 transition-all active:scale-95"
                        >
                           Mix: Оригинал + AI
                        </button>
                        <a 
                          href={remixResult.audioUrl} 
                          download={`remix-${inputFile.name}`}
                          className="py-3 px-6 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-lg shadow-purple-900/50 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                           </svg>
                           Скачать Ремикс
                        </a>
                     </div>
                     
                     {/* Try Again Button */}
                     <button 
                       onClick={reset}
                       className="mt-8 text-sm text-slate-500 hover:text-slate-300 underline underline-offset-4"
                     >
                       Загрузить другой трек
                     </button>
                  </div>
               </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
