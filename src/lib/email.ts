import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  pool: true,
  maxConnections: 3,
  maxMessages: 100,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  service: 'gmail',
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3',
    secureProtocol: 'TLSv1_method'
  },
  headers: {
    'X-Priority': '1',
    'X-MSMail-Priority': 'High',
    'Importance': 'high',
    'Priority': 'urgent'
  }
});

// Verify connection
transporter.verify((error) => {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to send emails');
  }
});

interface EmailParams {
  to: string;
  senderName: string;
  recipientName: string;
}

export const sendContactRequestEmail = async ({ to, senderName, recipientName }: EmailParams) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Contact Request</h2>
      <p>Hi ${recipientName},</p>
      <p>${senderName} would like to add you as a contact on NexTalk.</p>
      <p>Log in to your account to accept or decline this request.</p>
      <a href="${process.env.NEXTAUTH_URL}/contacts" 
         style="display: inline-block; background: #6366f1; color: white; padding: 10px 20px; 
                text-decoration: none; border-radius: 5px; margin-top: 15px;">
        View Request
      </a>
      <p style="margin-top: 20px; color: #666;">
        If you didn't expect this request, you can safely ignore it.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"NexTalk" <${process.env.SMTP_USER}>`,
    to,
    subject: `${senderName} wants to connect on NexTalk`,
    html,
  });
};

interface InviteParams {
  to: string;
  senderName: string;
  inviteLink: string;
}

export const sendInviteEmail = async ({ to, senderName, inviteLink }: InviteParams) => {
  try {
    const result = await transporter.sendMail({
      from: {
        name: "NexTalk",
        address: process.env.SMTP_USER as string
      },
      to,
      subject: `🎉 ${senderName} invited you to join NexTalk`,
      priority: 'high',
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      },
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Join NexTalk</h2>
          <p>Hi there,</p>
          <p>${senderName} has invited you to join NexTalk - a modern messaging platform.</p>
          <p>Click the button below to create your account and start chatting:</p>
          <a href="${inviteLink}" 
             style="display: inline-block; background: #6366f1; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px; margin-top: 15px;">
            Join NexTalk
          </a>
          <p style="margin-top: 20px; color: #666;">
            If you didn't expect this invitation, you can safely ignore it.
          </p>
        </div>
      `,
      messageId: `${Date.now()}.${Math.random().toString().slice(2)}@nexttalk.com`,
      dkim: {
        domainName: "gmail.com",
        keySelector: "default",
        privateKey: process.env.SMTP_PASSWORD
      }
    });

    if (result.accepted.includes(to)) {
      console.log('Email delivered successfully to:', to);
    }

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};
