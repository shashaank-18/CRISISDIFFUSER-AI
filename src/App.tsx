import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Flame,
  Plus,
  Trash2,
  CalendarCheck,
  ShieldAlert,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertOctagon,
  BellRing,
  LayoutDashboard,
  Timer,
  User,
  UserPlus,
  LogOut,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Menu,
  X,
  Phone,
  ChevronRight,
  BookOpen,
  Trophy,
  Sliders,
  Volume2,
  VolumeX,
  Play,
  Square,
  Activity,
  Award,
  Zap,
  RotateCcw,
} from "lucide-react";
import { Task, Habit, CalendarEvent, Recommendation, TaskStep } from "./types";
import TaskCard from "./components/TaskCard";
import ActionTimer from "./components/ActionTimer";
import CalendarSchedule from "./components/CalendarSchedule";
import StreakSaver from "./components/StreakSaver";
import CrisisHotline from "./components/CrisisHotline";
import RecommendationsList from "./components/RecommendationsList";
import { motion, AnimatePresence } from "motion/react";

// Procedural audio synthesizers for absolute zero-dependency ambient audio
let audioCtx: AudioContext | null = null;
let soundNode: AudioNode | null = null;
let rainInterval: NodeJS.Timeout | null = null;

const startSynthSound = (type: string) => {
  try {
    if (soundNode) {
      stopSynthSound();
    }
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();

    if (type === "binaural") {
      const oscL = audioCtx.createOscillator();
      const oscR = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const merger = audioCtx.createChannelMerger(2);

      oscL.type = "sine";
      oscL.frequency.setValueAtTime(140, audioCtx.currentTime);

      oscR.type = "sine";
      oscR.frequency.setValueAtTime(148, audioCtx.currentTime);

      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);

      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      merger.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscL.start();
      oscR.start();

      soundNode = gainNode;
    } else if (type === "brown") {
      const bufferSize = 2 * audioCtx.sampleRate;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }

      const noiseNode = audioCtx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;

      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(400, audioCtx.currentTime);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);

      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      noiseNode.start();
      soundNode = noiseNode;
    } else if (type === "rain") {
      const bufferSize = audioCtx.sampleRate;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const source = audioCtx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      const filter = audioCtx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(800, audioCtx.currentTime);
      filter.Q.setValueAtTime(1, audioCtx.currentTime);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      source.start();

      soundNode = source;

      rainInterval = setInterval(() => {
        if (!audioCtx) return;
        const dropletOsc = audioCtx.createOscillator();
        const dropletGain = audioCtx.createGain();
        dropletOsc.type = "sine";
        dropletOsc.frequency.setValueAtTime(Math.random() * 1200 + 400, audioCtx.currentTime);

        dropletGain.gain.setValueAtTime(Math.random() * 0.02, audioCtx.currentTime);
        dropletGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);

        dropletOsc.connect(dropletGain);
        dropletGain.connect(audioCtx.destination);
        dropletOsc.start();
        dropletOsc.stop(audioCtx.currentTime + 0.15);
      }, 120);
    }
  } catch (err) {
    console.warn("Failed to start procedural audio context:", err);
  }
};

const stopSynthSound = () => {
  try {
    if (soundNode) {
      (soundNode as any).stop?.();
      soundNode = null;
    }
    if (rainInterval) {
      clearInterval(rainInterval);
      rainInterval = null;
    }
    if (audioCtx) {
      audioCtx.close();
      audioCtx = null;
    }
  } catch (e) {
    console.warn("Error stopping sound:", e);
  }
};

