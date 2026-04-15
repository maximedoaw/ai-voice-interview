// components/interview/AudioVisualizer.tsx
"use client";

import { useVoice, VoiceReadyState } from "@humeai/voice-react";

interface AudioVisualizerProps {
  className?: string;
}

export function AudioVisualizer({ className = "" }: AudioVisualizerProps) {
  const { micFft, fft, readyState } = useVoice();
  const isConnected = readyState === VoiceReadyState.OPEN;
  const isConnecting = readyState === VoiceReadyState.CONNECTING;

  if (!isConnected) {
    return (
      <div className={`relative ${className}`}>
        {/* Animation pulse comme sur l'image */}
        <div className="relative w-32 h-32 md:w-40 md:h-40">
          {/* Cercle extérieur animé */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse opacity-75" />
          <div className="absolute inset-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 animate-ping opacity-50" />
          
          {/* Cercle central avec micro */}
          <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center shadow-2xl">
            <svg className="w-12 h-12 md:w-16 md:h-16 text-green-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          
          {/* Texte de statut */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
              {isConnecting ? "Connexion..." : "En attente"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // États actifs avec animation
  const bars = Array.from({ length: 32 }, (_, i) => {
    const micVal = micFft?.[Math.floor((i / 32) * (micFft?.length ?? 1))] ?? 0;
    const asstVal = fft?.[Math.floor((i / 32) * (fft?.length ?? 1))] ?? 0;
    return Math.max(micVal, asstVal);
  });

  return (
    <div className={`relative ${className}`}>
      {/* Halo lumineux animé */}
      <div className="absolute -inset-4 bg-gradient-to-r from-green-400 via-emerald-500 to-green-400 rounded-full opacity-20 animate-spin-slow blur-xl" />
      
      <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-green-600 to-emerald-700 p-1 shadow-2xl">
        <div className="w-full h-full rounded-full bg-white/10 backdrop-blur-sm flex items-end justify-center gap-1 px-4 pb-4">
          {bars.map((val, i) => (
            <div
              key={i}
              className="w-1.5 bg-white rounded-full transition-all duration-75"
              style={{
                height: `${Math.max(8, Math.min(64, val * 200 + 8))}px`,
                opacity: 0.6 + val * 0.4,
                animationDelay: `${i * 20}ms`,
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
        <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full animate-pulse">
          🎤 En conversation...
        </span>
      </div>
    </div>
  );
}