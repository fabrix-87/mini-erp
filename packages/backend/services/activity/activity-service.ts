import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../config/prisma-config";
import { CompleteActivityInput } from "@mini-erp/shared/types";
import { clean } from "@/helpers/prisma-helper";

// ============================================================================
// ACTIVITY SERVICE
// ============================================================================

/**
 * Completes an activity and optionally creates a linked follow-up Activity.
 * If the activity is linked to a Lead, updates the Lead's lastContactDate.
 *
 * @param activityId - ID of the activity to complete
 * @param input - Completion data including optional follow-up definition
 * @param completedByUserId - ID of the user completing the activity
 * @returns The completed activity with its follow-up (if created)
 */
export async function completeActivity(
  activityId: number,
  input: CompleteActivityInput,
  completedByUserId: number,
) {
  const { outcome, result, internalNotes, followUp } = input;

  const existing = await prisma.activity.findUnique({
    where: { id: activityId },
  });

  if (!existing) return null;

  return prisma.$transaction(async (tx) => {
    // Build completion update
    let completionData = clean<Prisma.ActivityUpdateInput>({
      status: "COMPLETED",
      outcome,
      result,
      internalNotes: internalNotes ?? undefined,
      actualEnd: new Date(),
      actualStart: existing.actualStart ?? new Date(),
    });

    // Create follow-up Activity if requested
    if (followUp) {
      const followUpActivity = await tx.activity.create({
        data: {
          type: followUp.type,
          subject: followUp.subject,
          scheduledStart: new Date(followUp.scheduledStart),
          priority: followUp.priority ?? "MEDIUM",
          description: followUp.description ?? null,
          status: "SCHEDULED",
          // Inherit relations from parent activity
          leadId: existing.leadId,
          customerId: existing.customerId,
          companyId: existing.companyId,
          opportunityId: existing.opportunityId,
          contactId: existing.contactId,
          assignedUserId: followUp.assignedUserId ?? existing.assignedUserId,
          createdByUserId: completedByUserId,
        },
      });

      // Link parent → follow-up
      completionData = {
        ...completionData,
        followUpActivity: { connect: { id: followUpActivity.id } },
      };
    }

    // Complete the original activity
    const completed = await tx.activity.update({
      where: { id: activityId },
      data: completionData,
      include: {
        company: true,
        customer: true,
        opportunity: true,
        lead: { select: { id: true } },
        assignedUser: { select: { id: true, username: true, email: true } },
        followUpActivity: {
          select: { id: true, subject: true, scheduledStart: true, type: true },
        },
      },
    });

    // Side effect: update Lead.lastContactDate if linked
    if (completed.lead?.id) {
      await tx.lead.update({
        where: { id: completed.lead.id },
        data: { lastContactDate: new Date() },
      });
    }

    return completed;
  });
}