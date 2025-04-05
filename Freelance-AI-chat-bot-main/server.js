require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const jobService = require('./services/jobService');
const chatService = require('./services/chatService');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const jobServiceInstance = new jobService();
const chatServiceInstance = new chatService();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle incoming messages from client
  socket.on('user-message', async (data) => {
    try {
      // Show typing indicator
      socket.emit('typing');
      
      // Process message with chat service
      const response = await chatServiceInstance.processMessage(data.text, data.filters);
      
      // Get jobs based on the message
      const jobs = await jobServiceInstance.fetchJobs(response.searchQuery, data.filters);
      
      // Send response back to client
      socket.emit('bot-message', {
        text: response.text,
        jobs: jobs
      });
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('bot-message', {
        text: "Sorry, I encountered an error processing your request. Please try again."
      });
    }
  });

  // Handle job saving
  socket.on('save-job', (data) => {
    // In a real app, you'd save to a database here
    console.log('Job saved:', data.jobId);
    // socket.emit('job-saved', { success: true, jobId: data.jobId });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});