// Fetch user-specific tasks from local storage or return defaults for a new session
const getUserTasks = (email: string): Task[] => {
  if (!email) return [];
  const saved = localStorage.getItem(`lifesaver_tasks_${email}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
  }

  // If this is a newly registered user (not the demo admin account), start with a completely empty state
  if (email.toLowerCase() !== "admin@crisisdiffuser.ai") {
    return [];
  }

  const now = new Date();
  const todayLabReport = new Date(now.getTime() + 4.5 * 60 * 60 * 1000).toISOString();
  const figmaMockups = new Date(now.getTime() + 22 * 60 * 60 * 1000).toISOString();
  const taxFiling = new Date(now.getTime() + 46 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: "task-1",
      title: "Submit Physics Final Lab Report",
      deadline: todayLabReport,
      importance: "High",
      description: "Compile graphs, structure findings, and write conclusion to save 15% of final grade.",
      completed: false,
    },
    {
      id: "task-2",
      title: "Deliver Figma Mockups to client",
      deadline: figmaMockups,
      importance: "Medium",
      description: "Complete homepage redesign and prototype interactive login flow before tomorrow's call.",
      completed: false,
    },
    {
      id: "task-3",
      title: "Quarterly Tax Filing & Forms",
      deadline: taxFiling,
      importance: "High",
      description: "Review business expense sheets and submit state tax portal details to avoid late penalties.",
      completed: false,
    },
  ];
};

const getUserHabits = (email: string): Habit[] => {
  if (!email) return [];
  const saved = localStorage.getItem(`lifesaver_habits_${email}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
  }

  // If this is a newly registered user (not the demo admin account), start with a completely empty state
  if (email.toLowerCase() !== "admin@crisisdiffuser.ai") {
    return [];
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  return [
    {
      id: "habit-1",
      name: "Daily Leetcode Practice",
      streak: 12,
      lastCompletedDate: yesterdayStr,
    },
    {
      id: "habit-2",
      name: "30-Minute Cardio Session",
      streak: 5,
      lastCompletedDate: yesterdayStr,
    },
    {
      id: "habit-3",
      name: "Read 10 Pages of Tech Book",
      streak: 21,
      lastCompletedDate: yesterdayStr,
    },
  ];
};

const getUserCalendarEvents = (email: string): CalendarEvent[] => {
  if (!email) return [];
  const saved = localStorage.getItem(`lifesaver_events_${email}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
  }

  // If this is a newly registered user (not the demo admin account), start with a completely empty state
  if (email.toLowerCase() !== "admin@crisisdiffuser.ai") {
    return [];
  }

  const now = new Date();
  const earlierTodayStart = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
  const earlierTodayEnd = new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: "event-initial-1",
      title: "Focus block: Setup Lab Document",
      startTime: earlierTodayStart,
      endTime: earlierTodayEnd,
      taskId: "task-1",
      completed: true,
    },
  ];
};

const getUserRecommendations = (email: string): Recommendation[] => {
  if (!email) return [];
  const saved = localStorage.getItem(`lifesaver_recs_${email}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
  }

  // If this is a newly registered user (not the demo admin account), start with a completely empty state
  if (email.toLowerCase() !== "admin@crisisdiffuser.ai") {
    return [];
  }

  return [
    {
      type: "CRISIS",
      title: "Physics Lab Report in Critical Zone",
      description: "Only 4.5 hours remaining. Select 'Prepare Action Plan' on the card to generate micro-tasks immediately.",
      actionLabel: "Unlock Focus Map",
    },
    {
      type: "STRATEGY",
      title: "Auto-Schedule Strategy Recommended",
      description: "Squeeze key focus blocks directly into your morning. Avoid cognitive drain by letting the AI lock in work slots.",
      actionLabel: "Auto-Schedule Tasks",
    },
    {
      type: "RESCHEDULE",
      title: "Tax Filing extension availability",
      description: "Under severe pressure? AI can draft a professional extension message to your instructor or manager instantly.",
      actionLabel: "View Extension Template",
    },
  ];
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("lifesaver_logged_in") === "true";
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem("lifesaver_user_email") || "";
  });
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auth Form states
  const [isSignUp, setIsSignUp] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Persistence of Registered Users for mock authentication
  const [registeredUsers, setRegisteredUsers] = useState<{email: string; name: string; password: string;}[]>(() => {
    const saved = localStorage.getItem("lifesaver_registered_users");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [{ email: "admin@crisisdiffuser.ai", name: "Admin Operator", password: "password" }];
  });

  useEffect(() => {
    localStorage.setItem("lifesaver_registered_users", JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  const lastLoadedUserEmail = useRef<string>(localStorage.getItem("lifesaver_user_email") || "");

  const [tasks, setTasks] = useState<Task[]>(() => getUserTasks(lastLoadedUserEmail.current));
  const [habits, setHabits] = useState<Habit[]>(() => getUserHabits(lastLoadedUserEmail.current));
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => getUserCalendarEvents(lastLoadedUserEmail.current));
  const [recommendations, setRecommendations] = useState<Recommendation[]>(() => getUserRecommendations(lastLoadedUserEmail.current));

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>("task-1");
  const [activeTimerStep, setActiveTimerStep] = useState<TaskStep | null>(null);

  // New Interactive Features States
  const [panicLevel, setPanicLevel] = useState<number>(3); // 1 = Deep Calm, 2 = Mild Stress, 3 = Elevated, 4 = Severe Panic, 5 = Absolute Meltdown
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [showSimulator, setShowSimulator] = useState<boolean>(false);
  
  // Focus soundscape states
  const [activeSoundscape, setActiveSoundscape] = useState<string | null>(null);
  
  // Breathing guide states
  const [breathingActive, setBreathingActive] = useState<boolean>(false);
  const [breathingPhase, setBreathingPhase] = useState<"Breathe In" | "Hold" | "Breathe Out">("Breathe In");
  const [breathingProgress, setBreathingProgress] = useState<number>(4);

  // Breathing loop effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (breathingActive) {
      interval = setInterval(() => {
        setBreathingProgress((prev) => {
          if (prev <= 1) {
            setBreathingPhase((currentPhase) => {
              if (currentPhase === "Breathe In") return "Hold";
              if (currentPhase === "Hold") return "Breathe Out";
              return "Breathe In";
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathingPhase("Breathe In");
      setBreathingProgress(4);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [breathingActive]);

  const unlockBadge = (badgeId: string) => {
    if (!userEmail) return;
    setUnlockedBadges((prev) => {
      if (prev.includes(badgeId)) return prev;
      const next = [...prev, badgeId];
      localStorage.setItem(`lifesaver_badges_${userEmail}`, JSON.stringify(next));
      return next;
    });
  };

  // Sync badges on login
  useEffect(() => {
    if (isLoggedIn && userEmail) {
      const saved = localStorage.getItem(`lifesaver_badges_${userEmail}`);
      if (saved) {
        try {
          setUnlockedBadges(JSON.parse(saved));
        } catch (e) {
          setUnlockedBadges([]);
        }
      } else {
        setUnlockedBadges([]);
      }
    } else {
      setUnlockedBadges([]);
    }
  }, [userEmail, isLoggedIn]);

  // Sync / load correct states whenever logged-in user changes
  useEffect(() => {
    if (isLoggedIn && userEmail) {
      setTasks(getUserTasks(userEmail));
      setHabits(getUserHabits(userEmail));
      setCalendarEvents(getUserCalendarEvents(userEmail));
      setRecommendations(getUserRecommendations(userEmail));
      lastLoadedUserEmail.current = userEmail;
    } else {
      setTasks([]);
      setHabits([]);
      setCalendarEvents([]);
      setRecommendations([]);
      lastLoadedUserEmail.current = "";
    }
  }, [userEmail, isLoggedIn]);

  // UI forms
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [newTaskImportance, setNewTaskImportance] = useState<"Low" | "Medium" | "High">("Medium");
  const [newTaskDescription, setNewTaskDescription] = useState("");

  const [recsLoading, setRecsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock updating for precise deadline counts
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Save states to user-specific local storage
  useEffect(() => {
    if (isLoggedIn && userEmail && lastLoadedUserEmail.current === userEmail) {
      localStorage.setItem(`lifesaver_tasks_${userEmail}`, JSON.stringify(tasks));
    }
  }, [tasks, userEmail, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && userEmail && lastLoadedUserEmail.current === userEmail) {
      localStorage.setItem(`lifesaver_habits_${userEmail}`, JSON.stringify(habits));
    }
  }, [habits, userEmail, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && userEmail && lastLoadedUserEmail.current === userEmail) {
      localStorage.setItem(`lifesaver_events_${userEmail}`, JSON.stringify(calendarEvents));
    }
  }, [calendarEvents, userEmail, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && userEmail && lastLoadedUserEmail.current === userEmail) {
      localStorage.setItem(`lifesaver_recs_${userEmail}`, JSON.stringify(recommendations));
    }
  }, [recommendations, userEmail, isLoggedIn]);

  // Save logged in state to local storage
  useEffect(() => {
    localStorage.setItem("lifesaver_logged_in", isLoggedIn ? "true" : "false");
    localStorage.setItem("lifesaver_user_email", userEmail);
  }, [isLoggedIn, userEmail]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setLoginError("Please enter a valid email address.");
      return;
    }
    if (loginPassword.length < 4) {
      setLoginError("Password must be at least 4 characters.");
      return;
    }
    setLoginLoading(true);
    setLoginError("");

    setTimeout(() => {
      // Find user
      const foundUser = registeredUsers.find(
        (u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase() && u.password === loginPassword
      );

      if (foundUser || (loginEmail.trim().toLowerCase() === "admin@crisisdiffuser.ai" && loginPassword === "password")) {
        setIsLoggedIn(true);
        setUserEmail(loginEmail.trim().toLowerCase());
        setLoginLoading(false);
        setActiveTab("overview");
      } else {
        setLoginError("Invalid email or password. Feel free to use the 'Create Account' link below to register a new account instantly!");
        setLoginLoading(false);
      }
    }, 850);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim()) {
      setLoginError("Please enter your name.");
      return;
    }
    if (!loginEmail.trim()) {
      setLoginError("Please enter a valid email address.");
      return;
    }
    if (loginPassword.length < 4) {
      setLoginError("Password must be at least 4 characters.");
      return;
    }
    if (loginPassword !== signupConfirmPassword) {
      setLoginError("Passwords do not match.");
      return;
    }

    // Check if user already exists
    const exists = registeredUsers.some(
      (u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase()
    );
    if (exists || loginEmail.trim().toLowerCase() === "admin@crisisdiffuser.ai") {
      setLoginError("An account with this email address already exists.");
      return;
    }

    setLoginLoading(true);
    setLoginError("");

    setTimeout(() => {
      const newUser = {
        name: signupName.trim(),
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
      };
      setRegisteredUsers((prev) => [...prev, newUser]);
      setIsLoggedIn(true);
      setUserEmail(loginEmail.trim().toLowerCase());
      setLoginLoading(false);
      setActiveTab("overview");
      // Reset signup fields
      setSignupName("");
      setSignupConfirmPassword("");
    }, 1000);
  };

  const handleToggleSoundscape = (type: string) => {
    if (activeSoundscape === type) {
      stopSynthSound();
      setActiveSoundscape(null);
    } else {
      startSynthSound(type);
      setActiveSoundscape(type);
      unlockBadge("badge-soundscape");
    }
  };

  const handleLogout = () => {
    stopSynthSound();
    setActiveSoundscape(null);
    setBreathingActive(false);
    setIsLoggedIn(false);
    setUserEmail("");
    setLoginEmail("");
    setLoginPassword("");
    setSignupName("");
    setSignupConfirmPassword("");
    setIsSignUp(false);
    setIsMobileMenuOpen(false);
  };

  const handleDemoLogin = () => {
    setLoginEmail("admin@crisisdiffuser.ai");
    setLoginPassword("password");
    setLoginLoading(true);
    setLoginError("");
    setIsSignUp(false);

    setTimeout(() => {
      setIsLoggedIn(true);
      setUserEmail("admin@crisisdiffuser.ai");
      setLoginLoading(false);
      setActiveTab("overview");
    }, 600);
  };

  const handleBadgeClick = (id: string) => {
    if (id === "badge-tuner") {
      const el = document.getElementById("panic-meter-card");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else if (id === "badge-simulator") {
      setShowSimulator(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (id === "badge-soundscape") {
      setActiveTab("timer");
      setTimeout(() => {
        const el = document.getElementById("soundscapes-card");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else if (id === "badge-task") {
      setActiveTab("deadlines");
    } else if (id === "badge-streak") {
      setActiveTab("habits");
    }
  };

  const handleTriggerScenario = (scenario: string) => {
    // Award badge for simulator pilot!
    unlockBadge("badge-simulator");

    if (scenario === "night_before") {
      setPanicLevel(5); // Meltdown!
      
      const urgentTask: Task = {
        id: "task-project-pitch",
        title: "🚀 FINAL PROJECT DELIVERABLE SUBMISSION",
        deadline: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours left!
        importance: "High",
        description: "Package the production build, upload the submission ZIP, compile the slide deck, and write up the ultimate pitch details. There are only three hours left on the official project timer!",
        completed: false,
        priorityScore: 98,
        survivalTier: "CRITICAL",
        mitigationTip: "Take one deep breath. We generated a low-friction action plan below. Put your phone on silent and start with a 5-minute draft outline.",
        breakdown: [
          {
            title: "Open slide deck template & fill 3 basic headings",
            duration: 10,
            tip: "Do not write body paragraphs. Just label slide 1: Problem, slide 2: Solution, slide 3: Demo."
          },
          {
            title: "Zip the project directory and name correctly",
            duration: 10,
            tip: "Get the submission file ready immediately. This eliminates the last-minute upload anxiety."
          },
          {
            title: "Draft a 150-word text summary of the app capabilities",
            duration: 15,
            tip: "Keep it simple and objective. Highlight the 4 innovative system modules added."
          },
          {
            title: "Record a quick 2-minute video run-through",
            duration: 20,
            tip: "Don't edit it. A simple raw walkthrough is highly authentic and prized by evaluators."
          }
        ],
        timeBlocks: [
          {
            blockName: "Session Block 1: Slide Layout",
            durationMinutes: 20,
            breakMinutes: 5,
            focusArea: "Create the slide structure and fill the basic outlines."
          },
          {
            blockName: "Session Block 2: Packaging Assets",
            durationMinutes: 25,
            breakMinutes: 10,
            focusArea: "Perform a production build and test the submission ZIP."
          }
        ],
        extensionTemplate: `Subject: Request for Urgent Submission Grace Period\n\nDear Project Reviewers,\n\nI hope you are doing well.\n\nOur team has successfully compiled our system 'CrisisDiffuser AI' and successfully deployed the preview. Due to a small local container port adjustment at the absolute last minute, we are running our final checks.\n\nCould we please request a brief 15-minute submission grace window in case of any network bandwidth bottleneck? We appreciate your helpful support!\n\nBest regards,\n[Your Name]`
      };

      setTasks((prev) => {
        const filtered = prev.filter(t => t.id !== "task-project-pitch");
        return [urgentTask, ...filtered];
      });
      setSelectedTaskId("task-project-pitch");

      setRecommendations([
        {
          type: "CRISIS",
          title: "Critical Deadline: Project Submission",
          description: "This is a Code Red crisis. The Action Plan has been prepared with immediate low-friction tasks. Click to launch now.",
          actionLabel: "Launch Priority Breakdown"
        },
        {
          type: "STRATEGY",
          title: "Soundscapes Recommended",
          description: "Severe anxiety detected. Open the focus timer and enable the 'Synthesized Rainfall' to block out adrenaline jitter.",
          actionLabel: "Open Focus Soundscapes"
        }
      ]);
      setActiveTab("deadlines");
    } else if (scenario === "pivot_crisis") {
      setPanicLevel(4); // Severe Panic

      const pivotTask: Task = {
        id: "task-pivot-crisis",
        title: "⚠️ EMERGENCY PROJECT PIVOT: Port Backend to Python",
        deadline: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(), // 10 hours left!
        importance: "High",
        description: "The API endpoint has changed and we need to rebuild the main server file to direct traffic into the newly provisioned microservice.",
        completed: false,
        priorityScore: 89,
        survivalTier: "HIGH RISK",
        mitigationTip: "Take a glass of water. Break the codebase pivot into tiny file modifications instead of staring at compile logs.",
        breakdown: [
          {
            title: "Create local server.py outline file",
            duration: 10,
            tip: "Just type out 'import flask' and define a basic route to prevent the blank file freeze."
          },
          {
            title: "Expose basic JSON check endpoint",
            duration: 15,
            tip: "Keep it simple. Return a mock dictionary. Confirm your local router captures this."
          }
        ]
      };

      setTasks((prev) => {
        const filtered = prev.filter(t => t.id !== "task-pivot-crisis");
        return [pivotTask, ...filtered];
      });
      setSelectedTaskId("task-pivot-crisis");

      setRecommendations([
        {
          type: "STRATEGY",
          title: "Draft Pivot Extension Template",
          description: "This is a massive scope shift. We have compiled a professional extension draft in the task card detail view.",
          actionLabel: "View Extension Template"
        }
      ]);
      setActiveTab("deadlines");
    } else if (scenario === "burnout") {
      setPanicLevel(2); // Mild stress

      const burnoutHabit: Habit = {
        id: "habit-burnout-recovery",
        name: "🧘 Take a 3-minute physical spine alignment",
        streak: 12,
        lastCompletedDate: null
      };

      setHabits((prev) => {
        const filtered = prev.filter(h => h.id !== "habit-burnout-recovery");
        return [burnoutHabit, ...filtered];
      });

      setRecommendations([
        {
          type: "MOTIVATION",
          title: "Avoid Cognitive Burnout",
          description: "You have been coding for hours without breaks. Go to the Streak Saver and complete your 3-minute physical posture check now.",
          actionLabel: "Trigger Streak Alternative"
        }
      ]);
      setActiveTab("habits");
    } else if (scenario === "reset") {
      setPanicLevel(3);
      const email = userEmail || "admin@crisisdiffuser.ai";
      setTasks(getUserTasks(email));
      setHabits(getUserHabits(email));
      setCalendarEvents(getUserCalendarEvents(email));
      setRecommendations(getUserRecommendations(email));
      setActiveTab("overview");
    }
  };

  // Calculate dynamic hours left
  const getHoursLeft = (deadlineStr: string) => {
    const diff = new Date(deadlineStr).getTime() - currentTime.getTime();
    return diff / (1000 * 60 * 60);
  };

  // Add Task handler
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskDeadline) return;

    const newTask: Task = {
      id: "task-" + Date.now(),
      title: newTaskTitle.trim(),
      deadline: new Date(newTaskDeadline).toISOString(),
      importance: newTaskImportance,
      description: newTaskDescription.trim(),
      completed: false,
    };

    setTasks((prev) => [newTask, ...prev]);
    setSelectedTaskId(newTask.id);

    // Reset Form
    setNewTaskTitle("");
    setNewTaskDeadline("");
    setNewTaskImportance("Medium");
    setNewTaskDescription("");
    setIsAddingTask(false);
  };

  // Complete task handler
  const handleToggleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  // Delete task handler
  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTaskId === id) setSelectedTaskId(null);
  };

  // Trigger server-side AI analysis for task
  const handleAnalyzeTaskAI = async (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, analyzing: true, error: undefined } : t))
    );

    const taskToAnalyze = tasks.find((t) => t.id === id);
    if (!taskToAnalyze) return;

    try {
      const hoursLeft = getHoursLeft(taskToAnalyze.deadline);

      const res = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskToAnalyze.title,
          deadline: taskToAnalyze.deadline,
          description: taskToAnalyze.description,
          importance: taskToAnalyze.importance,
          hoursLeft: Math.round(hoursLeft),
        }),
      });

      if (!res.ok) {
        throw new Error("AI Coach failed to build the Focus breakdown. Please try again.");
      }

      const analyzedData = await res.json();

      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                analyzing: false,
                priorityScore: analyzedData.priorityScore,
                survivalTier: analyzedData.survivalTier,
                breakdown: analyzedData.breakdown.map((b: any) => ({ ...b, completed: false })),
                extensionTemplate: analyzedData.extensionTemplate,
                mitigationTip: analyzedData.mitigationTip,
                timeBlocks: analyzedData.timeBlocks,
              }
            : t
        )
      );
    } catch (error: any) {
      console.error(error);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, analyzing: false, error: error.message || "Failed to analyze." } : t
        )
      );
    }
  };

  // Step check off inside task details
  const handleToggleStepComplete = (taskId: string, stepIdx: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && t.breakdown) {
          const updatedBreakdown = [...t.breakdown];
          updatedBreakdown[stepIdx] = {
            ...updatedBreakdown[stepIdx],
            completed: !updatedBreakdown[stepIdx].completed,
          };
          return { ...t, breakdown: updatedBreakdown };
        }
        return t;
      })
    );
  };

  // Launch focus timer for a specific checklist step
  const handleStartFocusTimer = (step: TaskStep) => {
    setActiveTimerStep(step);
    setActiveTab("timer");
    // Scroll to focus timer dynamically
    setTimeout(() => {
      const el = document.getElementById("action-timer-card");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleFocusTimerComplete = () => {
    if (activeTimerStep) {
      // Find step in active selected task and mark complete
      if (selectedTaskId) {
        const activeTask = tasks.find((t) => t.id === selectedTaskId);
        if (activeTask && activeTask.breakdown) {
          const idx = activeTask.breakdown.findIndex((b) => b.title === activeTimerStep.title);
          if (idx !== -1) {
            handleToggleStepComplete(selectedTaskId, idx);
          }
        }
      }
      alert(`Well done! Focus Block completed for: "${activeTimerStep.title}". Take a short break!`);
      setActiveTimerStep(null);
    }
  };

  // Habits management
  const handleAddHabit = (name: string) => {
    const newHabit: Habit = {
      id: "habit-" + Date.now(),
      name,
      streak: 0,
      lastCompletedDate: null,
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const handleDeleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const handleCompleteHabit = (id: string, isAlternative: boolean) => {
    const todayStr = new Date().toISOString().split("T")[0];
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          // Increment streak if last completed was yesterday, or maintain if already done
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          let newStreak = h.streak;
          if (h.lastCompletedDate === yesterdayStr || h.lastCompletedDate === null) {
            newStreak = h.streak + 1;
          }

          return {
            ...h,
            streak: newStreak,
            lastCompletedDate: todayStr,
            savedToday: isAlternative,
            saverAlternative: isAlternative ? h.saverAlternative : null,
          };
        }
        return h;
      })
    );
  };

  // Call API for AI Habit Streak Save
  const handleSaveStreakAI = async (id: string) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, saving: true } : h))
    );

    try {
      // Calculate remaining hours left in day
      const now = new Date();
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const diffHours = (endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60);

      const res = await fetch("/api/gemini/streak-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitName: habit.name,
          currentStreak: habit.streak,
          timeRemainingHours: Math.round(diffHours),
        }),
      });

      if (!res.ok) {
        throw new Error("Unable to contact streak savior. Try standard done button!");
      }

      const data = await res.json();

      setHabits((prev) =>
        prev.map((h) =>
          h.id === id
            ? {
                ...h,
                saving: false,
                saverAlternative: data.alternativeHabit,
                saverSlogan: data.slogan,
                saverBenefit: data.benefit,
              }
            : h
        )
      );
    } catch (err) {
      console.error(err);
      setHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, saving: false } : h))
      );
      alert("Failed to compute alternative. Complete the regular habit if possible!");
    }
  };

  // Calendar Event handlers
  const handleAddCalendarEvent = (event: CalendarEvent) => {
    setCalendarEvents((prev) => [event, ...prev]);
  };

  const handleDeleteCalendarEvent = (id: string) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleToggleCalendarEventComplete = (id: string) => {
    setCalendarEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e))
    );
  };

  // AI Auto-Scheduling Algorithm
  const handleAutoSchedule = () => {
    // Find active uncompleted tasks that have AI timeBlocks
    const activeAnalyzedTasks = tasks.filter((t) => !t.completed && t.timeBlocks && t.timeBlocks.length > 0);

    if (activeAnalyzedTasks.length === 0) {
      alert("No prepared tasks found! Tap 'Prepare Action Plan' on a task first to get recommended blocks.");
      return;
    }

    const newEvents: CalendarEvent[] = [];
    let scheduleCursor = new Date();
    // Round to next 15 minutes
    const minutes = scheduleCursor.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 15) * 15;
    scheduleCursor.setMinutes(roundedMinutes);
    scheduleCursor.setSeconds(0);
    scheduleCursor.setMilliseconds(0);

    activeAnalyzedTasks.forEach((task) => {
      if (task.timeBlocks) {
        task.timeBlocks.forEach((block) => {
          const start = new Date(scheduleCursor.getTime());
          const end = new Date(start.getTime() + block.durationMinutes * 60 * 1000);

          newEvents.push({
            id: `event-auto-${Date.now()}-${Math.random()}`,
            title: `${task.title}: ${block.focusArea}`,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            taskId: task.id,
            completed: false,
          });

          // Advance cursor by focus duration + break duration
          scheduleCursor = new Date(end.getTime() + block.breakMinutes * 60 * 1000);
        });
      }
    });

    setCalendarEvents((prev) => [...newEvents, ...prev]);
    alert(`AI Auto-Schedule successful! Distributed ${newEvents.length} focus sessions and strategic breaks starting now.`);
  };

  // Recommendations refreshing
  const handleRefreshRecommendations = async () => {
    setRecsLoading(true);
    try {
      const activeTasksSummary = tasks.map((t) => ({
        title: t.title,
        deadline: t.deadline,
        importance: t.importance,
        completed: t.completed,
        survivalTier: t.survivalTier || "NORMAL",
      }));

      const activeHabitsSummary = habits.map((h) => ({
        name: h.name,
        streak: h.streak,
        completedToday: h.lastCompletedDate === new Date().toISOString().split("T")[0],
      }));

      const res = await fetch("/api/gemini/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: activeTasksSummary,
          habits: activeHabitsSummary,
        }),
      });

      if (!res.ok) {
        throw new Error("Strategist fell offline. Try again soon!");
      }

      const data = await res.json();
      if (data.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRecsLoading(false);
    }
  };

  const handleApplyRecommendationAction = (label: string) => {
    const lowerLabel = label.toLowerCase();

    if (lowerLabel.includes("schedule")) {
      handleAutoSchedule();
      setActiveTab("calendar");
      setTimeout(() => {
        const el = document.getElementById("calendar-schedule-card");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
    } else if (lowerLabel.includes("soundscape") || lowerLabel.includes("timer") || lowerLabel.includes("rainfall") || lowerLabel.includes("audio") || lowerLabel.includes("music")) {
      setActiveTab("timer");
      setTimeout(() => {
        const el = document.getElementById("soundscapes-card") || document.getElementById("action-timer-card");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
    } else if (lowerLabel.includes("streak") || lowerLabel.includes("alternative") || lowerLabel.includes("habit") || lowerLabel.includes("posture") || lowerLabel.includes("alignment") || lowerLabel.includes("burnout")) {
      setActiveTab("habits");
      setTimeout(() => {
        const el = document.getElementById("streak-saver-card");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
    } else if (lowerLabel.includes("template") || lowerLabel.includes("extension") || lowerLabel.includes("reschedule") || lowerLabel.includes("grace") || lowerLabel.includes("letter")) {
      setActiveTab("deadlines");
      if (tasks.length > 0) {
        const taskWithTemplate = tasks.find((t) => t.id === "task-pivot-crisis") || tasks.find((t) => t.id === "task-project-pitch") || tasks.find((t) => t.extensionTemplate);
        if (taskWithTemplate) {
          setSelectedTaskId(taskWithTemplate.id);
        } else {
          // select first one
          setSelectedTaskId(tasks[0].id);
        }
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (lowerLabel.includes("breakdown") || lowerLabel.includes("launch") || lowerLabel.includes("unlock") || lowerLabel.includes("plan") || lowerLabel.includes("task") || lowerLabel.includes("pitch")) {
      setActiveTab("deadlines");
      if (tasks.length > 0) {
        const targetTask = tasks.find((t) => t.id === "task-project-pitch") || tasks.find((t) => t.id === "task-pivot-crisis") || tasks[0];
        if (targetTask) {
          setSelectedTaskId(targetTask.id);
        }
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // General match based on other words
      setActiveTab("deadlines");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Find selected task object
  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  // Stats calculators
  const pendingDeadlinesCount = tasks.filter((t) => !t.completed).length;
  const overdueCrisesCount = tasks.filter((t) => !t.completed && getHoursLeft(t.deadline) < 0).length;
  const highestStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0;
  const pendingEventsCount = calendarEvents.filter((e) => !e.completed).length;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#070A13] flex items-center justify-center p-4 relative overflow-hidden font-sans antialiased selection:bg-emerald-500/20 selection:text-emerald-400">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#0c1222]/90 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl relative backdrop-blur-md"
          id="login-card"
        >
          {/* Logo Brand */}
          <div className="text-center mb-8">
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl p-3 inline-block mb-4">
              {isSignUp ? (
                <UserPlus className="w-8 h-8 fill-emerald-500/5 animate-pulse" />
              ) : (
                <AlertOctagon className="w-8 h-8 fill-emerald-500/5 animate-pulse" />
              )}
            </div>
            <span className="block text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
              AI-Powered Deadline Recovery Engine
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight font-sans mt-1">
              {isSignUp ? "Create Account" : "CrisisDiffuser AI"}
            </h1>
            <p className="text-xs text-slate-400 mt-2">
              {isSignUp
                ? "Join the system to construct instant tactical micro-plans and preserve streaks under pressure."
                : "The professional companion to survive tight deadlines, build micro-breakdowns, and save streaks under pressure."}
            </p>
          </div>

          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
            {loginError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl p-3 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            {isSignUp && (
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full bg-[#111827]/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="e.g. professional@domain.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-[#111827]/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Access Password
                </label>
                {!isSignUp && (
                  <span className="text-[10px] text-emerald-400 cursor-pointer hover:underline" onClick={handleDemoLogin}>
                    Forgot Password?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#111827]/80 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    className="w-full bg-[#111827]/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>{isSignUp ? "Registering account..." : "Configuring Session Desk..."}</span>
                </>
              ) : (
                <span>{isSignUp ? "Create System Account" : "Sign In to System"}</span>
              )}
            </button>
          </form>

          {/* Toggle Button */}
          <div className="text-center mt-5">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setLoginError("");
              }}
              className="text-xs text-slate-400 hover:text-emerald-400 transition-colors font-medium underline underline-offset-4"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Create Account"}
            </button>
          </div>

          {/* Demo Credentials Divider */}
          <div className="relative my-6 text-center">
            <hr className="border-slate-800" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0c1222] px-3 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Preview Mode
            </span>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-medium rounded-xl text-xs transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fill Demo Credentials & Login</span>
            </button>
            <p className="text-[10px] text-slate-500 text-center font-mono">
              Demo bypass: admin@crisisdiffuser.ai / password
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A13] text-slate-100 font-sans antialiased flex flex-col md:flex-row" id="applet-root">
      
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 bg-[#090e1b] border-r border-slate-900 shrink-0 sticky top-0 h-screen z-30">
        <div className="p-6 border-b border-slate-900 flex items-center gap-2.5">
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-1.5 shrink-0">
            <AlertOctagon className="w-4 h-4 fill-emerald-500/5" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-white tracking-widest uppercase">
              CrisisDiffuser AI
            </h1>
            <span className="text-[9px] font-mono font-medium text-emerald-400 tracking-wider">
              SYSTEM ONLINE
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === "overview"
                ? "bg-slate-800/60 border-l-2 border-emerald-500 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-900/40"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>System Dashboard</span>
            </div>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeTab === "overview" ? "rotate-90 text-white" : "text-slate-600"}`} />
          </button>

          <button
            onClick={() => setActiveTab("deadlines")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === "deadlines"
                ? "bg-slate-800/60 border-l-2 border-emerald-500 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-900/40"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BellRing className="w-4 h-4 shrink-0" />
              <span>Urgent Deadlines</span>
            </div>
            {pendingDeadlinesCount > 0 && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${overdueCrisesCount > 0 ? "bg-rose-500/20 text-rose-400 border border-rose-500/20" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"}`}>
                {pendingDeadlinesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("timer")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === "timer"
                ? "bg-slate-800/60 border-l-2 border-emerald-500 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-900/40"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Timer className="w-4 h-4 shrink-0" />
              <span>Focus Action Timer</span>
            </div>
            {activeTimerStep && (
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("calendar")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === "calendar"
                ? "bg-slate-800/60 border-l-2 border-emerald-500 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-900/40"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CalendarCheck className="w-4 h-4 shrink-0" />
              <span>Tactical Planner</span>
            </div>
            {pendingEventsCount > 0 && (
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded">
                {pendingEventsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("habits")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === "habits"
                ? "bg-slate-800/60 border-l-2 border-emerald-500 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-900/40"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Flame className="w-4 h-4 shrink-0" />
              <span>Streak Saver</span>
            </div>
            {highestStreak > 0 && (
              <span className="text-[10px] bg-amber-500/15 border border-amber-500/20 text-amber-400 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Flame className="w-3 h-3 fill-amber-400" />
                {highestStreak}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("ai")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === "ai"
                ? "bg-slate-800/60 border-l-2 border-emerald-500 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-900/40"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>AI Strategist Feed</span>
            </div>
            {recommendations.length > 0 && (
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("support")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === "support"
                ? "bg-slate-800/60 border-l-2 border-emerald-500 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-900/40"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Distress Support</span>
            </div>
          </button>
        </nav>

        {/* Sidebar Footer User Profile */}
        <div className="p-4 border-t border-slate-900">
          <div className="bg-[#0c1222]/80 border border-slate-850 p-3 rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs text-emerald-400 border border-slate-700">
                <User className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold text-white truncate">{userEmail}</p>
                <p className="text-[9px] font-mono text-slate-500">Active Operator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full py-1.5 border border-slate-800 hover:bg-rose-500/10 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Desk Session</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER & MENU */}
      <div className="md:hidden flex flex-col bg-[#090e1b] border-b border-slate-900 sticky top-0 z-40 w-full">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg p-1.5">
              <AlertOctagon className="w-4 h-4 fill-emerald-500/5" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-white tracking-widest uppercase">
                CrisisDiffuser
              </h1>
              <span className="text-[8px] font-mono text-slate-400 block">
                Survival Clock: {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Collapsible Mobile Navigation menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-slate-900 bg-[#090e1b] px-4 py-4 space-y-1"
            >
              {[
                { tab: "overview", label: "Dashboard", icon: LayoutDashboard },
                { tab: "deadlines", label: `Urgent Deadlines (${pendingDeadlinesCount})`, icon: BellRing },
                { tab: "timer", label: "Focus Action Timer", icon: Timer },
                { tab: "calendar", label: "Tactical Planner", icon: CalendarCheck },
                { tab: "habits", label: "Streak Saver", icon: Flame },
                { tab: "ai", label: "AI Strategist Feed", icon: Sparkles },
                { tab: "support", label: "Distress Support", icon: ShieldAlert },
              ].map(({ tab, label, icon: Icon }) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    activeTab === tab
                      ? "bg-slate-800 text-emerald-400"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                </button>
              ))}

              <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">{userEmail}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs text-rose-400 font-bold hover:underline"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Exit Session</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CORE WORKSPACE / CONTENT PANEL */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* Top bar on desktop displaying active timer quick feedback and system status */}
        <header className="hidden md:flex h-16 border-b border-slate-900 bg-[#070a13]/40 backdrop-blur-md px-8 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">
              Selected Desk view: <span className="text-white font-bold">{activeTab.toUpperCase()}</span>
            </span>
            {activeTimerStep && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] px-3 py-1 rounded-full font-mono animate-pulse">
                <Timer className="w-3.5 h-3.5 animate-spin" />
                <span>Timer Running: "{activeTimerStep.title}"</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* 🏆 Sandbox Trigger Button for Demonstration & Review */}
            <button
              onClick={() => {
                setShowSimulator(!showSimulator);
                unlockBadge("badge-simulator");
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 border border-purple-500/40 hover:border-purple-400 px-3.5 py-1.5 rounded-full text-purple-300 hover:text-white font-mono text-[10px] transition-all font-semibold shadow-md active:scale-95"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>🕹️ Operator Demo Sandbox</span>
            </button>

            <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-full text-slate-400 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping inline-block" />
              <span>Survival System Active • {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
        </header>

        {/* Demo Simulator Banner/Panel */}
        <AnimatePresence>
          {showSimulator && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#090b14] border-b border-purple-900/40 overflow-hidden relative z-35"
            >
              <div className="p-6 px-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span className="tracking-wider text-purple-200">DEMO OPERATOR SANDBOX & CRITICAL CRISIS SIMULATOR</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-2xl leading-relaxed">
                      Evaluators and reviewers have limited time! Use this simulator to inject pre-configured crisis scenarios. Instantly see how our AI system prioritizes tasks, synthesizes soundscapes, maps focus timers, and mitigates severe cognitive burnout.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSimulator(false)}
                    className="p-1 px-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-400 hover:text-white rounded-lg text-[10px] font-mono transition-colors"
                  >
                    Close Simulator
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  <button
                    onClick={() => handleTriggerScenario("night_before")}
                    className="bg-[#110e20]/90 hover:bg-[#1a1435] border border-purple-500/25 hover:border-purple-400/50 p-4 rounded-xl text-left transition-all duration-200 active:scale-95 group"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Zap className="w-4 h-4 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform animate-pulse" />
                      <span className="text-xs font-bold text-purple-200 uppercase tracking-wide">Night-Before Panic</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Injects a 3-hour submission deadline, locks panic level to meltdown, and maps a low-friction breakdown.
                    </p>
                  </button>

                  <button
                    onClick={() => handleTriggerScenario("pivot_crisis")}
                    className="bg-[#110e20]/90 hover:bg-[#1a1435] border border-purple-500/25 hover:border-purple-400/50 p-4 rounded-xl text-left transition-all duration-200 active:scale-95 group"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Sliders className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-purple-200 uppercase tracking-wide">Complete Pivot Crisis</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Simulates requirements change 10 hours before deadline, populates extension draft, and raises stress level.
                    </p>
                  </button>

                  <button
                    onClick={() => handleTriggerScenario("burnout")}
                    className="bg-[#110e20]/90 hover:bg-[#1a1435] border border-purple-500/25 hover:border-purple-400/50 p-4 rounded-xl text-left transition-all duration-200 active:scale-95 group"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Activity className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-purple-200 uppercase tracking-wide">Burnout & Fatigue Block</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Injects fatigue alert recommending Streak Saver posture habit, keeping the streak alive with 3 mins effort.
                    </p>
                  </button>

                  <button
                    onClick={() => handleTriggerScenario("reset")}
                    className="bg-slate-900/40 hover:bg-slate-900 border border-slate-800 p-4 rounded-xl text-left transition-all duration-200 active:scale-95 text-slate-300"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <RotateCcw className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Reset Demo State</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Clears injected crisis tasks, resets panic scores, and returns to standard operator sandbox demo values.
                    </p>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content switch board */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              
              {/* TAB 1: SYSTEM OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Greeting Block */}
                  <div className="bg-gradient-to-r from-[#0c1222] to-[#070a13] border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div>
                      <h2 className="text-xl font-bold text-white font-sans tracking-tight">
                        Hello, {userEmail.split("@")[0]}! Welcome to Crisis Control.
                      </h2>
                      <p className="text-xs text-slate-400 mt-1 max-w-xl">
                        A proactive environment designed to mitigate extreme academic and professional deadline pressures. Navigate to each specialized panel using the navigation bar to configure priorities.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveTab("deadlines")}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-colors"
                      >
                        Launch Deadlines Desk
                      </button>
                    </div>
                  </div>

                  {/* Interactive Panic Meter Card */}
                  <div className="bg-[#0e1424]/90 border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden shadow-lg" id="panic-meter-card">
                    {/* Pulsing indicator glow based on panicLevel */}
                    <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-500 opacity-20 ${
                      panicLevel === 1 ? "bg-emerald-500" :
                      panicLevel === 2 ? "bg-cyan-500" :
                      panicLevel === 3 ? "bg-amber-500" :
                      panicLevel === 4 ? "bg-orange-500 animate-pulse" :
                      "bg-rose-500 animate-pulse"
                    }`} />

                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Sliders className={`w-4 h-4 ${
                            panicLevel === 1 ? "text-emerald-400" :
                            panicLevel === 2 ? "text-cyan-400" :
                            panicLevel === 3 ? "text-amber-400" :
                            panicLevel === 4 ? "text-orange-400" :
                            "text-rose-500"
                          }`} />
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Dynamic Panic & Anxiety Tuner</h3>
                        </div>
                        <p className="text-xs text-slate-400 max-w-xl">
                          Toggle your current real-time physiological stress state. Our system adapts recommended priorities, layouts, and mitigations immediately.
                        </p>
                      </div>

                      {/* Interactive Level Slider */}
                      <div className="w-full lg:w-72 space-y-2">
                        <div className="flex justify-between text-[11px] font-mono text-slate-400">
                          <span>CALM</span>
                          <span>ELEVATED</span>
                          <span className="text-rose-400 font-bold">MELTDOWN</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={panicLevel}
                          onChange={(e) => {
                            setPanicLevel(Number(e.target.value));
                            unlockBadge("badge-tuner");
                          }}
                          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 transition-all duration-300"
                        />
                        <div className="flex justify-between items-center bg-slate-950/60 border border-slate-850 px-3 py-1.5 rounded-xl">
                          <span className="text-[10px] font-mono text-slate-500">STATE STATUS:</span>
                          <span className={`text-[11px] font-bold uppercase tracking-widest font-mono ${
                            panicLevel === 1 ? "text-emerald-400" :
                            panicLevel === 2 ? "text-cyan-400" :
                            panicLevel === 3 ? "text-amber-400" :
                            panicLevel === 4 ? "text-orange-400 animate-pulse" :
                            "text-rose-500 animate-pulse font-extrabold"
                          }`}>
                            {panicLevel === 1 && "Deep Calm / Creative Focus"}
                            {panicLevel === 2 && "Mild Stress / Routine Flow"}
                            {panicLevel === 3 && "Elevated Anxiety / Warning"}
                            {panicLevel === 4 && "Severe Procrastination Freeze"}
                            {panicLevel === 5 && "CODE RED MELTDOWN"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Adaptive Emergency Advice Box */}
                    <div className="mt-4 p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        <Activity className={`w-4 h-4 ${
                          panicLevel <= 2 ? "text-emerald-400" :
                          panicLevel === 3 ? "text-amber-400" :
                          "text-rose-400 animate-pulse"
                        }`} />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Adaptive Assistant Intervention</span>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {panicLevel === 1 && "System load normal. Continue your long-term creative planning and complete tactical streak habits to stay consistent."}
                          {panicLevel === 2 && "Elevate your routine and focus. Review tomorrow's event blocks in your Tactical Planner and commit to a single 25-minute block."}
                          {panicLevel === 3 && "Minor cortisol spike detected. We highly recommend launching the 'Focus Action Timer' and enabling a light rain soundscape."}
                          {panicLevel === 4 && "Mental freeze active. Avoid staring at the overall list. Open your highest score task, click 'Generate Action Plan' and focus ONLY on step #1."}
                          {panicLevel === 5 && "CRITICAL CRISIS DETECTED. Execute a 3-minute physical spine alignment, click Distress Hotline, and trigger a respectful deadline postponement template."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* High level stats metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#0e1424]/80 border border-slate-800/60 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Crises Logged</span>
                        <p className="text-2xl font-bold text-white mt-1">{tasks.length}</p>
                      </div>
                      <div className="bg-slate-800 p-2.5 rounded-lg text-slate-400">
                        <BellRing className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="bg-[#0e1424]/80 border border-slate-800/60 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400">Overdue / Delayed</span>
                        <p className="text-2xl font-bold text-rose-400 mt-1">{overdueCrisesCount}</p>
                      </div>
                      <div className="bg-rose-950/20 border border-rose-900/30 p-2.5 rounded-lg text-rose-400">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="bg-[#0e1424]/80 border border-slate-800/60 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">Max Habits Streak</span>
                        <p className="text-2xl font-bold text-amber-400 mt-1">{highestStreak} days</p>
                      </div>
                      <div className="bg-amber-950/20 border border-amber-900/30 p-2.5 rounded-lg text-amber-400">
                        <Flame className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="bg-[#0e1424]/80 border border-slate-800/60 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">Planner Event Slots</span>
                        <p className="text-2xl font-bold text-emerald-400 mt-1">{calendarEvents.length}</p>
                      </div>
                      <div className="bg-emerald-950/20 border border-emerald-900/30 p-2.5 rounded-lg text-emerald-400">
                        <CalendarCheck className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Carousel of dynamic recommendations and strategic shortcuts */}
                  <RecommendationsList
                    recommendations={recommendations}
                    loading={recsLoading}
                    onRefresh={handleRefreshRecommendations}
                    onApplyAction={handleApplyRecommendationAction}
                  />

                  {/* Combined High priority preview panel */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Active Urgent Deadlines Panel */}
                    <div className="bg-[#0e1424]/60 border border-slate-800/60 p-6 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <AlertOctagon className="w-4 h-4 text-emerald-400" />
                            <span>Urgent Priority Dispatch</span>
                          </h3>
                          <p className="text-[11px] text-slate-400">Log new deadlines or perform deep AI breakdowns instantly.</p>
                        </div>
                        <button
                          onClick={() => setActiveTab("deadlines")}
                          className="text-[10px] font-mono font-bold text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <span>Manage List</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {tasks.slice(0, 3).map((task) => (
                          <div
                            key={task.id}
                            className={`p-3.5 rounded-xl border flex items-center justify-between ${
                              task.completed
                                ? "bg-slate-950/30 border-slate-900/60 opacity-60"
                                : "bg-[#090e1b] border-slate-800/60"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => handleToggleTaskComplete(task.id)}
                                className="w-4 h-4 rounded border-slate-800 text-emerald-500 focus:ring-transparent focus:ring-offset-0 bg-slate-950 cursor-pointer"
                              />
                              <div>
                                <h4 className={`text-xs font-semibold ${task.completed ? "line-through text-slate-500" : "text-slate-200"}`}>
                                  {task.title}
                                </h4>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  Due: {new Date(task.deadline).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                                </p>
                              </div>
                            </div>
                            <div>
                              <button
                                onClick={() => {
                                  setSelectedTaskId(task.id);
                                  setActiveTab("deadlines");
                                }}
                                className="px-2.5 py-1 text-[10px] font-bold bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg transition-colors"
                              >
                                View Plan
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Timer Launcher */}
                    <div className="bg-[#0e1424]/60 border border-slate-800/60 p-6 rounded-2xl flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                          <Timer className="w-4 h-4 text-emerald-400" />
                          <span>Action Timer Widget</span>
                        </h3>
                        <p className="text-[11px] text-slate-400">Trigger standard focused work blocks to eliminate distractions immediately.</p>
                      </div>

                      {activeTimerStep ? (
                        <div className="mt-4 p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block">Active Session Block</span>
                            <span className="text-xs font-bold text-white">{activeTimerStep.title}</span>
                          </div>
                          <button
                            onClick={() => setActiveTab("timer")}
                            className="px-3.5 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-lg text-[10px]"
                          >
                            Maximize
                          </button>
                        </div>
                      ) : (
                        <div className="mt-4 p-4 border border-slate-800 bg-[#090e1b] rounded-xl text-center">
                          <Clock className="w-6 h-6 text-slate-500 mx-auto mb-2 animate-pulse" />
                          <span className="text-[11px] text-slate-300 block">No work block currently active.</span>
                          <button
                            onClick={() => setActiveTab("timer")}
                            className="mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-lg text-[10px]"
                          >
                            Open Timer Workspace
                          </button>
                        </div>
                      )}

                      <div className="mt-4 border-t border-slate-800/80 pt-4 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Standard Session: 25 mins</span>
                        <span>Micro breaks: 5 mins</span>
                      </div>
                    </div>
                  </div>

                  {/* Gamified Achievements cabinet */}
                  <div className="bg-[#0e1424]/80 border border-slate-800/60 p-6 rounded-2xl space-y-4 shadow-xl" id="achievements-card">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>Crisis Control Achievement Vault</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">Complete core resilience interactions to unlock elite productivity badges.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      {[
                        { id: "badge-tuner", title: "Stress Tuner", desc: "Interact with the Panic Meter", icon: Sliders, color: "from-cyan-500/20 to-teal-500/15 text-cyan-400 border-cyan-500/30 hover:border-cyan-400/50" },
                        { id: "badge-simulator", title: "Scenario Pilot", desc: "Inject a Sandbox crisis", icon: Trophy, color: "from-purple-500/20 to-indigo-500/15 text-purple-400 border-purple-500/30 hover:border-purple-400/50" },
                        { id: "badge-soundscape", title: "Zen Master", desc: "Activate a focus soundscape", icon: Volume2, color: "from-pink-500/20 to-rose-500/15 text-pink-400 border-pink-500/30 hover:border-pink-400/50" },
                        { id: "badge-task", title: "AI Alchemist", desc: "Trigger Gemini step division", icon: Sparkles, color: "from-yellow-500/20 to-amber-500/15 text-yellow-400 border-yellow-500/30 hover:border-yellow-400/50" },
                        { id: "badge-streak", title: "Habit Warrior", desc: "Maintain focus streaks", icon: Flame, color: "from-emerald-500/20 to-green-500/15 text-emerald-400 border-emerald-500/30 hover:border-emerald-400/50" },
                      ].map((badge) => {
                        const isUnlocked = unlockedBadges.includes(badge.id);
                        const Icon = badge.icon;
                        return (
                          <button
                            key={badge.id}
                            onClick={() => handleBadgeClick(badge.id)}
                            className={`border rounded-xl p-3 text-center transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-28 cursor-pointer text-left w-full active:scale-95 group ${
                              isUnlocked
                                ? `bg-gradient-to-b ${badge.color} scale-100 shadow-md`
                                : "bg-slate-950/45 border-slate-900/60 hover:border-slate-800 opacity-60 hover:opacity-90"
                            }`}
                          >
                            <div className="flex flex-col items-center justify-center gap-1.5 flex-1 w-full text-center">
                              <Icon className={`w-5 h-5 ${isUnlocked ? "text-white animate-pulse" : "text-slate-500 group-hover:text-slate-300 transition-colors"}`} />
                              <span className="text-[11px] font-bold block leading-tight text-white">{badge.title}</span>
                              <span className="text-[9px] text-slate-400 leading-tight block">{badge.desc}</span>
                            </div>
                            <div className="mt-1 w-full text-center">
                              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                                isUnlocked ? "bg-white/10 text-white font-semibold" : "bg-slate-900 text-slate-500 group-hover:text-slate-400"
                              }`}>
                                {isUnlocked ? "Unlocked 🔓" : "Click to view 🔍"}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DEADLINES DESK */}
              {activeTab === "deadlines" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Task Management Panel */}
                  <div className="lg:col-span-12 space-y-6">
                    <div className="bg-[#0e1424]/30 border border-slate-800/60 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                      <div className="flex items-center justify-between gap-4 mb-6">
                        <div>
                          <h2 className="text-base font-bold text-white flex items-center gap-2">
                            <BellRing className="w-4 h-4 text-emerald-400" />
                            <span>Urgent Deadline Desk</span>
                          </h2>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Your highest risk priorities. Check steps or trigger AI plans instantly.
                          </p>
                        </div>

                        <button
                          onClick={() => setIsAddingTask(!isAddingTask)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-all duration-200 active:scale-95 shadow-md shadow-emerald-950/10"
                          id="add-task-trigger-btn"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Log Crisis</span>
                        </button>
                      </div>

                      {/* Collapsible Add Task Form */}
                      <AnimatePresence>
                        {isAddingTask && (
                          <motion.form
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            onSubmit={handleAddTask}
                            className="bg-[#0b101f] border border-slate-800 p-5 rounded-xl mb-6 space-y-4 overflow-hidden"
                            id="new-task-form"
                          >
                            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Log Urgent Deadline</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="col-span-1 sm:col-span-2">
                                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Task Title *</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Physics Lab Report conclusion, Design export..."
                                  value={newTaskTitle}
                                  onChange={(e) => setNewTaskTitle(e.target.value)}
                                  className="w-full bg-[#111827]/80 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Target Deadline *</label>
                                <input
                                  type="datetime-local"
                                  value={newTaskDeadline}
                                  onChange={(e) => setNewTaskDeadline(e.target.value)}
                                  style={{ colorScheme: "dark" }}
                                  className="w-full bg-[#111827]/80 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 cursor-pointer hover:border-slate-700 transition-colors [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:transition-opacity"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Importance Weight</label>
                                <select
                                  value={newTaskImportance}
                                  onChange={(e) => setNewTaskImportance(e.target.value as any)}
                                  className="w-full bg-[#111827]/80 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                                >
                                  <option value="Low">Low Importance</option>
                                  <option value="Medium">Medium Importance</option>
                                  <option value="High">High Importance (Heavy weight)</option>
                                </select>
                              </div>

                              <div className="col-span-1 sm:col-span-2">
                                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Details & Context</label>
                                <textarea
                                  placeholder="Describe the bottlenecks or deliverables (helps AI construct custom micro-plans)..."
                                  value={newTaskDescription}
                                  onChange={(e) => setNewTaskDescription(e.target.value)}
                                  className="w-full bg-[#111827]/80 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 h-20 resize-none"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                              <button
                                type="button"
                                onClick={() => setIsAddingTask(false)}
                                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                              >
                                Dismiss
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-colors"
                              >
                                Lock Deadline
                              </button>
                            </div>
                          </motion.form>
                        )}
                      </AnimatePresence>

                      {/* Tasks List */}
                      <div className="space-y-4">
                        {tasks.length === 0 ? (
                          <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
                            <CheckCircle className="w-10 h-10 text-slate-600 mx-auto mb-3 animate-pulse" />
                            <h3 className="text-sm font-semibold text-white">All quiet on the deadline front!</h3>
                            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                              No crisis logged. Great job keeping ahead of schedule, or add an assignment to test drive.
                            </p>
                          </div>
                        ) : (
                          tasks.map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              isSelected={selectedTaskId === task.id}
                              onSelect={() => setSelectedTaskId(task.id)}
                              onToggleComplete={() => handleToggleTaskComplete(task.id)}
                              onDelete={() => handleDeleteTask(task.id)}
                              onAnalyzeAI={() => handleAnalyzeTaskAI(task.id)}
                              onToggleStepComplete={(idx) => handleToggleStepComplete(task.id, idx)}
                              onStartFocus={handleStartFocusTimer}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: FOCUS ACTION TIMER */}
              {activeTab === "timer" && (
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Column: Timer & Task Selector */}
                  <div className="md:col-span-7 space-y-6">
                    {/* Timer Workspace component */}
                    <ActionTimer
                      stepTitle={activeTimerStep ? activeTimerStep.title : "Strategic Focus Interval"}
                      defaultDurationMinutes={activeTimerStep ? activeTimerStep.duration : 25}
                      onComplete={handleFocusTimerComplete}
                    />

                    {/* Task context builder within timer */}
                    <div className="bg-[#0e1424]/80 border border-slate-800/60 p-6 rounded-2xl space-y-4 shadow-xl">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-400" />
                        <span>Select active countdown task context</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Linking a checklist step to the timer automatically checks it off upon success. Select an ongoing assignment with generated micro-steps:
                      </p>

                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {tasks.filter(t => !t.completed).length === 0 ? (
                          <div className="text-center py-6 text-xs text-slate-500">
                            No active deadline tasks. Go log an urgent priority.
                          </div>
                        ) : (
                          tasks.filter(t => !t.completed).map((task) => (
                            <div key={task.id} className="border border-slate-800/80 bg-slate-900/40 rounded-xl p-3">
                              <h4 className="text-xs font-bold text-white mb-2">{task.title}</h4>
                              
                              {task.breakdown && task.breakdown.length > 0 ? (
                                <div className="space-y-1.5 pl-3 border-l border-slate-800">
                                  {task.breakdown.map((step, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-[11px]">
                                      <span className={step.completed ? "line-through text-slate-500" : "text-slate-300"}>
                                        • {step.title} ({step.duration}m)
                                      </span>
                                      {!step.completed && (
                                        <button
                                          onClick={() => {
                                            setSelectedTaskId(task.id);
                                            handleStartFocusTimer(step);
                                          }}
                                          className="text-[10px] font-mono text-emerald-400 hover:underline"
                                        >
                                          Launch Block
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-slate-500">No step breakdown compiled.</span>
                                  <button
                                    onClick={() => {
                                      setSelectedTaskId(task.id);
                                      handleAnalyzeTaskAI(task.id);
                                      setActiveTab("deadlines");
                                    }}
                                    className="text-[10px] font-mono text-emerald-400 hover:underline"
                                  >
                                    Generate AI Steps
                                  </button>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Focus Soundscapes & Breathing Regulator */}
                  <div className="md:col-span-5 space-y-6">
                    {/* Immersive Soundscapes Card */}
                    <div className="bg-[#0e1424]/80 border border-slate-800/60 p-6 rounded-2xl space-y-4 shadow-xl" id="soundscapes-card">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Volume2 className="text-emerald-400 w-4 h-4" />
                          <span>Procedural Focus Soundscapes</span>
                        </h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Zero-bandwidth synthesized focus audio. Uses the Web Audio API to create real-time deep focus audio directly in your browser.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {[
                          { id: "binaural", title: "Alpha Binaural Beats", desc: "8Hz target frequency for cognitive organization & deep study", icon: Zap, activeColor: "bg-amber-500/10 border-amber-500/40 text-amber-300" },
                          { id: "brown", title: "Deep Brownian Waves", desc: "Low-frequency steady analog stream to eliminate ADHD focus friction", icon: Sliders, activeColor: "bg-indigo-500/10 border-indigo-500/40 text-indigo-300" },
                          { id: "rain", title: "Cosmic Rain showers", desc: "Procedural raindrops with white noise crackle filter", icon: Volume2, activeColor: "bg-pink-500/10 border-pink-500/40 text-pink-300" },
                        ].map((sound) => {
                          const isPlaying = activeSoundscape === sound.id;
                          return (
                            <button
                              key={sound.id}
                              onClick={() => handleToggleSoundscape(sound.id)}
                              className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group active:scale-98 ${
                                isPlaying
                                  ? sound.activeColor
                                  : "bg-[#090e1b] border-slate-800 hover:border-slate-750 text-slate-300"
                              }`}
                            >
                              <div className="space-y-0.5 max-w-[80%]">
                                <span className="text-xs font-bold block">{sound.title}</span>
                                <span className="text-[10px] text-slate-400 block leading-tight">{sound.desc}</span>
                              </div>
                              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 group-hover:text-white">
                                {isPlaying ? (
                                  <VolumeX className="w-4 h-4 text-rose-400" />
                                ) : (
                                  <Play className="w-4 h-4 text-emerald-400 fill-emerald-400/10" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Interactive Breathing Regulator Card */}
                    <div className="bg-[#0e1424]/80 border border-slate-800/60 p-6 rounded-2xl space-y-4 shadow-xl" id="breathing-card">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Activity className="text-emerald-400 w-4 h-4 animate-pulse" />
                          <span>Resilience Breathing Regulator</span>
                        </h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Stabilize rapid heartbeat or deadline panic cycles. Follow the animated box breathing visual cue below to restore full mental focus.
                        </p>
                      </div>

                      <div className="flex flex-col items-center justify-center p-4 border border-slate-850 bg-slate-950/40 rounded-xl relative overflow-hidden min-h-48">
                        {/* Dynamic pulsing breathing ring */}
                        <div className="relative w-32 h-32 flex items-center justify-center">
                          <AnimatePresence>
                            {breathingActive && (
                              <motion.div
                                animate={{
                                  scale: breathingPhase === "Breathe In" ? [1, 1.8] : breathingPhase === "Hold" ? 1.8 : [1.8, 1],
                                  opacity: breathingPhase === "Breathe In" ? [0.15, 0.45] : breathingPhase === "Hold" ? 0.45 : [0.45, 0.15]
                                }}
                                transition={{
                                  duration: 4,
                                  ease: "easeInOut",
                                  repeat: Infinity
                                }}
                                className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl pointer-events-none"
                              />
                            )}
                          </AnimatePresence>

                          <motion.div
                            animate={breathingActive ? {
                              scale: breathingPhase === "Breathe In" ? 1.4 : breathingPhase === "Hold" ? 1.4 : 1,
                              borderColor: breathingPhase === "Breathe In" ? "#10b981" : breathingPhase === "Hold" ? "#f59e0b" : "#3b82f6"
                            } : { scale: 1, borderColor: "#334155" }}
                            transition={{ duration: 4, ease: "easeInOut" }}
                            className="w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center text-center bg-[#070a13]"
                          >
                            <span className="text-xs font-bold text-white leading-none">
                              {breathingActive ? breathingPhase : "Idling"}
                            </span>
                            {breathingActive && (
                              <span className="text-[11px] font-mono text-slate-400 mt-1 block">
                                {breathingProgress}s
                              </span>
                            )}
                          </motion.div>
                        </div>

                        <button
                          onClick={() => {
                            setBreathingActive(!breathingActive);
                            unlockBadge("badge-soundscape");
                          }}
                          className={`mt-4 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                            breathingActive
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
                              : "bg-emerald-500 text-slate-950 hover:bg-emerald-600 active:scale-95 shadow-md"
                          }`}
                        >
                          {breathingActive ? "Stop Regulator" : "Start Box Breath Session"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: TACTICAL PLANNER */}
              {activeTab === "calendar" && (
                <div className="space-y-6">
                  <div className="bg-[#0e1424]/40 border border-slate-800/40 p-6 rounded-2xl">
                    <h3 className="text-base font-bold text-white mb-2">Tactical Focus Allocation</h3>
                    <p className="text-xs text-slate-400 mb-4">
                      Integrate high-intensity study blocks directly into your schedule. Check off slots as they are completed.
                    </p>
                  </div>
                  <CalendarSchedule
                    events={calendarEvents}
                    tasks={tasks}
                    onAddEvent={handleAddCalendarEvent}
                    onDeleteEvent={handleDeleteCalendarEvent}
                    onToggleEventComplete={handleToggleCalendarEventComplete}
                    onAutoSchedule={handleAutoSchedule}
                  />
                </div>
              )}

              {/* TAB 5: STREAK SAVER HABITS */}
              {activeTab === "habits" && (
                <div className="space-y-6">
                  <div className="bg-[#0e1424]/40 border border-slate-800/40 p-6 rounded-2xl">
                    <h3 className="text-base font-bold text-white mb-2">Routine Preservation Grid</h3>
                    <p className="text-xs text-slate-400 mb-4">
                      When extreme pressure hits, consistency breaks. Use the **Streak Saver** to complete lighter alternative routines computed by AI.
                    </p>
                  </div>
                  <StreakSaver
                    habits={habits}
                    onAddHabit={handleAddHabit}
                    onDeleteHabit={handleDeleteHabit}
                    onCompleteHabit={handleCompleteHabit}
                    onSaveStreakAI={handleSaveStreakAI}
                  />
                </div>
              )}

              {/* TAB 6: AI STRATEGIST */}
              {activeTab === "ai" && (
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div className="bg-emerald-950/10 border border-emerald-500/20 p-6 rounded-2xl flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span>AI Strategist & Stress Mitigation Feed</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        AI scans active deadlines and habits to construct proactive solutions to mitigate cognitive strain.
                      </p>
                    </div>
                    <button
                      onClick={handleRefreshRecommendations}
                      disabled={recsLoading}
                      className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all flex items-center gap-2"
                    >
                      {recsLoading ? "Analyzing..." : "Refresh Feed"}
                    </button>
                  </div>

                  <RecommendationsList
                    recommendations={recommendations}
                    loading={recsLoading}
                    onRefresh={handleRefreshRecommendations}
                    onApplyAction={handleApplyRecommendationAction}
                  />
                </div>
              )}

              {/* TAB 7: DISTRESS SUPPORT */}
              {activeTab === "support" && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="bg-rose-950/10 border border-rose-500/20 p-6 rounded-2xl">
                    <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2 mb-1">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Crisis Recovery Assistance</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      When cognitive lock-up sets in, draft professional delay extensions, or seek immediate professional academic support resources.
                    </p>
                  </div>

                  <CrisisHotline activeTasks={tasks} />
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
