import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  CheckSquare,
  Square,
  Trash2,
  RotateCcw,
  RefreshCw,
  ListTodo,
  CalendarCheck,
} from "lucide-react";
import { Task, TaskStep } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface TaskCardProps {
  key?: string;
  task: Task;
  isSelected: boolean;
  onSelect: () => void;
  onToggleComplete: () => void;
  onDelete: () => void;
  onAnalyzeAI: () => void;
  onToggleStepComplete: (stepIndex: number) => void;
  onStartFocus: (step: TaskStep) => void;
}

export default function TaskCard({
  task,
  isSelected,
  onSelect,
  onToggleComplete,
  onDelete,
  onAnalyzeAI,
  onToggleStepComplete,
  onStartFocus,
}: TaskCardProps) {
  const [copied, setCopied] = useState(false);

  // Calculate dynamic hours left client side
  const calculateHoursLeft = (deadlineStr: string) => {
    const diff = new Date(deadlineStr).getTime() - new Date().getTime();
    return diff / (1000 * 60 * 60);
  };

  const getOverdueText = (hours: number) => {
    const absHours = Math.abs(hours);
    if (absHours < 1) {
      const minutes = Math.round(absHours * 60);
      return `Overdue by ${minutes} ${minutes === 1 ? "min" : "mins"}`;
    }
    const roundedHours = Math.round(absHours);
    return `Overdue by ${roundedHours} ${roundedHours === 1 ? "hr" : "hrs"}`;
  };

  const hoursLeft = calculateHoursLeft(task.deadline);
  const formattedDeadline = new Date(task.deadline).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Calculate visual Panic Meter %
  // Normal tasks (hours > 72) -> low panic
  // Critical tasks (hours < 12) -> very high panic
  const getPanicMeterScore = () => {
    if (task.priorityScore !== undefined) return task.priorityScore;
    // Fallback simple math
    const base = task.importance === "High" ? 40 : task.importance === "Medium" ? 25 : 10;
    const proximityMultiplier = Math.max(0, 100 - (hoursLeft / 72) * 100);
    return Math.min(100, Math.round(base + proximityMultiplier * 0.6));
  };

  const panicScore = getPanicMeterScore();

  // Survival level colors
  let tierColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  let panicBarColor = "bg-emerald-500";
  let tierLabel = "NORMAL";

  const currentTier = task.survivalTier || (hoursLeft < 12 ? "CRITICAL" : hoursLeft < 36 ? "HIGH RISK" : hoursLeft < 72 ? "MODERATE" : "NORMAL");

  if (currentTier === "CRITICAL") {
    tierColor = "bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse";
    panicBarColor = "bg-rose-500";
    tierLabel = "CRITICAL CRISIS";
  } else if (currentTier === "HIGH RISK") {
    tierColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
    panicBarColor = "bg-amber-500";
    tierLabel = "HIGH RISK DEADLINE";
  } else if (currentTier === "MODERATE") {
    tierColor = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    panicBarColor = "bg-indigo-400";
    tierLabel = "MODERATE PRESSURE";
  }

  const handleCopyTemplate = () => {
    if (!task.extensionTemplate) return;
    navigator.clipboard.writeText(task.extensionTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`bg-[#0e1424]/80 border rounded-2xl transition-all duration-300 overflow-hidden relative ${
        isSelected
          ? "border-emerald-500/30 ring-1 ring-emerald-500/10 shadow-xl shadow-emerald-950/5 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-emerald-500"
          : "border-slate-800/60 hover:border-slate-700/80 hover:bg-[#0e1424] shadow-sm"
      } ${task.completed ? "opacity-75" : ""}`}
      id={`task-card-${task.id}`}
    >
      {/* Header Info Banner */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          {/* Completion Checkbox and Title */}
          <div className="flex items-start gap-3 min-w-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete();
              }}
              className="mt-1 flex-shrink-0 text-slate-500 hover:text-emerald-400 transition-colors"
              id={`task-complete-btn-${task.id}`}
            >
              {task.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/10" />
              ) : (
                <div className="w-5 h-5 rounded-md border-2 border-slate-700 hover:border-emerald-400 transition-colors" />
              )}
            </button>

            <div className="min-w-0" onClick={onSelect}>
              <h3
                className={`text-sm md:text-base font-bold text-white flex-wrap ${
                  task.completed ? "line-through text-slate-500" : ""
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* Action Flags */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={`text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full border ${tierColor}`}
            >
              {tierLabel}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800/50 transition-colors"
              id={`task-delete-btn-${task.id}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Info Grid (Hours, Priority) */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-1.5 border-t border-slate-800/60">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{formattedDeadline}</span>
            </span>

            <span className="flex items-center gap-1 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className={hoursLeft < 12 ? "text-rose-400 font-bold" : "text-slate-300"}>
                {hoursLeft < 0 ? (
                  <span className="text-rose-500 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse inline-block" />
                    {getOverdueText(hoursLeft)}
                  </span>
                ) : hoursLeft < 1 ? (
                  "Under 1 hour left"
                ) : (
                  `${Math.round(hoursLeft)} hrs left`
                )}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 flex-shrink-0">
              Panic Score
            </span>
            <div className="w-24 bg-slate-950 h-2 rounded-full overflow-hidden flex-shrink-0 border border-slate-800">
              <div
                className={`h-full ${panicBarColor}`}
                style={{ width: `${panicScore}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-300 w-8 text-right">
              {panicScore}%
            </span>
          </div>
        </div>

        {/* AI Activation Bar (If not analyzed) */}
        {!task.breakdown && !task.completed && !task.analyzing && (
          <div className="mt-4 bg-emerald-500/5 border border-dashed border-emerald-500/20 p-3 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 fill-emerald-500/10 animate-pulse" />
              <p className="text-[11px] text-slate-300">
                Generate dynamic, low-friction micro-checklists to beat starting stress.
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAnalyzeAI();
              }}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-semibold rounded-lg shadow-sm transition-all duration-200 active:scale-95 flex-shrink-0"
              id={`analyze-task-btn-${task.id}`}
            >
              Prepare Action Plan
            </button>
          </div>
        )}

        {/* Analyzing / Loading State */}
        {task.analyzing && (
          <div className="mt-4 bg-slate-950/40 border border-slate-800 p-4 rounded-xl text-center space-y-3">
            <div className="flex gap-1.5 justify-center items-center h-4">
              {[...Array(4)].map((_, i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="text-xs text-slate-300 font-medium">Deconstructing procrastination friction...</p>
            <p className="text-[10px] text-slate-500">Creating custom step-by-step checklist templates & extension drafts.</p>
          </div>
        )}

        {/* Error State */}
        {task.error && (
          <div className="mt-4 bg-rose-500/5 border border-rose-500/20 p-3 rounded-xl">
            <p className="text-xs text-rose-400 font-medium">{task.error}</p>
            <button
              onClick={onAnalyzeAI}
              className="text-[10px] text-emerald-400 hover:underline mt-1 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Retry Generation
            </button>
          </div>
        )}
      </div>

      {/* Expanded Actions & Breakdown Panel */}
      <AnimatePresence>
        {isSelected && (task.breakdown || task.timeBlocks || task.extensionTemplate) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-800/80 bg-slate-950/30"
          >
            <div className="p-5 space-y-6">
              {/* Steps Checklist */}
              {task.breakdown && (
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <ListTodo className="w-4 h-4 text-emerald-400" />
                    <span>AI Low-Friction Step Checklist</span>
                  </h4>

                  <div className="space-y-2.5">
                    {task.breakdown.map((step, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start justify-between gap-3 p-3 rounded-xl border transition-colors ${
                          step.completed
                            ? "bg-emerald-500/5 border-emerald-500/10 opacity-70"
                            : "bg-slate-900 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <button
                            onClick={() => onToggleStepComplete(idx)}
                            className="mt-0.5 text-slate-500 hover:text-emerald-400 transition-colors"
                          >
                            {step.completed ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <div className="w-4 h-4 rounded border border-slate-700 hover:border-emerald-400 transition-colors" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <p className={`text-xs font-semibold text-white ${step.completed ? "line-through text-slate-400" : ""}`}>
                              {step.title}
                            </p>
                            {step.tip && (
                              <p className="text-[10px] text-slate-400 italic mt-0.5 leading-normal">
                                Procrastination Blocker: {step.tip}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] font-mono text-slate-400">
                            {step.duration}m
                          </span>
                          {!step.completed && (
                            <button
                              onClick={() => onStartFocus(step)}
                              className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 text-[10px] font-bold rounded-lg transition-colors border border-emerald-500/20 hover:border-transparent"
                            >
                              Focus
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* recommended focus blocks */}
              {task.timeBlocks && task.timeBlocks.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CalendarCheck className="w-4 h-4 text-emerald-400" />
                    <span>Recommended Work blocks</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {task.timeBlocks.map((block, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex flex-col justify-between"
                      >
                        <div>
                          <p className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                            {block.blockName}
                          </p>
                          <p className="text-xs text-white font-medium mt-1">
                            {block.focusArea}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-3">
                          <span>Focus: {block.durationMinutes}m</span>
                          <span>•</span>
                          <span>Reset: {block.breakMinutes}m</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Copy Extension Template */}
              {task.extensionTemplate && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                      Emergency Communication Draft
                    </span>
                    <button
                      onClick={handleCopyTemplate}
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all border border-slate-700/60 active:scale-95 flex items-center gap-1 text-[10px]"
                      title="Copy polite extension email draft to clipboard"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Draft</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-[11px] text-slate-300 font-sans leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto pr-1">
                    {task.extensionTemplate}
                  </pre>
                  {task.mitigationTip && (
                    <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-400 italic">
                      Panic Control: {task.mitigationTip}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
