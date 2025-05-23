import { Server, Socket } from 'socket.io';
import { prisma } from '@/lib/prisma';

export function handleCallEvents(io: Server, socket: Socket) {
  socket.on('call:start', async (data) => {
    const { type, recipientId } = data;
    
    // Create call record
    const call = await prisma.call.create({
      data: {
        type,
        status: 'ONGOING',
        callerId: socket.user.id,
        receiverId: recipientId
      }
    });

    // Emit to recipient
    io.to(recipientId).emit('call:incoming', {
      callId: call.id,
      caller: socket.user,
      type
    });
  });

  socket.on('call:answer', async (data) => {
    const { callId, accepted } = data;
    
    await prisma.call.update({
      where: { id: callId },
      data: {
        status: accepted ? 'ONGOING' : 'REJECTED'
      }
    });

    // Emit to caller
    const call = await prisma.call.findUnique({
      where: { id: callId }
    });

    if (call) {
      io.to(call.callerId).emit('call:answered', {
        callId,
        accepted
      });
    }
  });

  socket.on('call:end', async (data) => {
    const { callId } = data;
    
    const endTime = new Date();
    
    const call = await prisma.call.update({
      where: { id: callId },
      data: {
        status: 'ENDED',
        endTime
      }
    });

    // Notify both parties
    io.to(call.callerId).emit('call:ended', { callId });
    io.to(call.receiverId).emit('call:ended', { callId });
  });
}
