import { Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma-client';
import { AuthenticatedValidatedRequest } from '@/types/validate';

// ============================================================================
// ACTIVITY PARTICIPANT CONTROLLER
// ============================================================================

/**
 * @desc    Ottieni partecipanti di un'activity
 * @route   GET /api/activities/:activityId/participants
 * @access  Private (activity:read)
 */
export const getActivityParticipants = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { activityId } = req.validatedParams;

    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(activityId) },
    });

    if (!activity) {
      res.status(404).json({
        success: false,
        message: 'Activity non trovata',
      });
      return;
    }

    const participants = await prisma.activityParticipant.findMany({
      where: { activityId: parseInt(activityId) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            details: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            position: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    res.status(200).json({
      success: true,
      data: participants,
      count: participants.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Aggiungi partecipante ad activity
 * @route   POST /api/activities/:activityId/participants
 * @access  Private (activity:update)
 */
export const addActivityParticipant = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = req.validatedBody;

    // Verifica che l'activity esista
    const activity = await prisma.activity.findUnique({
      where: { id: data.activityId },
    });

    if (!activity) {
      res.status(404).json({
        success: false,
        message: 'Activity non trovata',
      });
      return;
    }

    // Verifica user se fornito
    if (data.userId) {
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Utente non trovato',
        });
        return;
      }

      // Verifica duplicato
      const existing = await prisma.activityParticipant.findFirst({
        where: {
          activityId: data.activityId,
          userId: data.userId,
        },
      });

      if (existing) {
        res.status(400).json({
          success: false,
          message: 'Utente già presente come partecipante',
        });
        return;
      }
    }

    // Verifica contact se fornito
    if (data.contactId) {
      const contact = await prisma.contact.findUnique({
        where: { id: data.contactId },
      });

      if (!contact) {
        res.status(404).json({
          success: false,
          message: 'Contact non trovato',
        });
        return;
      }

      // Verifica duplicato
      const existing = await prisma.activityParticipant.findFirst({
        where: {
          activityId: data.activityId,
          contactId: data.contactId,
        },
      });

      if (existing) {
        res.status(400).json({
          success: false,
          message: 'Contact già presente come partecipante',
        });
        return;
      }
    }

    const participant = await prisma.activityParticipant.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Partecipante aggiunto con successo',
      data: participant,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Aggiorna partecipante
 * @route   PUT /api/activities/participants/:id
 * @access  Private (activity:update)
 */
export const updateActivityParticipant = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.validatedParams;
    const data = req.validatedBody;

    const existingParticipant = await prisma.activityParticipant.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingParticipant) {
      res.status(404).json({
        success: false,
        message: 'Partecipante non trovato',
      });
      return;
    }

    // Se status cambia, imposta responseDate
    if (data.status && data.status !== existingParticipant.status) {
      data.responseDate = new Date();
    }

    const participant = await prisma.activityParticipant.update({
      where: { id: parseInt(id) },
      data,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Partecipante aggiornato con successo',
      data: participant,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Rimuovi partecipante
 * @route   DELETE /api/activities/participants/:id
 * @access  Private (activity:update)
 */
export const removeActivityParticipant = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.validatedParams;

    const participant = await prisma.activityParticipant.findUnique({
      where: { id: parseInt(id) },
    });

    if (!participant) {
      res.status(404).json({
        success: false,
        message: 'Partecipante non trovato',
      });
      return;
    }

    // Non permettere la rimozione dell'organizer
    if (participant.role === 'organizer') {
      res.status(400).json({
        success: false,
        message: 'Impossibile rimuovere l\'organizer',
      });
      return;
    }

    await prisma.activityParticipant.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Partecipante rimosso con successo',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Aggiungi partecipanti multipli
 * @route   POST /api/activities/:activityId/participants/bulk
 * @access  Private (activity:update)
 */
export const addBulkParticipants = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { activityId } = req.validatedParams;
    const { participants } = req.validatedBody;

    if (!Array.isArray(participants) || participants.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Array di partecipanti obbligatorio',
      });
      return;
    }

    // Verifica che l'activity esista
    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(activityId) },
    });

    if (!activity) {
      res.status(404).json({
        success: false,
        message: 'Activity non trovata',
      });
      return;
    }

    // Crea partecipanti in transazione
    const createdParticipants = await prisma.$transaction(
      participants.map((p: any) =>
        prisma.activityParticipant.create({
          data: {
            activityId: parseInt(activityId),
            userId: p.userId,
            contactId: p.contactId,
            externalEmail: p.externalEmail,
            externalName: p.externalName,
            role: p.role || 'participant',
            status: p.status || 'invited',
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        })
      )
    );

    res.status(201).json({
      success: true,
      message: `${createdParticipants.length} partecipanti aggiunti con successo`,
      data: createdParticipants,
    });
  } catch (error) {
    next(error);
  }
};