import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../types';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export class SessionController {
  // Start a new photobooth session
  static async startSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionName, eventName, location, settings } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'User authentication required' } as ApiResponse);
        return;
      }

      const session = await prisma.photoboothSession.create({
        data: {
          sessionName: sessionName || `Session ${new Date().toLocaleDateString()}`,
          eventName: eventName || null,
          location: location || null,
          userId,
          isActive: true,
          settings: settings || {},
          startedAt: new Date(),
        },
        include: {
          user: { select: { id: true, email: true, name: true } },
          _count: { select: { photos: true } },
        },
      });

      res.status(201).json({ success: true, message: 'Session started successfully', data: session } as ApiResponse);
    } catch (error) {
      console.error('Error starting session:', error);
      res.status(500).json({ success: false, message: 'Failed to start session' } as ApiResponse);
    }
  }

  // End a photobooth session
  static async endSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const userId = req.user?.id;

      if (!userId || !sessionId) {
        res.status(401).json({ success: false, message: 'User authentication required' } as ApiResponse);
        return;
      }

      const existingSession = await prisma.photoboothSession.findFirst({ where: { id: sessionId, userId } });

      if (!existingSession) {
        res.status(404).json({ success: false, message: 'Session not found or access denied' } as ApiResponse);
        return;
      }

      if (!existingSession.isActive) {
        res.status(400).json({ success: false, message: 'Session has already ended' } as ApiResponse);
        return;
      }

      const photoCount = await prisma.photo.count({ where: { sessionId } });

      const session = await prisma.photoboothSession.update({
        where: { id: sessionId },
        data: { isActive: false, endedAt: new Date(), photosTaken: photoCount },
        include: {
          user: { select: { id: true, email: true, name: true } },
          _count: { select: { photos: true } },
        },
      });

      res.json({ success: true, message: 'Session ended successfully', data: session } as ApiResponse);
    } catch (error) {
      console.error('Error ending session:', error);
      res.status(500).json({ success: false, message: 'Failed to end session' } as ApiResponse);
    }
  }

  // Get user's sessions with pagination
  static async getSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
      const status = req.query.status as string;

      if (!userId) {
        res.status(401).json({ success: false, message: 'User authentication required' } as ApiResponse);
        return;
      }

      const skip = (page - 1) * limit;

      const whereClause: any = { userId };
      if (status) {
        if (status.toUpperCase() === 'ACTIVE') whereClause.isActive = true;
        else if (status.toUpperCase() === 'ENDED') whereClause.isActive = false;
      }

      const [sessions, total] = await Promise.all([
        prisma.photoboothSession.findMany({
          where: whereClause,
          include: {
            _count: { select: { photos: true } },
          },
          orderBy: { startedAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.photoboothSession.count({ where: whereClause }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
          success: true,
          message: 'Sessions retrieved successfully',
          data: sessions,
          pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
      } as unknown as ApiResponse);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch sessions' } as ApiResponse);
    }
  }

  // Get session statistics
  static async getSessionStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'User authentication required' } as ApiResponse);
        return;
      }

      const totalSessions = await prisma.photoboothSession.count({ where: { userId } });
      const activeSessions = await prisma.photoboothSession.count({ where: { userId, isActive: true } });
      const totalPhotos = await prisma.photo.count({ where: { userId } });

      const recentSessions = await prisma.photoboothSession.findMany({
        where: { userId },
        include: { _count: { select: { photos: true } } },
        orderBy: { startedAt: 'desc' },
        take: 5,
      });

      const avgPhotosPerSession =
        totalSessions > 0 ? Math.round(totalPhotos / totalSessions) : 0;

      const stats = {
        totalSessions,
        activeSessions,
        endedSessions: totalSessions - activeSessions,
        totalPhotos,
        avgPhotosPerSession,
        recentSessions,
      };

      res.json({ success: true, message: 'Session statistics retrieved successfully', data: stats } as ApiResponse);
    } catch (error) {
      console.error('Error fetching session stats:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch session statistics' } as ApiResponse);
    }
  }
}
