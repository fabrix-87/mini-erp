import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma-client';
import { Prisma } from '../generated/prisma/client';

// ============================================================================
// OPPORTUNITY CONTROLLER
// ============================================================================

/**
 * Mappa stage a probabilità default
 */
const STAGE_PROBABILITY_MAP: Record<string, number> = {
  LEAD_QUALIFICATION: 10,
  PROSPECTING: 20,
  NEEDS_ANALYSIS: 40,
  PROPOSAL_SENT: 60,
  NEGOTIATION: 80,
  COMMITMENT: 90,
};

/**
 * Calcola weighted value
 */
const calculateWeightedValue = (
  estimatedValue: number | null,
  probability: number
): number => {
  if (!estimatedValue) return 0;
  return (estimatedValue * probability) / 100;
};

/**
 * @desc    Ottieni tutte le opportunità con filtri e paginazione
 * @route   GET /api/opportunities
 * @access  Private (opportunity:read)
 */
export const getAllOpportunities = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      customerId,
      assignedUserId,
      status,
      stage,
      minValue,
      maxValue,
      minProbability,
      maxProbability,
      expectedCloseDateFrom,
      expectedCloseDateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: Prisma.OpportunityWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { notes: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (customerId) {
      where.customerId = parseInt(customerId as string);
    }

    if (assignedUserId) {
      where.assignedUserId = parseInt(assignedUserId as string);
    }

    if (status) {
      where.status = status as any;
    }

    if (stage) {
      where.stage = stage as any;
    }

    if (minValue || maxValue) {
      where.estimatedValue = {};
      if (minValue) where.estimatedValue.gte = new Prisma.Decimal(minValue as string);
      if (maxValue) where.estimatedValue.lte = new Prisma.Decimal(maxValue as string);
    }

    if (minProbability !== undefined || maxProbability !== undefined) {
      where.probability = {};
      if (minProbability !== undefined)
        where.probability.gte = parseInt(minProbability as string);
      if (maxProbability !== undefined)
        where.probability.lte = parseInt(maxProbability as string);
    }

    if (expectedCloseDateFrom || expectedCloseDateTo) {
      where.expectedCloseDate = {};
      if (expectedCloseDateFrom)
        where.expectedCloseDate.gte = new Date(expectedCloseDateFrom as string);
      if (expectedCloseDateTo)
        where.expectedCloseDate.lte = new Date(expectedCloseDateTo as string);
    }

    // Execute query
    const [opportunities, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          customer: {
            include: {
              company: {
                select: {
                  id: true,
                  code: true,
                  companyName: true,
                  tradeName: true,
                },
              },
            },
          },
          createdBy: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          assignedUser: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          documents: {
            select: {
              id: true,
              documentNumber: true,
              documentType: true,
              totalAmount: true,
            },
          },
        },
      }),
      prisma.opportunity.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: opportunities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Ottieni opportunità per Customer ID
 * @route   GET /api/opportunities/customer/:customerId
 * @access  Private (opportunity:read)
 */
