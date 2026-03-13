# IntentOS 🧠
> **AI Powered Intent Driven Workspace** — Type your goal, get a full focus environment in seconds.

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, Vite, TailwindCSS, React Draggable |
| Backend   | Node.js, Express.js               |
| Database  | MongoDB (Mongoose)                |
| AI        | OpenAI API (GPT-4)                |

---

## Project Structure

```
intentos/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js               # JWT auth middleware
│   │   └── errorHandler.js       # Global error handler
│   ├── models/
│   │   ├── Intent.js             # Intent + workspace plan schema
│   │   ├── Session.js            # Focus session schema
│   │   └── User.js               # User account schema
│   ├── routes/
│   │   ├── intent.js             # POST/GET/DELETE /api/intents
│   │   ├── workspace.js          # Session start/end /api/workspace
│   │   └── user.js               # Register/login /api/users
│   ├── services/
│   │   ├── openaiService.js      # OpenAI API integration
│   │   └── workspaceService.js   # Workspace plan builder
│   ├── .env.example              # Environment variable template
│   ├── package.json
│   └── server.js                 # Express app entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIAssistant.jsx   # AI chat panel
│   │   │   ├── IntentInput.jsx   # Intent submission UI
│   │   │   ├── Navbar.jsx        # Top navigation
│   │   │   ├── TaskCard.jsx      # Individual task item
│   │   │   ├── Timer.jsx         # Pomodoro timer
│   │   │   └── WorkspacePanel.jsx # Main workspace layout
│   │   ├── hooks/
│   │   │   ├── useIntent.js      # Intent submission lifecycle
│   │   │   ├── useTimer.js       # Countdown timer logic
│   │   │   └── useWorkspace.js   # Session management
│   │   ├── services/
│   │   │   ├── api.js            # Axios base instance
│   │   │   ├── intentService.js  # Intent API calls
│   │   │   └── workspaceService.js # Session API calls
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .gitignore
├── package.json                  # Root — concurrently dev scripts
└── README.md
```

---

## Quick Start

### 1. Clone and install all dependencies

```bash
git clone <your-repo-url>
cd intentos
npm run install:all
```

### 2. Configure environment variables

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/intentos
OPENAI_API_KEY=sk-...
JWT_SECRET=your_secret_here
NODE_ENV=development
```

### 3. Start MongoDB

Make sure MongoDB is running locally:
```bash
# Windows
mongod

# Mac/Linux
sudo service mongod start
```

### 4. Run the project

```bash
npm run dev
```

- **Frontend** → [http://localhost:3000](http://localhost:3000)
- **Backend API** → [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## API Endpoints

| Method | Endpoint                              | Description               |
|--------|---------------------------------------|---------------------------|
| POST   | `/api/intents`                        | Submit intent → get workspace |
| GET    | `/api/intents`                        | List recent intents        |
| GET    | `/api/intents/:id`                    | Get single intent          |
| PATCH  | `/api/intents/:id/status`             | Update intent status       |
| DELETE | `/api/intents/:id`                    | Delete intent              |
| POST   | `/api/workspace/session/start`        | Start a focus session      |
| PATCH  | `/api/workspace/session/:id/end`      | End a focus session        |
| GET    | `/api/workspace/sessions`             | List all sessions          |
| POST   | `/api/users/register`                 | Register user              |
| POST   | `/api/users/login`                    | Login + get JWT            |
| GET    | `/api/health`                         | API health check           |

---

## Architecture Notes

- **Mock AI responses** are active by default in `openaiService.js`. Swap to real OpenAI calls once your API key is configured.
- **JWT auth** is wired up in `middleware/auth.js` but routes are currently public — add `protect` middleware when auth is needed.
- **React Draggable** panels are ready in `WorkspacePanel.jsx`.
- The **Pomodoro timer** in `useTimer.js` handles automatic focus/break phase switching.

---

## Roadmap (future phases)

- [ ] Real OpenAI GPT-4 intent parsing
- [ ] AI chat assistant (streaming)
- [ ] Distraction site blocking (browser extension)
- [ ] Session history dashboard
- [ ] User authentication flow
- [ ] Mobile-responsive layout

---

*Built for hackathon — IntentOS 2026* 🚀
