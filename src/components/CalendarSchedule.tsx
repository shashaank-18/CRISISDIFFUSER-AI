import React, { useState } from "react";
import { Calendar, Plus, Download, Trash2, CalendarCheck, Clock, CheckCircle2 } from "lucide-react";
import { CalendarEvent, Task } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface CalendarScheduleProps {
  events: CalendarEvent[];
  tasks: Task[];
  onAddEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  onToggleEventComplete: (id: string) => void;
  onAutoSchedule: () => void;
}

export default function CalendarSchedule({
  events,
  tasks,
  onAddEvent,
  onDeleteEvent,
  onToggleEventComplete,
  onAutoSchedule,
}: CalendarScheduleProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("30"); // minutes
  const [associatedTaskId, setAssociatedTaskId] = useState("");

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startTime) return;

    const start = new Date(startTime);
    const end = new Date(start.getTime() + parseInt(duration, 10) * 60 * 1000);

    const newEvent: CalendarEvent = {
      id: "event-" + Date.now(),
      title,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      taskId: associatedTaskId || undefined,
      completed: false,
    };

    onAddEvent(newEvent);
    setTitle("");
    setAssociatedTaskId("");
    setShowAddForm(false);
  };

  // Convert Events into ICS file format and download
  const handleExportICS = () => {
    if (events.length === 0) {
      alert("No schedule blocks to export yet. Use Auto-Schedule or add blocks manually first!");
      return;
    }

    const pad = (n: number) => String(n).padStart(2, "0");
    const formatICSDate = (dateStr: string) => {
      const d = new Date(dateStr);
      return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
    };

    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//The Last-Minute Life Saver//Task Schedule//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ].join("\r\n");

    events.forEach((ev) => {
      icsContent += "\r\n" + [
        "BEGIN:VEVENT",
        `UID:${ev.id}@lifesaver.app`,
        `DTSTAMP:${formatICSDate(new Date().toISOString())}`,
        `DTSTART:${formatICSDate(ev.startTime)}`,
        `DTEND:${formatICSDate(ev.endTime)}`,
        `SUMMARY:${ev.title}`,
        `DESCRIPTION:AI Auto-Scheduled focus block to survive task deadline. Completed: ${ev.completed ? "Yes" : "No"}`,
        "END:VEVENT",
      ].join("\r\n");
    });

    icsContent += "\r\nEND:VCALENDAR";

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "LastMinute_Focus_Schedule.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sortedEvents = [...events].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="bg-[#0e1424]/80 border border-slate-800/60 rounded-2xl p-6 shadow-xl backdrop-blur-sm" id="calendar-schedule-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <span>Crisis Focus Calendar</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Block dedicated deep work slots to guarantee task completion on time.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={onAutoSchedule}
            disabled={tasks.filter((t) => !t.completed).length === 0}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-xl text-xs transition-all duration-200 active:scale-95"
            id="auto-schedule-btn"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>AI Auto-Schedule Blocks</span>
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center gap-1 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs transition-all duration-200 active:scale-95"
            id="toggle-add-event-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Add Block</span>
          </button>

          <button
            onClick={handleExportICS}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-slate-800/80 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl text-xs transition-all duration-200"
            title="Export schedule as standard .ics file"
            id="export-ics-btn"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Manual Add Event form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleAddSubmit}
            className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl mb-6 flex flex-col gap-3"
            id="add-event-form"
          >
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Configure Focus Block</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Block Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Focus Block: Write Intro"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Associated Task</label>
                <select
                  value={associatedTaskId}
                  onChange={(e) => setAssociatedTaskId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">None</option>
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={{ colorScheme: "dark" }}
                  className="w-full bg-[#111827]/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 cursor-pointer hover:border-slate-700 transition-colors [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:transition-opacity"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Duration (Minutes)</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="15">15 mins (Sprint)</option>
                  <option value="25">25 mins (Pomodoro)</option>
                  <option value="30">30 mins</option>
                  <option value="50">50 mins (Deep Work)</option>
                  <option value="60">60 mins</option>
                  <option value="90">90 mins</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg text-xs"
              >
                Add to Calendar
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Focus schedule view */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
            <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-xs">No active focus blocks scheduled today.</p>
            <p className="text-[10px] text-slate-500 mt-1 max-w-[280px] mx-auto">
              Tap <strong className="text-slate-300 font-medium">AI Auto-Schedule</strong> to fit tasks' recommended sessions directly into your calendar slots!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedEvents.map((ev) => {
              const start = new Date(ev.startTime);
              const end = new Date(ev.endTime);
              const isToday = start.toDateString() === new Date().toDateString();

              return (
                <div
                  key={ev.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${
                    ev.completed
                      ? "bg-emerald-500/5 border-emerald-500/10 opacity-70"
                      : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => onToggleEventComplete(ev.id)}
                      className={`mt-0.5 rounded-full p-0.5 transition-colors ${
                        ev.completed ? "text-emerald-400" : "text-slate-600 hover:text-emerald-400"
                      }`}
                      title={ev.completed ? "Mark as in-progress" : "Mark focus block complete"}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${ev.completed ? "fill-emerald-500/20" : ""}`} />
                    </button>

                    <div className="min-w-0">
                      <p className={`text-xs font-semibold text-white ${ev.completed ? "line-through text-slate-400" : ""}`}>
                        {ev.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap text-[10px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>
                            {isToday ? "Today" : start.toLocaleDateString(undefined, { month: "short", day: "numeric" })}{" "}
                            {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                            {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </span>
                        {ev.taskId && (
                          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[9px] truncate max-w-[120px]">
                            Deadline Linked
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteEvent(ev.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800/50 transition-colors"
                    title="Remove focus block"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
