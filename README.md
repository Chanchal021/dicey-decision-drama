🎲 Dicey Decisions
Dicey Decisions is a collaborative real-time decision-making app where users can create “rooms”, add participants, and vote on different options. Built with React, Supabase, ShadCN UI, and TypeScript, this app is designed for quick, democratic decisions among friends, teams, or communities.

🚀 Features
✅ Room-based decision system

👥 Invite & manage participants

🔄 Realtime updates using Supabase Realtime

🗳️ Voting mechanism for multiple options

🧩 Modern UI with ShadCN and Tailwind CSS

⚡ Built with Vite for blazing-fast development

📦 Tech Stack
Frontend: React, TypeScript, ShadCN UI, Tailwind CSS, Vite

Backend: Supabase (PostgreSQL, Realtime, Auth)

State Management: React Hooks

Deployment: Vercel / Netlify (Recommended)

📁 Project Structure
bash
Copy
Edit
src/
├── components/       # Reusable UI components
├── hooks/            # Custom React hooks (e.g., useRoomsRealtime)
├── pages/            # Main pages/views
├── integrations/     # Supabase client setup
├── types/            # TypeScript types/interfaces
├── App.tsx           # App entry point
└── main.tsx          # React + Vite bootstrap


Improvements
Authentication with Supabase Auth

Poll deadlines and reminders

Mobile responsiveness

Admin controls (kick, reset votes, etc.)

Result charts/visualizations

🙌 Contributions
Feel free to fork, clone, and submit PRs. For major changes, open an issue to discuss what you’d like to change.