import { prisma } from "../../config/prisma-config";
import {
  sendCreated,
  sendDeleted,
  sendError,
  sendNotFound,
  sendSuccess,
} from "@/utils/response-utils";
import {
  ActivityIdAsActivityIdParam,
  ActivityIdParam,
  CreateActivityParticipantInput,
  UpdateActivityParticipantInput,
} from "@mini-erp/shared";
import { clean } from "@/helpers/prisma-helper";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import { getValidatedBody, getValidatedParams } from "@/helpers/validated-context";

// ============================================================================
// ACTIVITY PARTICIPANT CONTROLLER
// ============================================================================

/**
 * @desc    Get participants of an Activity
 * @route   GET /api/activities/:activityId/participants
 * @access  Private (activity:read)
 */
export const getActivityParticipants = async (c: Context<AppBindings>) => {
  const { activityId } = getValidatedParams<ActivityIdAsActivityIdParam>(c);

  const activity = await prisma.activity.findUnique({
    where: { id: Number(activityId) },
  });
  if (!activity) {
    return sendNotFound(c, "Activity non trovata");
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

  return sendSuccess(c, participants, { results: participants.length });
};

/**
 * @desc    Add participant to an Activity
 * @route   POST /api/activities/:activityId/participants
 * @access  Private (activity:update)
 */
export const addActivityParticipant = async (c: Context<AppBindings>) => {
  const data = getValidatedBody<CreateActivityParticipantInput>(c);

  const activity = await prisma.activity.findUnique({
    where: { id: data.activityId },
  });
  if (!activity) {
    return sendNotFound(c, "Activity non trovata");
  }

  if (data.userId) {
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      return sendNotFound(c, "Utente non trovato");
    }

    const existing = await prisma.activityParticipant.findFirst({
      where: { activityId: data.activityId, userId: data.userId },
    });
    if (existing) {
      return sendError(c, {
        statusCode: 400,
        status: "fail",
        message: "Utente già presente come partecipante",
      });
    }
  }

  if (data.contactId) {
    const contact = await prisma.contact.findUnique({
      where: { id: data.contactId },
    });
    if (!contact) {
      return sendNotFound(c, "Contact non trovato");
    }

    const existing = await prisma.activityParticipant.findFirst({
      where: { activityId: data.activityId, contactId: data.contactId },
    });
    if (existing) {
      return sendError(c, {
        statusCode: 400,
        status: "fail",
        message: "Contact già presente come partecipante",
      });
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

  return sendCreated(c, participant, "Partecipante aggiunto con successo");
};

/**
 * @desc    Update participant
 * @route   PUT /api/activities/participants/:id
 * @access  Private (activity:update)
 */
export const updateActivityParticipant = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ActivityIdParam>(c);
  const data = getValidatedBody<UpdateActivityParticipantInput>(c);

  const existing = await prisma.activityParticipant.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) {
    return sendNotFound(c, "Partecipante non trovato");
  }

  // Auto-set responseDate when status changes
  const updateData = clean({
    ...data,
    responseDate: data.status && data.status !== existing.status ? new Date() : undefined,
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

  return sendSuccess(c, participant, {
    message: "Partecipante aggiornato con successo",
  });
};

/**
 * @desc    Remove participant
 * @route   DELETE /api/activities/participants/:id
 * @access  Private (activity:update)
 */
export const removeActivityParticipant = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ActivityIdParam>(c);

  const participant = await prisma.activityParticipant.findUnique({
    where: { id: Number(id) },
  });
  if (!participant) {
    return sendNotFound(c, "Partecipante non trovato");
  }

  if (participant.role === "organizer") {
    return sendError(c, {
      statusCode: 400,
      status: "fail",
      message: "Impossibile rimuovere l'organizer",
    });
  }

  await prisma.activityParticipant.delete({ where: { id: Number(id) } });

  return sendDeleted(c, "Partecipante rimosso con successo");
};

/**
 * @desc    Add multiple participants to an Activity
 * @route   POST /api/activities/:activityId/participants/bulk
 * @access  Private (activity:update)
 */
export const addBulkParticipants = async (c: Context<AppBindings>) => {
  const { activityId } = getValidatedParams<ActivityIdAsActivityIdParam>(c);
  const { participants } = getValidatedBody<{
    participants: Array<
      Pick<
        CreateActivityParticipantInput,
        "userId" | "contactId" | "externalEmail" | "externalName" | "role" | "status"
      >
    >;
  }>(c);

  if (!Array.isArray(participants) || participants.length === 0) {
    return sendError(c, {
      statusCode: 400,
      status: "fail",
      message: "Array di partecipanti obbligatorio",
    });
  }

  const activity = await prisma.activity.findUnique({
    where: { id: Number(activityId) },
  });
  if (!activity) {
    return sendNotFound(c, "Activity non trovata");
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

  return sendCreated(c, created, `${created.length} partecipanti aggiunti con successo`);
};
