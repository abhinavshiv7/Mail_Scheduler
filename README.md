<div align="center">
  <h1>🚀 ReachInbox - Automated Email Scheduler</h1>
  <p>A full-stack, scalable application to orchestrate, schedule, and automate email campaigns with precision delays and rate limiting.</p>
</div>

---

> **Note on Project Timeline & AI Assistance** 🤖
> Due to the tight time constraints of this assignment, **Artificial Intelligence was heavily leveraged to assist in completing this project within the stipulated timeline**. AI was used as a pair-programming partner to rapidly scaffold infrastructure, debug TypeScript and Docker configurations, implement UI features, and quickly construct the BullMQ background worker architecture. This allowed for delivering a production-ready, containerized application efficiently!

---

## ✨ Key Features
- **Flexible Authentication**: Secure Email/Password registration (via bcrypt) alongside Google OAuth 2.0 integration.
- **Smart Campaign Scheduling**: Enter multiple recipients manually or bulk upload via CSV.
- **Precision Rate Limiting & Delays**: Built-in logic to space out emails by a specific time delay (e.g., 30s between emails) and enforce strict hourly sending limits to protect sender reputation.
- **Robust Background Processing**: Powered by **BullMQ & Redis**, ensuring emails are securely queued and processed in the background, surviving server restarts and crashes.
- **Interactive Dashboard**: View real-time statuses of Scheduled and Sent emails. Features client-side search filtering, data refreshing, and a quick "Star" toggle to prioritize important campaigns.
- **Fully Containerized**: The entire stack (Frontend, Backend, Database, and Queue) is orchestrated via a single Docker Compose file for a seamless "one-click" deployment.

## 🛠️ Technology Stack
- **Frontend**: React.js, Vite, TypeScript, TailwindCSS, TanStack React Query, React Router, Lucide Icons.
- **Backend**: Node.js, Express.js, TypeScript, BullMQ (Redis queue), Prisma ORM, Nodemailer.
- **Infrastructure**: Docker & Docker Compose, PostgreSQL (Relational Database), Redis (In-memory data store for queues).

---

## 🐳 Quick Start (Recommended)

The easiest way to run this application is using Docker Compose. This automatically spins up the Postgres Database, Redis Server, Node Backend, and NGINX Frontend.

1. **Clone the repository** and navigate to the project root:
   ```bash
   git clone <repo-url>
   cd REACHINBOX_AI_ASSIGNMENT
   ```

2. **Start the containers** in detached mode:
   ```bash
   docker-compose up --build -d
   ```

3. **Access the Application**:
   - 🌐 **Frontend UI**: [http://localhost](http://localhost) (Served via NGINX)
   - ⚙️ **Backend API**: [http://localhost:8081](http://localhost:8081)

4. **Tear down** (when you are finished):
   ```bash
   docker-compose down
   ```

---

## 💻 Manual Local Development

If you prefer to run the services individually without Docker (e.g., for active development):

### Prerequisites
- Node.js (v18+)
- Local PostgreSQL instance running (Port 5432)
- Local Redis Server running (Port 6379)

### 1. Backend Setup
```bash
cd backend
npm install

# Push the Prisma schema to your Postgres database
npx prisma db push

# Start the development server
npm run dev
```

### 2. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install

# Start the Vite development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## 📁 Project Structure

```text
├── backend/
│   ├── prisma/             # Database schema and migrations
│   ├── src/
│   │   ├── controllers/    # API endpoint logic (auth, campaigns)
│   │   ├── routes/         # Express route definitions
│   │   ├── services/       # Core business logic (campaign scheduler)
│   │   └── worker/         # BullMQ worker process (consumes email jobs)
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios client setup
│   │   ├── components/     # Reusable UI elements
│   │   ├── layouts/        # Dashboard and Auth wrappers
│   │   └── pages/          # Compose, Login, Scheduled, Sent views
│   ├── Dockerfile
│   └── nginx.conf          # NGINX configuration for SPA routing
└── docker-compose.yml      # Orchestrates all 4 containers
```
