import React, { useCallback, useState } from 'react';
import { AudioFile } from '../types';

interface FileDropzoneProps {
  onFileSelected: (file: AudioFile) => void;
  disabled?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({ onFileSelected, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      alert("Пожалуйста, загрузите аудио файл (MP3, WAV, и т.д.)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // remove data url prefix
      const base64 = result.split(',')[1];
      
      onFileSelected({
        name: file.name,
        url: URL.createObjectURL(file),
        base64,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [disabled, onFileSelected]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full max-w-2xl mx-auto h-64 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden
        ${isDragging ? 'border-purple-400 bg-purple-900/20 scale-105 shadow-[0_0_30px_rgba(168,85,247,0.3)]' : 'border-slate-600 bg-slate-800/50 hover:border-purple-500/50 hover:bg-slate-800'}
        ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
      `}
    >
      <input
        type="file"
        accept="audio/*"
        onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={disabled}
      />
      
      <div className="z-10 text-center px-4">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-tr from-purple-500 to-pink-500 transition-transform duration-500 ${isDragging ? 'rotate-12 scale-110' : ''}`}>
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <p className="text-xl font-bold text-white mb-2">
            {isDragging ? 'Отпустите бит сюда!' : 'Загрузите свой трек'}
        </p>
        <p className="text-slate-400 text-sm">
          Перетащите сюда или нажмите для выбора <br/> <span className="text-xs opacity-60">(MP3, WAV, AAC)</span>
        </p>
      </div>
      
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900 via-slate-900 to-transparent"></div>
    </div>
  );
};
