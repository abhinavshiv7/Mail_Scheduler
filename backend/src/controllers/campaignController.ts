import { Request, Response } from 'express';
import prisma from '../config/db';
import { scheduleCampaign } from '../services/scheduler';

export const createCampaign = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { subject, body, delayBetween, hourlyLimit, recipients, startDate } = req.body;

    if (!subject || !body || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'Missing required fields or recipients' });
    }

    let parsedStartDate = startDate ? new Date(startDate) : new Date();
    // If the client's clock is behind the server, avoid setting negative delays
    if (parsedStartDate.getTime() < Date.now()) {
      parsedStartDate = new Date();
    }

    const campaign = await scheduleCampaign({
      userId,
      subject,
      body,
      delayBetween: delayBetween || 0,
      hourlyLimit: hourlyLimit || 200,
      recipients,
      startDate: parsedStartDate
    });

    res.status(201).json({ message: 'Campaign scheduled successfully', campaign });
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to schedule campaign' });
  }
};

export const getScheduledEmails = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // Fetch all scheduled emails for this user's campaigns that are NOT sent yet
    const emails = await prisma.scheduledEmail.findMany({
      where: {
        campaign: { userId },
        status: { in: ['scheduled', 'failed'] }
      },
      include: { campaign: true },
      orderBy: { scheduledTime: 'asc' }
    });

    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scheduled emails' });
  }
};

export const getSentEmails = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // Fetch all sent emails
    const emails = await prisma.scheduledEmail.findMany({
      where: {
        campaign: { userId },
        status: 'sent'
      },
      include: { campaign: true },
      orderBy: { sentTime: 'desc' }
    });

    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sent emails' });
  }
};

export const toggleStarEmail = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const emailId = id as string;

    // Verify ownership
    const email = await prisma.scheduledEmail.findUnique({
      where: { id: emailId },
      include: { campaign: true }
    });

    if (!email || email.campaign.userId !== userId) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const updated = await prisma.scheduledEmail.update({
      where: { id: emailId },
      data: { isStarred: !email.isStarred }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle star status' });
  }
};
