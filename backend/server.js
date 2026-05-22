require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import HTTP and Socket.io for Real-Time functionality
const http = require('http'); 
const { Server } = require('socket.io');

const app = express();

// Create the HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' } // Allow frontend to connect from anywhere
});

// Make 'io' globally accessible to your routes so we can broadcast messages
app.set('io', io);

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(express.json());
app.use(cors());

// ==========================================
// ROUTES
// ==========================================
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Simple health check
app.get('/', (req, res) => {
  res.send('Project Manager API & WebSocket Server Running...');
});

// Socket.io Connection test
io.on('connection', (socket) => {
  console.log('A user connected via WebSocket');
  
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// ==========================================
// DATABASE CONNECTION & START SERVER
// ==========================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch((err) => console.log('MongoDB Connection Error: ', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});