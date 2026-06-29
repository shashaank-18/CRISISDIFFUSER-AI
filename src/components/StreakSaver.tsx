import React, { useState } from "react";
import { Award, Flame, ShieldAlert, Zap, Plus, Trash2, CheckCircle, RefreshCw } from "lucide-react";
import { Habit } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface StreakSaverProps {
  habits: Habit[];
  onAddHabit: (name: string) => void;
  onDeleteHabit: (id: string) => void;
  onCompleteHabit: (id: string, isAlternative: boolean) => void;
  onSaveStreakAI: (id: string) => Promise<void>;
}

export default function StreakSaver({
  habits,
  onAddHabit,
  onDeleteHabit,
  onCompleteHabit,
  onSaveStreakAI,
}: StreakSaverProps) {
  const [newHabitName, setNewHabitName] = useState("");
  const [selectedSaverHabit, setSelectedSaverHabit] = useState<Habit | null>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    onAddHabit(newHabitName.trim());
    setNewHabitName("");
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const handleSaveStreakClick = async (habit: Habit) => {
    setSelectedSaverHabit(habit);
    await onSaveStreakAI(habit.id);
  };

  // Sync modal view when habits change
  const currentModalHabit = selectedSaverHabit ? habits.find((h) => h.id === selectedSaverHabit.id) : null;

  return (
    <div className="bg-[#0e1424]/80 border border-slate-800/60 rounded-2xl p-6 shadow-xl backdrop-blur-sm" id="streak-saver-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500/10" />
            <span>Streak-Saver Habits</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Build consistency. When you have zero time, activate AI Streak Saver to preserve your progress!
          </p>
        </div>

        <form onSubmit={handleAddSubmit} className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="New Habit (e.g. Gym, Coding)"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            className="w-full sm:w-48 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            id="new-habit-input"
          />
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-xl px-3 py-1.5 text-xs transition-all duration-200"
            id="add-habit-submit"
          >
            Add
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
            <Award className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-xs">No habits tracked yet.</p>
            <p className="text-[10px] text-slate-500 mt-1 max-w-[240px] mx-auto">
              Add your critical routines above to ensure you keep making progress.
            </p>
          </div>
        ) : (
          habits.map((habit) => {
            const isCompletedToday = habit.lastCompletedDate === todayStr;

            return (
              <div
                key={habit.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                  isCompletedToday
                    ? "bg-amber-500/5 border-amber-500/10 opacity-80"
                    : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center bg-amber-500/10 rounded-xl p-2 text-amber-500">
                    <Flame className={`w-5 h-5 ${habit.streak > 0 ? "fill-amber-500" : ""}`} />
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span>{habit.name}</span>
                      {habit.streak > 0 && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-mono font-bold">
                          {habit.streak}d streak
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {isCompletedToday
                        ? habit.savedToday
                          ? "Saved via AI alternative!"
                          : "Completed for today!"
                        : "Remaining for today"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isCompletedToday ? (
                    <>
                      <button
                        onClick={() => onCompleteHabit(habit.id, false)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors"
                        id={`complete-habit-standard-${habit.id}`}
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Done</span>
                      </button>

                      <button
                        onClick={() => handleSaveStreakClick(habit)}
                        disabled={habit.saving}
                        className="flex items-center gap-1 px-2.5 py-1.5 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs transition-colors"
                        id={`save-streak-btn-${habit.id}`}
                      >
                        {habit.saving ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Zap className="w-3.5 h-3.5" />
                        )}
                        <span>AI Save Streak</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                      LOCKED IN
                    </span>
                  )}

                  <button
                    onClick={() => onDeleteHabit(habit.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* AI Streak Saver Alternative Modal */}
      <AnimatePresence>
        {currentModalHabit && (currentModalHabit.saverAlternative || currentModalHabit.saving) && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center bg-amber-500/10 text-amber-500 rounded-full p-3 mb-2">
                  <ShieldAlert className="w-6 h-6 animate-bounce" />
                </div>
                <h3 className="text-lg font-bold text-white">AI Habit Crisis Mitigation</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Saving streak for: <strong className="text-amber-400">{currentModalHabit.name}</strong>
                </p>
              </div>

              {currentModalHabit.saving ? (
                <div className="py-10 text-center">
                  <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-slate-300">Consulting productive micro-patterns...</p>
                  <p className="text-[10px] text-slate-500 mt-1">Calculating 3-minute survival equivalent.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
                    <p className="text-[11px] font-mono text-amber-400 uppercase tracking-wider mb-1.5">
                      3-Minute Alternative:
                    </p>
                    <p className="text-sm text-white font-medium leading-relaxed">
                      {currentModalHabit.saverAlternative}
                    </p>
                  </div>

                  {currentModalHabit.saverSlogan && (
                    <div className="border-l-2 border-emerald-500 pl-3 py-1 text-slate-300 italic text-xs leading-relaxed">
                      "{currentModalHabit.saverSlogan}"
                    </div>
                  )}

                  {currentModalHabit.saverBenefit && (
                    <div className="text-[10px] text-slate-400 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                      <strong className="text-slate-300 font-semibold block mb-0.5">Why this works:</strong>
                      {currentModalHabit.saverBenefit}
                    </div>
                  )}

                  <div className="flex gap-2 justify-end mt-6">
                    <button
                      onClick={() => setSelectedSaverHabit(null)}
                      className="px-3.5 py-2 text-slate-400 hover:text-white text-xs"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => {
                        onCompleteHabit(currentModalHabit.id, true);
                        setSelectedSaverHabit(null);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-xl text-xs transition-colors"
                      id="execute-streak-save-btn"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Execute 3-Min Save</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
