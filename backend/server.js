
// backend/server.js - VERSION COMPLÈTE CORRIGÉE SANS DOUBLONS
const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();

// ✅ MIDDLEWARE CORS MANUEL
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  next();
});

// ✅ CONFIGURATION BODY PARSER AVEC LIMITE AUGMENTÉE
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// ✅ LOGGING DES REQUÊTES
app.use((req, res, next) => {
  console.log(`📍 ${new Date().toISOString()} | ${req.method} ${req.originalUrl}`);
  next();
});

const connectDB = require('./config/connectDB');
connectDB();

// ✅ SERVIR LES FICHIERS UPLOADS STATIQUEMENT
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ CONFIGURATION SOCKET.IO AVEC CORS
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ✅ ROUTE TEST
app.get("/", (req,res) => {
    res.status(200).json("Server is running correctly");
});

// ✅ ROUTES PRINCIPALES - ORDRE OPTIMAL
app.use('/api/user', require('./routes/auth.route')); // Authentification
app.use('/api/job', require('./routes/job.route')); // Offres d'emploi
app.use('/api/admin', require('./routes/admin.route')); // Administration
app.use('/api/chat/conversations', require('./routes/conversation.route')); // Conversations
app.use('/api/chat/messages', require('./routes/message.route')); // Messages
app.use('/api/chat/calls', require('./routes/call.route')); // Appels
app.use('/api/chat/notifications', require('./routes/notification.route')); // Notifications chat

// ✅ ROUTES DES ACTIVITÉS ET NOTIFICATIONS (NOUVELLES FONCTIONNALITÉS)
app.use('/api/activity', require('./routes/activity.route')); // Activités
app.use('/api/notification-activity', require('./routes/notificationActivity.route')); // Notifications d'activités
app.use('/api/activity-view', require('./routes/activityView.route')); // Vues d'activités

// ✅ GESTION SOCKET.IO
const socketAuth = require('./middleware/socketAuth');
io.use(socketAuth);

io.on('connection', (socket) => {
  console.log('🔗 User connected:', socket.userId);

  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.userId} joined conversation ${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId) => {
    socket.leave(conversationId);
  });

  socket.on('send_message', (data) => {
    io.to(data.conversation_id).emit('new_message', data);
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.userId);
  });
});

//middleware pour le deploiement
app.use((req, res)=> {
  res.send("API is running!!")
})

const PORT = process.env.PORT || 9843;

// ✅ DÉMARRAGE DU SERVEUR
server.listen(PORT, (err) => 
  err
  ? console.log("❌ Server error:", err)
  : console.log(`🟢 Server running on : http://localhost:${PORT}`)
);