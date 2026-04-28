import { Response, NextFunction } from "express";
import { prisma } from "../../config/prisma-config";
import { AuthenticatedValidatedRequest } from "@/types/validate-types";
import {
  sendCreated,
  sendDeleted,
  sendError,
  sendSuccess,
} from "@/utils/response-utils";
import asyncHandler from "@/middleware/async-handler-middleware";
import {
  ActivityIdAsActivityIdParam,
  CreateActivityParticipantInput,
  UpdateActivityParticipantInput,
} from "@mini-erp/shared";
import { clean } from "@/helpers/prisma";

// ============================================================================
// ACTIVITY PARTICIPANT CONTROLLER
// ============================================================================

/**
 * @desc    Get participants of an Activity
 * @route   GET /api/activities/:activityId/participants
 * @access  Private (activity:read)
 */
export const getActivityParticipants = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { activityId } = req.validatedParams as ActivityIdAsActivityIdParam;

    const activity = await prisma.activity.findUnique({
      where: { id: Number(activityId) },
    });
    if (!activity) {
      sendError(res, { statusCode: 404, message: "Activity non trovata" });
      return;
    }

    const participants = await prisma.activityParticipant.findMany({
      where: { activityId: Number(activityId) },
      include: {
        user: {
          select: { id: true, username: true, email: true, details: true },
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
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    });

    sendSuccess(res, participants, { results: participants.length });
  },
);

/**
 * @desc    Add participant to an Activity
 * @route   POST /api/activities/:activityId/participants
 * @access  Private (activity:update)
 */
export const addActivityParticipant = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const data = req.validatedBody as CreateActivityParticipantInput;

    const activity = await prisma.activity.findUnique({
      where: { id: data.activityId },
    });
    if (!activity) {
      sendError(res, { statusCode: 404, message: "Activity non trovata" });
      return;
    }

    if (data.userId) {
      const user = await prisma.user.findUnique({ where: { id: data.userId } });
      if (!user) {
        sendError(res, { statusCode: 404, message: "Utente non trovato" });
        return;
      }

      const existing = await prisma.activityParticipant.findFirst({
        where: { activityId: data.activityId, userId: data.userId },
      });
      if (existing) {
        sendError(res, {
          statusCode: 400,
          status: "fail",
          message: "Utente già presente come partecipante",
        });
        return;
      }
    }

    if (data.contactId) {
      const contact = await prisma.contact.findUnique({
        where: { id: data.contactId },
      });
      if (!contact) {
        sendError(res, { statusCode: 404, message: "Contact non trovato" });
        return;
      }

      const existing = await prisma.activityParticipant.findFirst({
        where: { activityId: data.activityId, contactId: data.contactId },
      });
      if (existing) {
        sendError(res, {
          statusCode: 400,
          status: "fail",
          message: "Contact già presente come partecipante",
        });
        return;
      }
    }

    const participant = await prisma.activityParticipant.create({
      data,
      include: {
        user: { select: { id: true, username: true, email: true } },
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    sendCreated(res, participant, "Partecipante aggiunto con successo");
  },
);

/**
 * @desc    Update participant
 * @route   PUT /api/activities/participants/:id
 * @access  Private (activity:update)
 */
export const updateActivityParticipant = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams;
    const data = req.validatedBody as UpdateActivityParticipantInput;

    const existing = await prisma.activityParticipant.findUnique({
      where: { id: Number(id) },
    });
    if (!existing) {
      sendError(res, { statusCode: 404, message: "Partecipante non trovato" });
      return;
    }

    // Auto-set responseDate when status changes
    const updateData = clean({
      ...data,
      responseDate:
        data.status && data.status !== existing.status ? new Date() : undefined,
    });

    const participant = await prisma.activityParticipant.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        user: { select: { id: true, username: true, email: true } },
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    sendSuccess(res, participant, {
      message: "Partecipante aggiornato con successo",
    });
  },
);

/**
 * @desc    Remove participant
 * @route   DELETE /api/activities/participants/:id
 * @access  Private (activity:update)
 */
export const removeActivityParticipant = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams;

    const participant = await prisma.activityParticipant.findUnique({
      where: { id: Number(id) },
    });
    if (!participant) {
      sendError(res, { statusCode: 404, message: "Partecipante non trovato" });
      return;
    }

    if (participant.role === "organizer") {
      sendError(res, {
        statusCode: 400,
        status: "fail",
        message: "Impossibile rimuovere l'organizer",
      });
      return;
    }

    await prisma.activityParticipant.delete({ where: { id: Number(id) } });

    sendDeleted(res, "Partecipante rimosso con successo");
  },
);

/**
 * @desc    Add multiple participants to an Activity
 * @route   POST /api/activities/:activityId/participants/bulk
 * @access  Private (activity:update)
 */
export const addBulkParticipants = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { activityId } = req.validatedParams as ActivityIdAsActivityIdParam;
    const { participants } = req.validatedBody as {
      participants: Array<
        Pick<
          CreateActivityParticipantInput,
          | "userId"
          | "contactId"
          | "externalEmail"
          | "externalName"
          | "role"
          | "status"
        >
      >;
    };

    if (!Array.isArray(participants) || participants.length === 0) {
      sendError(res, {
        statusCode: 400,
        status: "fail",
        message: "Array di partecipanti obbligatorio",
      });
      return;
    }

    const activity = await prisma.activity.findUnique({
      where: { id: Number(activityId) },
    });
    if (!activity) {
      sendError(res, { statusCode: 404, message: "Activity non trovata" });
      return;
    }

    const created = await prisma.$transaction(
      participants.map((p) =>
        prisma.activityParticipant.create({
          data: clean({
            activityId: Number(activityId),
            userId: p.userId,
            contactId: p.contactId,
            externalEmail: p.externalEmail,
            externalName: p.externalName,
            role: p.role ?? "participant",
            status: p.status ?? "invited",
          }),
          include: {
            user: { select: { id: true, username: true, email: true } },
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        }),
      ),
    );

    sendCreated(
      res,
      created,
      `${created.length} partecipanti aggiunti con successo`,
    );
  },
);
