import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, CheckCircle2, Zap, Hourglass } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ActionTimerProps {
  stepTitle: string;
  defaultDurationMinutes: number;
  onComplete: () => void;
}

export default function ActionTimer({ stepTitle, defaultDurationMinutes, onComplete }: ActionTimerProps) {
  const [timeLeft, setTimeLeft] = useState(defaultDurationMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset timer when step duration changes
  useEffect(() => {
    setTimeLeft(defaultDurationMinutes * 60);
    setIsRunning(false);
  }, [defaultDurationMinutes, stepTitle]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, onComplete]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setTimeLeft(defaultDurationMinutes * 60);
    setIsRunning(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / (defaultDurationMinutes * 60 || 1);

  return (
    <div className="bg-[#0e1424]/80 border border-slate-800/60 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm" id="action-timer-card">
      {/* Background glow when active */}
      <AnimatePresence>
        {isRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-emerald-500 blur-3xl pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <Hourglass className="w-5 h-5 animate-pulse" />
          <span className="font-sans text-xs font-semibold tracking-wider uppercase">Deep Focus Focus Block</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-full text-slate-300 font-mono text-xs">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Friction Buster Mode</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Radial Progress Display */}
        <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r="60"
              className="stroke-slate-800"
              strokeWidth="6"
              fill="transparent"
            />
            <motion.circle
              cx="72"
              cy="72"
              r="60"
              className="stroke-emerald-500"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={377}
              strokeDashoffset={377 * (1 - progress)}
              strokeLinecap="round"
              transition={{ ease: "linear" }}
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-3xl font-bold font-mono tracking-tight text-white">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mt-0.5">
              {isRunning ? "Ticking" : "Paused"}
            </p>
          </div>
        </div>

        {/* Info & Controls */}
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-sm font-semibold text-slate-200 line-clamp-1 mb-1">
            Current Target Step
          </h4>
          <p className="text-base text-white font-medium mb-4 line-clamp-2 leading-relaxed">
            {stepTitle || "Select a step to begin focus session"}
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <button
              onClick={toggleTimer}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 shadow-md ${
                isRunning
                  ? "bg-amber-500 hover:bg-amber-600 text-slate-950 active:scale-95"
                  : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 active:scale-95"
              }`}
              id="timer-toggle-btn"
            >
              {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isRunning ? "Pause Session" : "Start Focus"}</span>
            </button>

            <button
              onClick={resetTimer}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-sm transition-all duration-200 active:scale-95"
              id="timer-reset-btn"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={() => {
                onComplete();
                resetTimer();
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm transition-all duration-200 active:scale-95"
              id="timer-force-complete-btn"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Complete Step</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
