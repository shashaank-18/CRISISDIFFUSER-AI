# CrisisDiffuser AI 🚨


**🚀 Live Application URL:** [https://crisisdiffuser-ai-1072738928548.asia-southeast1.run.app/](https://crisisdiffuser-ai-1072738928548.asia-southeast1.run.app/)

CrisisDiffuser AI is a proactive, agentic productivity command station engineered to eliminate task-initiation paralysis, manage overwhelming academic workloads, and mitigate extreme temporal deadline pressures. Unlike traditional, passive to-do list applications, CrisisDiffuser AI actively steps in to evaluate, break down, and schedule tasks dynamically using the Google ecosystem before critical deadlines are missed.

Built and deployed leveraging **Google AI Studio** and **Google Cloud Run** as the core engineering foundations.

---

## 📸 Interface Preview

### Core Command Console (Overview)
The main hub tracks structural metrics like active crises, delayed workflows, and cognitive loads at a glance.
![Core Command Console](image_3d5000.png)

### Streak Saver Grid Layout
The habit deployment layout tracks specific consistency triggers (e.g., LeetCode Optimization, Leg Day Gym Routines) and pairs them with 3-minute emergency micro-alternatives.
![Streak Saver Hub](image_d60fa7.png)

---

## 🛠️ Key Features & Operational Modules

### 1. AI Survival Strategy Center (Proactive Command Station)
Acts as the application's central operational engine. It automatically scans registered task parameters and active workloads, prompting Gemini to deliver targeted survival tactics categorized into four distinct priority states: **CRISIS**, **STRATEGY**, **MOTIVATION**, or **RESCHEDULE**. Users can instantly trigger "Action Blocks" to map work windows or construct emergency document templates.

### 2. Urgent Deadline Desk & Low-Friction Checklists
Calculates a real-time, dynamic **Panic Score (0–100%)** based on temporal proximity and task importance. To combat execution friction, clicking *"Prepare Action Plan"* directs Gemini to dismantle intimidating projects into microscopic, low-friction, 3-to-5-step checklists. Each step is paired with a psychological starting hack (e.g., *"Just structure headers first, do not write full paragraphs yet"*) and an interactive Focus Block Timer.

### 3. Panic Room Emergency Voice Hotline
Designed specifically for severe stress paralysis. Clicking the emergency hotline triggers a lightweight call to the backend data layer. Gemini synthesizes a highly focused, calming 50-word coaching guide, read aloud via real-time browser text-to-speech. If network limits spike, a resilient visual subtitle panel acts as a graceful user interface fallback.

### 4. Streak-Saver Habits (Consistency Protection)
Preserves behavioral routines on ultra-high-pressure days. When a user lacks the time for full routines (e.g., an hour-long gym session or intense programming sprint), tapping *"AI Save Streak"* prompts Gemini to generate a tailored, 3-minute emergency micro-alternative (e.g., *"Do 10 pushups right next to your desk"* or *"Review 3 LeetCode flashcards"*). Completing this alternative successfully locks in the streak chain.

### 5. Crisis Focus Calendar & .ics Export
Allows users to carve out immediate deep-work windows. The **AI Auto-Schedule Blocks** feature utilizes smart sequencing to map tasks directly into consecutive focus intervals and mandatory breaks starting from the current time. The entire generated crisis schedule can be instantly compiled into a standard `.ics` file blob for effortless import into Google Calendar or Outlook.

---

## 💻 Tech Stack & Design System

*   **Frontend Framework:** React.js, TypeScript, Tailwind CSS, Lucide React Icons
*   **AI Integration:** Google AI Studio, Gemini API
*   **Deployment Infrastructure:** Google Cloud Run (Serverless Container Platform)
*   **UI/UX Prototyping Canvas:** Google Stitch (Experimental Mode Workflow)
*   **Design System Aesthetic:** High-stakes, high-contrast **"Cyber-Crisis / Tactical Survival Gear" Palette** featuring deep glassmorphic dark-mode surfaces accented by neon urgency indicators.

---

## ⚙️ Project File Architecture

```text
├── assets/                 # Layout & design assets
│   └── .aistudio/         # AI Studio workspace configuration keys
├── src/                    # Application source files
│   ├── components/         # Modular React views (Dashboard, StreakSaver)
│   ├── App.tsx             # Central route router & view layout controller
│   └── main.tsx            # Application DOM mounting point
├── .env.example            # Environment template for Gemini API keys
├── package.json            # Node project configuration dependencies
├── server.ts               # Local server configuration file
└── tsconfig.json           # TypeScript compilation presets
