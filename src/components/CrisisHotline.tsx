import React, { useState, useRef } from "react";
import { PhoneCall, PhoneOff, Volume2, Shield, RefreshCw } from "lucide-react";
import { Task } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface CrisisHotlineProps {
  activeTasks: Task[];
}

export function playPCMBase64(base64Str: string, sampleRate = 24000) {
  try {
    const binaryString = window.atob(base64Str);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // 16-bit audio is 2 bytes per sample
    const buffer = bytes.buffer;
    const int16Array = new Int16Array(buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0; // Normalise standard 16-bit signed PCM to float
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioContextClass({ sampleRate });
    const audioBuffer = audioCtx.createBuffer(1, float32Array.length, sampleRate);
    audioBuffer.copyToChannel(float32Array, 0);

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start(0);
    return { source, audioCtx };
  } catch (err) {
    console.error("PCM playback failed:", err);
    return null;
  }
}

export default function CrisisHotline({ activeTasks }: CrisisHotlineProps) {
  const [status, setStatus] = useState<"idle" | "calling" | "active" | "error">("idle");
  const [transcript, setTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const activeAudioRef = useRef<{ source: AudioBufferSourceNode; audioCtx: AudioContext } | null>(null);

  const startHotline = async () => {
    setStatus("calling");
    setTranscript("");
    setErrorMessage("");

    try {
      const taskListStr = activeTasks
        .filter((t) => !t.completed)
        .map((t) => t.title)
        .join(", ") || "various last-minute assignments";

      const res = await fetch("/api/gemini/crisis-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeTasks: taskListStr }),
      });

      if (!res.ok) {
        throw new Error("The voice coach is currently busy with other students. Try again shortly!");
      }

      const data = await res.json();
      if (!data.textTranscript) {
        throw new Error("Could not fetch spoken instructions.");
      }

      setTranscript(data.textTranscript);
      setStatus("active");

      // Stop previous audio if any
      if (activeAudioRef.current) {
        try {
          activeAudioRef.current.source.stop();
          activeAudioRef.current.audioCtx.close();
        } catch (e) {}
      }

      if (data.audioBase64) {
        // Play PCM 24kHz
        const played = playPCMBase64(data.audioBase64, 24000);
        if (played) {
          activeAudioRef.current = played;
          played.source.onended = () => {
            setStatus("idle");
          };
        } else {
          setStatus("idle");
        }
      }
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to reach hotline.");
    }
  };

  const endHotline = () => {
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.source.stop();
        activeAudioRef.current.audioCtx.close();
      } catch (e) {}
      activeAudioRef.current = null;
    }
    setStatus("idle");
    setTranscript("");
  };

  return (
    <div
      className="bg-[#0e1424]/80 border border-slate-800/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center text-center backdrop-blur-sm"
      id="crisis-hotline-card"
    >
      {/* Background distress gradient */}
      <div className="absolute inset-0 bg-radial from-rose-500/5 to-transparent pointer-events-none" />

      <div className="inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full text-xs font-semibold mb-4">
        <Shield className="w-3.5 h-3.5 fill-rose-500/10" />
        <span>Panic Room Emergency Hotline</span>
      </div>

      <h3 className="text-xl font-bold text-white mb-2">Overwhelmed? Launch Voice Coach</h3>
      <p className="text-slate-400 text-xs max-w-sm mb-6 leading-relaxed">
        Stressed out by close deadlines? Press the hotline to receive immediate, spoken step-by-step guidance.
      </p>

      {/* Main button states */}
      <div className="relative mb-6">
        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.button
              key="idle"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={startHotline}
              className="w-20 h-20 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-500/20 cursor-pointer active:scale-95 transition-all"
              id="call-hotline-btn"
            >
              <PhoneCall className="w-8 h-8 animate-pulse" />
            </motion.button>
          )}

          {status === "calling" && (
            <motion.div
              key="calling"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-20 h-20 bg-slate-800 border border-rose-500/30 text-rose-400 rounded-full flex items-center justify-center"
            >
              <RefreshCw className="w-8 h-8 animate-spin" />
            </motion.div>
          )}

          {status === "active" && (
            <motion.button
              key="active"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={endHotline}
              className="w-20 h-20 bg-slate-950 border-2 border-rose-500 text-rose-500 rounded-full flex items-center justify-center animate-pulse cursor-pointer"
              id="end-hotline-btn"
            >
              <PhoneOff className="w-8 h-8" />
            </motion.button>
          )}

          {status === "error" && (
            <motion.button
              key="error"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={startHotline}
              className="w-20 h-20 bg-slate-800 border border-slate-700 text-slate-400 rounded-full flex items-center justify-center"
            >
              <PhoneCall className="w-8 h-8" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Subtitles / Audio Wave */}
      <div className="w-full min-h-[48px] flex flex-col items-center justify-center">
        {status === "active" && transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 w-full"
          >
            {/* Visual audio waves */}
            <div className="flex gap-1 justify-center items-center h-4">
              {[...Array(6)].map((_, i) => (
                <span
                  key={i}
                  className="w-1 bg-rose-500 rounded-full animate-bounce"
                  style={{
                    height: `${Math.random() * 16 + 4}px`,
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: "0.6s",
                  }}
                />
              ))}
            </div>

            <p className="text-sm text-slate-100 italic bg-slate-950/60 border border-slate-800 px-4 py-3 rounded-xl max-w-md mx-auto leading-relaxed">
              "{transcript}"
            </p>
          </motion.div>
        )}

        {status === "calling" && (
          <p className="text-xs text-rose-400 font-mono animate-pulse">
            DIALING SECURE COACHING CHANNEL...
          </p>
        )}

        {status === "error" && (
          <p className="text-xs text-rose-400 font-semibold max-w-xs leading-relaxed">
            {errorMessage}
          </p>
        )}

        {status === "idle" && (
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
            Coach Status: Connected & Offline
          </span>
        )}
      </div>
    </div>
  );
}
