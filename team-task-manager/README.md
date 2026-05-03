# Team Task Manager

A full-stack Team Task Management Web Application built with the MERN stack (MongoDB, Express, React, Node.js). 

## Features
- **User Authentication:** Secure JWT-based login and signup.
- **Role-Based Access:** Admins create projects and add members. Members view and update tasks.
- **Task Management:** Kanban-style task board with To Do, In Progress, and Done statuses.
- **Dashboard:** Overview of total tasks, completed, overdue, and personal tasks.
- **Premium UI:** Glassmorphism design system with modern animations and dark mode.

## Local Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)

### 2. Backend Setup
1. Open terminal and navigate to backend: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file in the `backend` folder and add:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   ```
4. Start the server: `npm run dev` (Runs on http://localhost:5000)

### 3. Frontend Setup
1. Open a new terminal and navigate to frontend: `cd frontend`
2. Install dependencies: `npm install`
3. The frontend is preconfigured to call `http://localhost:5000/api`. If your backend port changes, update `frontend/src/api/axios.js`.
4. Start the Vite development server: `npm run dev` (Runs on http://localhost:5173)

---

## Deployment (Railway)

This application is designed to be easily deployed on Railway.

### Step 1: Push to GitHub
1. Initialize a git repository in the root `team-task-manager` folder.
2. Commit and push your code to a new public GitHub repository.

### Step 2: Deploy Backend to Railway
1. Go to [Railway.app](https://railway.app) and create a New Project -> "Deploy from GitHub repo".
2. Select your repository.
3. Railway will auto-detect the root directory. To specify the backend, go to the Service Settings -> Root Directory and type `/backend`.
4. Under Variables, add:
   - `MONGO_URI` (your MongoDB Atlas connection string)
   - `JWT_SECRET` (a strong random string)
   - `PORT` = `5000`
5. Railway will build and deploy the Node.js API. Grab the public URL (e.g., `https://your-backend.up.railway.app`).

### Step 3: Deploy Frontend to Railway
1. In the same Railway project, click "New" -> "Deploy from GitHub repo" and select the same repository again.
2. Go to Service Settings -> Root Directory and type `/frontend`.
3. In the frontend code (`frontend/src/api/axios.js`), update the `baseURL` from `http://localhost:5000/api` to your new Backend Railway URL (`https://your-backend.up.railway.app/api`).
   *(Make sure to commit and push this change to GitHub so Railway builds the new URL)*.
4. Railway will automatically detect Vite and deploy your frontend.

### Demo Video
*Record a 2-5 minute video showcasing the Auth flow, Dashboard, Project creation, Task Assignment, and Role differences. Share the link here.*
