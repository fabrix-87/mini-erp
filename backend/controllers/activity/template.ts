import { Request, Response, NextFunction } from 'express';
import { Prisma } from '../../generated/prisma/client';
import { prisma } from '../../config/prisma-client';

// ============================================================================
// ACTIVITY TEMPLATE CONTROLLER
// ============================================================================

/**
 * @desc    Ottieni tutti i Templates
 * @route   GET /api/activity-templates
 * @access  Private (activity:read)
 */
export const getAllActivityTemplates = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { active, type, sortBy = 'name', sortOrder = 'asc' } = req.query;

    const where: Prisma.ActivityTemplateWhereInput = {};

    if (active !== undefined) {
      where.active = active === 'true';
    }

    if (type) {
      where.type = type as any;
    }

    const templates = await prisma.activityTemplate.findMany({
      where,
      orderBy: { [sortBy as string]: sortOrder },
    });

    res.status(200).json({
      success: true,
      data: templates,
      count: templates.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Ottieni Template per ID
 * @route   GET /api/activity-templates/:id
 * @access  Private (activity:read)
 */
export const getActivityTemplateById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const template = await prisma.activityTemplate.findUnique({
      where: { id: parseInt(id) },
    });

    if (!template) {
      res.status(404).json({
        success: false,
        message: 'Template non trovato',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crea nuovo Template
 * @route   POST /api/activity-templates
 * @access  Private (activity:manage)
 */
export const createActivityTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = req.body;

    const template = await prisma.activityTemplate.create({
      data,
    });

    res.status(201).json({
      success: true,
      message: 'Template creato con successo',
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Aggiorna Template
 * @route   PUT /api/activity-templates/:id
 * @access  Private (activity:manage)
 */
export const updateActivityTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existingTemplate = await prisma.activityTemplate.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingTemplate) {
      res.status(404).json({
        success: false,
        message: 'Template non trovato',
      });
      return;
    }

    const template = await prisma.activityTemplate.update({
      where: { id: parseInt(id) },
      data,
    });

    res.status(200).json({
      success: true,
      message: 'Template aggiornato con successo',
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Elimina Template
 * @route   DELETE /api/activity-templates/:id
 * @access  Private (activity:manage)
 */
export const deleteActivityTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const template = await prisma.activityTemplate.findUnique({
      where: { id: parseInt(id) },
    });

    if (!template) {
      res.status(404).json({
        success: false,
        message: 'Template non trovato',
      });
      return;
    }

    await prisma.activityTemplate.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Template eliminato con successo',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crea Activity da Template
 * @route   POST /api/activity-templates/:id/create-activity
 * @access  Private (activity:create)
 */
export const createActivityFromTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      scheduledStart,
      scheduledEnd,
      subject,
      description,
      companyId,
      customerId,
      opportunityId,
      assignedUserId,
    } = req.body;

    const userId = (req as any).user.id;

    // Verifica che il template esista
    const template = await prisma.activityTemplate.findUnique({
      where: { id: parseInt(id) },
    });

    if (!template) {
      res.status(404).json({
        success: false,
        message: 'Template non trovato',
      });
      return;
    }

    if (!template.active) {
      res.status(400).json({
        success: false,
        message: 'Template non attivo',
      });
      return;
    }

    // Validazioni relazioni (almeno una deve essere presente)
    if (!companyId && !customerId && !opportunityId) {
      res.status(400).json({
        success: false,
        message: 'Almeno una relazione (company, customer o opportunity) è obbligatoria',
      });
      return;
    }

    // Verifica utente assegnato
    const assignedUser = await prisma.user.findUnique({
      where: { id: assignedUserId },
    });

    if (!assignedUser) {
      res.status(404).json({
        success: false,
        message: 'Utente assegnato non trovato',
      });
      return;
    }

    // Calcola scheduledEnd se non fornito e c'è defaultDuration
    let calculatedEnd = scheduledEnd;
    if (!scheduledEnd && template.defaultDuration) {
      const start = new Date(scheduledStart);
      calculatedEnd = new Date(start.getTime() + template.defaultDuration * 60000);
    }

    // Crea l'activity dal template
    const activity = await prisma.activity.create({
      data: {
        type: template.type,
        priority: template.priority,
        status: 'SCHEDULED',
        subject: subject || template.defaultSubject,
        description: description || template.defaultDescription,
        scheduledStart: new Date(scheduledStart),
        scheduledEnd: calculatedEnd ? new Date(calculatedEnd) : null,
        duration: template.defaultDuration,
        companyId,
        customerId,
        opportunityId,
        assignedUserId,
        createdByUserId: userId,
        customFields: template.checklist ? { checklist: template.checklist } : undefined,
      },
      include: {
        company: true,
        customer: true,
        opportunity: true,
        assignedUser: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Activity creata da template con successo',
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle active status Template
 * @route   PATCH /api/activity-templates/:id/toggle-active
 * @access  Private (activity:manage)
 */
export const toggleTemplateActive = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const template = await prisma.activityTemplate.findUnique({
      where: { id: parseInt(id) },
    });

    if (!template) {
      res.status(404).json({
        success: false,
        message: 'Template non trovato',
      });
      return;
    }

    const updatedTemplate = await prisma.activityTemplate.update({
      where: { id: parseInt(id) },
      data: { active },
    });

    res.status(200).json({
      success: true,
      message: `Template ${active ? 'attivato' : 'disattivato'} con successo`,
      data: updatedTemplate,
    });
  } catch (error) {
    next(error);
  }
};