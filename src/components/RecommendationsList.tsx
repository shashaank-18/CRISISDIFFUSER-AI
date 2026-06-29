import React from "react";
import { Sparkles, ShieldAlert, Compass, Lightbulb, CheckSquare, RefreshCw } from "lucide-react";
import { Recommendation } from "../types";
import { motion } from "motion/react";

interface RecommendationsListProps {
  recommendations: Recommendation[];
  loading: boolean;
  onRefresh: () => void;
  onApplyAction: (actionLabel: string) => void;
}

export default function RecommendationsList({
  recommendations,
  loading,
  onRefresh,
  onApplyAction,
}: RecommendationsListProps) {
  return (
    <div className="bg-[#0e1424]/80 border border-slate-800/60 rounded-2xl p-6 shadow-xl backdrop-blur-sm" id="recommendations-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400 fill-indigo-400/10" />
            <span>AI Survival Strategy Center</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic, proactive coaching suggestions based on your active deadlines.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-40"
          title="Regenerate proactive recommendations"
          id="refresh-recommendations-btn"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-300">Consulting AI task strategist...</p>
          <p className="text-[10px] text-slate-500 mt-1">Analyzing deadline loads and habit consistency.</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
          <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400 text-xs">No active recommendations.</p>
          <p className="text-[10px] text-slate-500 mt-1 max-w-[240px] mx-auto">
            Add upcoming high-pressure deadlines and click the refresh button above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.slice(0, 3).map((rec, idx) => {
            // Pick icon and color scheme based on recommendation type
            let icon = <Lightbulb className="w-5 h-5" />;
            let styles = "bg-indigo-500/5 border-indigo-500/10 text-indigo-400";

            if (rec.type === "CRISIS") {
              icon = <ShieldAlert className="w-5 h-5 animate-pulse" />;
              styles = "bg-rose-500/5 border-rose-500/15 text-rose-400";
            } else if (rec.type === "STRATEGY") {
              icon = <Compass className="w-5 h-5" />;
              styles = "bg-emerald-500/5 border-emerald-500/10 text-emerald-400";
            } else if (rec.type === "RESCHEDULE") {
              icon = <CheckSquare className="w-5 h-5" />;
              styles = "bg-amber-500/5 border-amber-500/10 text-amber-400";
            }

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={idx}
                className={`flex flex-col justify-between p-4 rounded-xl border ${styles}`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                      {icon}
                    </div>
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
                      {rec.type}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white mb-1.5 leading-snug">
                    {rec.title}
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed mb-4">
                    {rec.description}
                  </p>
                </div>

                <button
                  onClick={() => onApplyAction(rec.actionLabel)}
                  className="w-full text-center py-2 bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  {rec.actionLabel}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