export const getOpportunitiesByCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { customerId } = req.params;
    const { status } = req.query;

    const where: Prisma.OpportunityWhereInput = {
      customerId: parseInt(customerId),
    };

    if (status) {
      where.status = status as any;
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      orderBy: [{ expectedCloseDate: 'asc' }, { createdAt: 'desc' }],
      include: {
        customer: {
          include: {
            company: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
        assignedUser: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: opportunities,
      count: opportunities.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Ottieni un'opportunità per ID
 * @route   GET /api/opportunities/:id
 * @access  Private (opportunity:read)
 */
export const getOpportunityById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: {
          include: {
            company: {
              select: {
                id: true,
                code: true,
                companyName: true,
                tradeName: true,
                mainEmail: true,
                mainPhone: true,
                legalAddress: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
            details: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        assignedUser: {
          select: {
            id: true,
            username: true,
            email: true,
            details: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        documents: {
          select: {
            id: true,
            documentNumber: true,
            documentType: true,
            status: true,
            documentDate: true,
            totalAmount: true,
          },
          orderBy: { documentDate: 'desc' },
        },
      },
    });

    if (!opportunity) {
      res.status(404).json({
        success: false,
        message: 'Opportunità non trovata',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: opportunity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crea nuova opportunità
 * @route   POST /api/opportunities
 * @access  Private (opportunity:create)
 */
export const createOpportunity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      customerId,
      status = 'OPEN',
      stage = 'LEAD_QUALIFICATION',
      estimatedValue,
      probability,
      expectedCloseDate,
      assignedUserId,
      notes,
      customFields,
    } = req.body;

    // Verifica che il customer esista
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      res.status(404).json({
        success: false,
        message: 'Customer non trovato',
      });
      return;
    }

    // Se assignedUserId è fornito, verifica che l'utente esista
    if (assignedUserId) {
      const user = await prisma.user.findUnique({
        where: { id: assignedUserId },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Utente assegnato non trovato',
        });
        return;
      }
    }

    // Calcola probabilità default da stage se non fornita
    const finalProbability =
      probability !== undefined ? probability : STAGE_PROBABILITY_MAP[stage] || 0;

    // Calcola weighted value
    const weightedValue = calculateWeightedValue(
      estimatedValue ? parseFloat(estimatedValue) : null,
      finalProbability
    );

    // Ottieni l'utente corrente dal token
    const currentUserId = (req as any).user?.id;

    // Crea l'opportunità
    const opportunity = await prisma.opportunity.create({
      data: {
        title,
        description,
        customerId,
        status,
        stage,
        estimatedValue: estimatedValue ? new Prisma.Decimal(estimatedValue) : null,
        probability: finalProbability,
        weightedValue: new Prisma.Decimal(weightedValue),
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        createdByUserId: currentUserId,
        assignedUserId: assignedUserId || currentUserId,
        notes,
        customFields: customFields ? JSON.parse(customFields) : undefined,
      },
      include: {
        customer: {
          include: {
            company: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
        assignedUser: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Opportunità creata con successo',
      data: opportunity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Aggiorna opportunità
 * @route   PUT /api/opportunities/:id
 * @access  Private (opportunity:update)
 */
export const updateOpportunity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      stage,
      estimatedValue,
      probability,
      expectedCloseDate,
      closedDate,
      closedReasonId,
      closedNotes,
      assignedUserId,
      notes,
      customFields,
    } = req.body;

    // Verifica esistenza opportunità
    const existingOpportunity = await prisma.opportunity.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingOpportunity) {
      res.status(404).json({
        success: false,
        message: 'Opportunità non trovata',
      });
      return;
    }

    // Se assignedUserId viene cambiato, verifica che l'utente esista
    if (assignedUserId && assignedUserId !== existingOpportunity.assignedUserId) {
      const user = await prisma.user.findUnique({
        where: { id: assignedUserId },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Utente assegnato non trovato',
        });
        return;
      }
    }

    // Prepara i dati per l'aggiornamento
    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (assignedUserId !== undefined) updateData.assignedUserId = assignedUserId;
    if (closedReasonId !== undefined) updateData.closedReasonId = closedReasonId;
    if (closedNotes !== undefined) updateData.closedNotes = closedNotes;

    // Se stage cambia, aggiorna lastStageChange
    if (stage !== undefined && stage !== existingOpportunity.stage) {
      updateData.stage = stage;
      updateData.lastStageChange = new Date();

      // Aggiorna probabilità se non fornita esplicitamente
      if (probability === undefined) {
        updateData.probability = STAGE_PROBABILITY_MAP[stage] || existingOpportunity.probability;
      }
    }

    if (probability !== undefined) updateData.probability = probability;

    if (estimatedValue !== undefined) {
      updateData.estimatedValue = estimatedValue ? new Prisma.Decimal(estimatedValue) : null;
    }

    if (expectedCloseDate !== undefined) {
      updateData.expectedCloseDate = expectedCloseDate ? new Date(expectedCloseDate) : null;
    }

    if (closedDate !== undefined) {
      updateData.closedDate = closedDate ? new Date(closedDate) : null;
    }

    if (customFields !== undefined) {
      updateData.customFields = JSON.parse(customFields);
    }

    // Ricalcola weighted value se necessario
    const finalEstimatedValue =
      estimatedValue !== undefined
        ? estimatedValue
          ? parseFloat(estimatedValue)
          : null
        : existingOpportunity.estimatedValue
        ? parseFloat(existingOpportunity.estimatedValue.toString())
        : null;

    const finalProbability =
      probability !== undefined ? probability : existingOpportunity.probability;

    updateData.weightedValue = new Prisma.Decimal(
      calculateWeightedValue(finalEstimatedValue, finalProbability)
    );

    // Aggiorna opportunità
    const opportunity = await prisma.opportunity.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        customer: {
          include: {
            company: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
        assignedUser: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Opportunità aggiornata con successo',
      data: opportunity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Aggiorna stage opportunità
 * @route   PATCH /api/opportunities/:id/stage
 * @access  Private (opportunity:update)
 */
export const updateStage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { stage, probability } = req.body;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: parseInt(id) },
    });

    if (!opportunity) {
      res.status(404).json({
        success: false,
        message: 'Opportunità non trovata',
      });
      return;
    }

    const finalProbability =
      probability !== undefined ? probability : STAGE_PROBABILITY_MAP[stage] || 0;

    const estimatedValue = opportunity.estimatedValue
      ? parseFloat(opportunity.estimatedValue.toString())
      : null;

    const weightedValue = calculateWeightedValue(estimatedValue, finalProbability);

    const updatedOpportunity = await prisma.opportunity.update({
      where: { id: parseInt(id) },
      data: {
        stage,
        probability: finalProbability,
        weightedValue: new Prisma.Decimal(weightedValue),
        lastStageChange: new Date(),
      },
      include: {
        customer: {
          include: {
            company: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Stage aggiornato con successo',
      data: updatedOpportunity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Chiudi opportunità come WON
 * @route   PATCH /api/opportunities/:id/close-won
 * @access  Private (opportunity:update)
 */
export const closeOpportunityWon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { closedDate, closedNotes } = req.body;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: parseInt(id) },
    });

    if (!opportunity) {
      res.status(404).json({
        success: false,
        message: 'Opportunità non trovata',
      });
      return;
    }

    const updatedOpportunity = await prisma.opportunity.update({
      where: { id: parseInt(id) },
      data: {
        status: 'WON',
        stage: 'COMMITMENT',
        probability: 100,
        closedDate: closedDate ? new Date(closedDate) : new Date(),
        closedNotes,
        weightedValue: opportunity.estimatedValue || new Prisma.Decimal(0),
      },
      include: {
        customer: {
          include: {
            company: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Opportunità chiusa come WON',
      data: updatedOpportunity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Chiudi opportunità come LOST
 * @route   PATCH /api/opportunities/:id/close-lost
 * @access  Private (opportunity:update)
 */
export const closeOpportunityLost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { closedReasonId, closedDate, closedNotes } = req.body;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: parseInt(id) },
    });

    if (!opportunity) {
      res.status(404).json({
        success: false,
        message: 'Opportunità non trovata',
      });
      return;
    }

    const updatedOpportunity = await prisma.opportunity.update({
      where: { id: parseInt(id) },
      data: {
        status: 'LOST',
        probability: 0,
        weightedValue: new Prisma.Decimal(0),
        closedDate: closedDate ? new Date(closedDate) : new Date(),
        closedReasonId,
        closedNotes,
      },
      include: {
        customer: {
          include: {
            company: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Opportunità chiusa come LOST',
      data: updatedOpportunity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assegna opportunità a utente
 * @route   PATCH /api/opportunities/:id/assign
 * @access  Private (opportunity:update)
 */
export const assignOpportunity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { assignedUserId } = req.body;

    const [opportunity, user] = await Promise.all([
      prisma.opportunity.findUnique({ where: { id: parseInt(id) } }),
      prisma.user.findUnique({ where: { id: assignedUserId } }),
    ]);

    if (!opportunity) {
      res.status(404).json({
        success: false,
        message: 'Opportunità non trovata',
      });
      return;
    }

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Utente non trovato',
      });
      return;
    }

    const updatedOpportunity = await prisma.opportunity.update({
      where: { id: parseInt(id) },
      data: { assignedUserId },
      include: {
        assignedUser: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Opportunità assegnata con successo',
      data: updatedOpportunity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Elimina opportunità
 * @route   DELETE /api/opportunities/:id
 * @access  Private (opportunity:delete)
 */
export const deleteOpportunity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: parseInt(id) },
      include: {
        documents: {
          select: { id: true },
        },
      },
    });

    if (!opportunity) {
      res.status(404).json({
        success: false,
        message: 'Opportunità non trovata',
      });
      return;
    }

    // Verifica se ha documenti associati
    if (opportunity.documents.length > 0) {
      res.status(400).json({
        success: false,
        message:
          'Impossibile eliminare: opportunità associata a documenti esistenti',
        documentsCount: opportunity.documents.length,
      });
      return;
    }

    await prisma.opportunity.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Opportunità eliminata con successo',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Ottieni statistiche pipeline
 * @route   GET /api/opportunities/stats/pipeline
 * @access  Private (opportunity:read)
 */
export const getPipelineStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { assignedUserId } = req.query;

    const where: Prisma.OpportunityWhereInput = {
      status: 'OPEN',
    };

    if (assignedUserId) {
      where.assignedUserId = parseInt(assignedUserId as string);
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      select: {
        stage: true,
        estimatedValue: true,
        weightedValue: true,
        probability: true,
      },
    });

    const stats: any = {
      total: opportunities.length,
      totalEstimatedValue: 0,
      totalWeightedValue: 0,
      byStage: {},
    };

    opportunities.forEach((opp) => {
      const stage = opp.stage;
      if (!stats.byStage[stage]) {
        stats.byStage[stage] = {
          count: 0,
          totalEstimatedValue: 0,
          totalWeightedValue: 0,
        };
      }

      stats.byStage[stage].count++;
      stats.byStage[stage].totalEstimatedValue += parseFloat(
        opp.estimatedValue?.toString() || '0'
      );
      stats.byStage[stage].totalWeightedValue += parseFloat(
        opp.weightedValue?.toString() || '0'
      );

      stats.totalEstimatedValue += parseFloat(opp.estimatedValue?.toString() || '0');
      stats.totalWeightedValue += parseFloat(opp.weightedValue?.toString() || '0');
    });

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};