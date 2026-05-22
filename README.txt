PROJECT: TASK DASHBOARD / PROJECT MANAGER

DESCRIPTION:
A full-stack Project Management Dashboard application that allows users to sign up, log in, manage projects/tasks, and communicate using real-time WebSockets.

TECH STACK:

Frontend:
- React
- Vite
- Axios
- Vercel Deployment

Backend:
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- Socket.io
- Railway Deployment

FEATURES:
- User Authentication (Login / Signup)
- JWT-based authorization
- Project and task management
- Real-time communication using Socket.io
- Responsive dashboard
- Cloud deployment

LIVE LINKS:

Frontend:
https://taskdashboard-neon.vercel.app

Backend:
https://taskdashboard-production.up.railway.app

PROJECT STRUCTURE:

taskdashboard/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
└── README.txt

INSTALLATION:

1. Clone repository:

git clone https://github.com/raunakjais2004/taskdashboard.git

2. Install frontend:

cd frontend
npm install

3. Install backend:

cd ../backend
npm install

4. Create .env:

MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret

5. Start backend:

npm start

6. Start frontend:

npm run dev

AUTHOR:
Raunak Jaiswal
