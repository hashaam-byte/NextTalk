// server/sockets/index.js
const { Server } = require('socket.io');
const http = require('http');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Create HTTP server
const server = http.createServer();

// Initialize Socket.IO server with CORS configuration
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }
    
    // Attach user to socket
    socket.user = user;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error'));
  }
});

// Track online users
const onlineUsers = new Map();

io.on('connection', (socket) => {
  const userId = socket.user?.id;
  const chatId = socket.handshake.query.chatId;
  
  console.log(`User connected: ${userId} to chat: ${chatId}`);
  
  // Add user to online users map
  if (userId) {
    onlineUsers.set(userId, socket.id);
    
    // Join chat room
    if (chatId) {
      socket.join(chatId);
    }
    
    // Notify other users about online status
    io.emit('user_status', { userId, status: 'online' });
  }
  
  // Handle new message
  socket.on('send_message', async (messageData) => {
    try {
      // Save message to database
      const newMessage = await prisma.message.create({
        data: {
          content: messageData.content,
          mediaUrl: messageData.mediaUrl,
          sender: { connect: { id: userId } },
          chat: { connect: { id: messageData.chatId } },
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
      });
      
      // Broadcast to everyone in the chat
      io.to(messageData.chatId).emit('message', newMessage);
      
      // Update chat's lastMessage
      await prisma.chat.update({
        where: { id: messageData.chatId },
        data: {
          lastMessageId: newMessage.id,
          updatedAt: new Date(),
        },
      });
      
      // Send push notifications if needed (would be implemented separately)
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
  
  // Handle typing indicator
  socket.on('typing', (data) => {
    socket.to(data.chatId).emit('typing', {
      userId,
      chatId: data.chatId,
      isTyping: data.isTyping,
    });
  });
  
  // Handle read receipts
  socket.on('mark_read', async (data) => {
    try {
      // Update messages as read
      await prisma.message.updateMany({
        where: {
          chatId: data.chatId,
          senderId: { not: userId },
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });
      
      // Notify other users about read status
      socket.to(data.chatId).emit('messages_read', {
        chatId: data.chatId,
        readBy: userId,
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${userId}`);
    
    if (userId) {
      // Remove from online users
      onlineUsers.delete(userId);
      
      // Notify others about offline status
      io.emit('user_status', { userId, status: 'offline' });
      
      // Update last seen in database
      prisma.user.update({
        where: { id: userId },
        data: { lastSeen: new Date() },
      }).catch(error => {
        console.error('Error updating last seen:', error);
      });
    }
  });
});

// Start the server
const PORT = process.env.SOCKET_PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});

module.exports = { io, server };