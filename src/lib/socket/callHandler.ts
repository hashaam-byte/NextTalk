import { Server, Socket } from 'socket.io';
import { prisma } from '@/lib/prisma';

export function handleCallEvents(io: Server, socket: Socket) {
  socket.on('call:start', async (data) => {
    const { recipientId, type } = data;
    
    const call = await prisma.call.create({
      data: {
        type,
        status: 'RINGING',
        callerId: socket.user.id,
        receiverId: recipientId
      },
      include: {
        caller: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    // Notify recipient
    io.to(recipientId).emit('call:incoming', {
      callId: call.id,
      type,
      caller: call.caller
    });

    // Set timeout for no answer after 30 seconds
    setTimeout(async () => {
      const currentCall = await prisma.call.findUnique({
        where: { id: call.id }
      });

      if (currentCall?.status === 'RINGING') {
        await prisma.call.update({
          where: { id: call.id },
          data: { status: 'NO_ANSWER' }
        });

        // Notify both parties
        io.to(socket.user.id).emit('call:no-answer', { callId: call.id });
        io.to(recipientId).emit('call:missed', { callId: call.id });
      }
    }, 30000);
  });

  socket.on('call:answer', async (data) => {
    const { callId, accepted } = data;
    
    const call = await prisma.call.findUnique({
      where: { id: callId }
    });

    if (!call) return;

    if (accepted) {
      await prisma.call.update({
        where: { id: callId },
        data: {
          status: 'ONGOING',
          startTime: new Date()
        }
      });

      // Notify caller that call was accepted
      io.to(call.callerId).emit('call:accepted', { 
        callId,
        startTime: new Date()
      });
    } else {
      await prisma.call.update({
        where: { id: callId },
        data: { status: 'REJECTED' }
      });

      // Notify caller that call was rejected
      io.to(call.callerId).emit('call:rejected', { callId });
    }
  });

  socket.on('call:end', async (data) => {
    const { callId } = data;
    
    await prisma.call.update({
      where: { id: callId },
      data: {
        status: 'ENDED',
        endTime: new Date()
      }
    });

    const call = await prisma.call.findUnique({
      where: { id: callId }
    });

    if (call) {
      // Notify both parties
      io.to(call.callerId).emit('call:ended', { callId });
      io.to(call.receiverId).emit('call:ended', { callId });
    }
  });
}
