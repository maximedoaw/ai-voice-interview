"use client";

import { useVoice, VoiceReadyState } from "@humeai/voice-react";

interface AudioVisualizerProps {
  className?: string;
}

export function AudioVisualizer({ className = "" }: AudioVisualizerProps) {
  const { fft, micFft, readyState, isMuted } = useVoice();
  const isConnected = readyState === VoiceReadyState.OPEN;
  const isConnecting = readyState === VoiceReadyState.CONNECTING;

  // Merge fft (assistant) + micFft (user) — take max for visual reactivity
  const bars = Array.from({ length: 5 }, (_, i) => {
    const fftVal  = fft?.[Math.floor((i / 5) * (fft?.length  ?? 1))] ?? 0;
    const micVal  = micFft?.[Math.floor((i / 5) * (micFft?.length ?? 1))] ?? 0;
    return Math.max(fftVal, micVal);
  });

  // Heights for the 5 bars — center bar taller (phone signal icon style)
  const baseHeights = [10, 16, 22, 16, 10];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Outer pulsing rings container */}
      <div className="relative flex items-center justify-center">

        {/* Ring 3 — outermost, most transparent */}
        <div
          className={`absolute rounded-full transition-all duration-700 ${
            isConnected ? "animate-ping" : ""
          }`}
          style={{
            width: 260,
            height: 260,
            background: "rgba(52, 211, 153, 0.04)",
            border: "1px solid rgba(52, 211, 153, 0.12)",
            animationDuration: "2.4s",
          }}
        />

        {/* Ring 2 */}
        <div
          className={`absolute rounded-full transition-all duration-700 ${
            isConnected ? "animate-ping" : ""
          }`}
          style={{
            width: 220,
            height: 220,
            background: "rgba(52, 211, 153, 0.06)",
            border: "1px solid rgba(52, 211, 153, 0.18)",
            animationDuration: "2s",
            animationDelay: "0.3s",
          }}
        />

        {/* Ring 1 — innermost outer ring */}
        <div
          className={`absolute rounded-full transition-all duration-700 ${
            isConnected || isConnecting ? "animate-pulse" : ""
          }`}
          style={{
            width: 182,
            height: 182,
            background: "rgba(52, 211, 153, 0.08)",
            border: "1.5px solid rgba(52, 211, 153, 0.22)",
          }}
        />

        {/* White orb — center */}
        <div
          className="relative rounded-full bg-white flex items-center justify-center z-10"
          style={{
            width: 136,
            height: 136,
            boxShadow: "0 8px 40px -8px rgba(0,0,0,0.12), 0 2px 12px -2px rgba(0,0,0,0.06)",
          }}
        >
          {/* Idle / connecting state — mic icon */}
          {!isConnected && (
            <div
              className={`flex items-center justify-center transition-opacity duration-300 ${
                isConnecting ? "opacity-60" : "opacity-30"
              }`}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#34D399"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
          )}

          {/* Connected — FFT bars (phone-signal style) */}
          {isConnected && (
            <div className="flex items-end justify-center gap-[5px]">
              {bars.map((val, i) => {
                const base = baseHeights[i];
                const boost = val * 28;
                const h = Math.max(base, Math.min(base + boost, 44));
                return (
                  <div
                    key={i}
                    className="rounded-full transition-all duration-75"
                    style={{
                      width: 5,
                      height: h,
                      background:
                        val > 0.05
                          ? `rgba(16, 185, 129, ${0.7 + val * 0.3})`
                          : "rgba(52, 211, 153, 0.5)",
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}