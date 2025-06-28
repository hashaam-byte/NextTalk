import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

  const { chatId } = req.query as { chatId: string };
  const userId = session.user.id;

  if (req.method === 'GET') {
    // Fetch the user's current theme for this chat
    // Adjust db logic to your ORM (example with Prisma)
    const theme = await db.chatTheme.findFirst({
      where: { chatId, userId }
    });
    return res.status(200).json({ theme: theme?.theme || 'normal' });
  }

  if (req.method === 'PUT') {
    const { theme } = req.body;
    // Upsert the theme setting for this chat/user
    await db.chatTheme.upsert({
      where: {
        chatId_userId: { chatId, userId }
      },
      update: { theme },
      create: { chatId, userId, theme }
    });
    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
