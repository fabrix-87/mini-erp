import { prisma } from "@/config/prisma-config";

/**
 * Helper: Update document total paid amount based on installments
 */
export async function updateDocumentPaidAmount(documentId: number) {
  const installments = await prisma.documentPaymentInstallment.findMany({
    where: { documentId },
    select: { paidAmount: true },
  });

  const totalPaid = installments.reduce(
    (sum, inst) => sum + Number(inst.paidAmount),
    0,
  );

  await prisma.document.update({
    where: { id: documentId },
    data: { paidAmount: totalPaid },
  });
}

/**
 * Check and update overdue installments
 * Run this as a scheduled job (e.g., daily cron)
 */
export async function updateOverdueInstallments() {
  const now = new Date();

  const result = await prisma.documentPaymentInstallment.updateMany({
    where: {
      status: "PENDING",
      dueDate: { lt: now },
    },
    data: {
      status: "OVERDUE",
    },
  });

  return result.count;
}

/**
 * Get installments requiring reminders
 */
export async function getInstallmentsForReminder(daysBefore: number = 3) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysBefore);

  return prisma.documentPaymentInstallment.findMany({
    where: {
      status: { in: ["PENDING", "PARTIAL"] },
      dueDate: {
        gte: new Date(),
        lte: targetDate,
      },
      remindersSent: { lt: 3 }, // Max 3 reminders
    },
    include: {
      document: {
        include: {
          customer: true,
        },
      },
    },
  });
}

/**
 * Send reminder and update counter
 */
export async function sendInstallmentReminder(installmentId: number) {
  // TODO: Implement email sending logic

  await prisma.documentPaymentInstallment.update({
    where: { id: installmentId },
    data: {
      remindersSent: { increment: 1 },
      lastReminderAt: new Date(),
    },
  });
}
