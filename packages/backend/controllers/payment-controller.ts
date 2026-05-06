import { prisma } from "../config/prisma-config";
import { Prisma } from "../generated/prisma/client";
import {
  CalculateDueDatesInput,
  CreatePaymentMethodInput,
  PaymentMethodIdParam,
  PaymentQueryInput,
  TogglePaymentStatusInput,
  UpdatePaymentMethodInput,
  UpdatePaymentTermDetailsInput,
} from "@mini-erp/shared";
import {
  sendCreated,
  sendDeleted,
  sendFail,
  sendNotFound,
  sendPaginatedResponse,
  sendSuccess,
} from "@/utils/response-utils";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import {
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "@/helpers/validated-context";

// ============================================================================
// PAYMENT METHOD CONTROLLER
// ============================================================================

/**
 * @desc    Ottieni tutti i Payment Methods
 * @route   GET /api/payment-methods
 * @access  Private (payment:read)
 */
export const getAllPaymentMethods = async (c: Context<AppBindings>) => {
  const {
    active,
    sortBy = "position",
    sortOrder = "asc",
  } = getValidatedQuery<PaymentQueryInput>(c);

  const where: Prisma.PaymentMethodWhereInput = {};

  if (active !== undefined) {
    where.active = active === true;
  }

  const paymentMethods = await prisma.paymentMethod.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
    include: {
      translations: {
        include: {
          language: {
            select: {
              id: true,
              name: true,
              iso_code: true,
            },
          },
        },
      },
      details: {
        orderBy: { position: "asc" },
      },
    },
  });

  return sendPaginatedResponse(c, paymentMethods, paymentMethods.length, 1, paymentMethods.length);
};

/**
 * @desc    Ottieni Payment Method per ID
 * @route   GET /api/payment-methods/:id
 * @access  Private (payment:read)
 */
export const getPaymentMethodById = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<PaymentMethodIdParam>(c);

  const paymentMethod = await prisma.paymentMethod.findUnique({
    where: { id },
    include: {
      translations: {
        include: {
          language: true,
        },
      },
      details: {
        orderBy: { position: "asc" },
      },
      customers: {
        select: {
          id: true,
          company: {
            select: {
              id: true,
              companyName: true,
            },
          },
        },
        take: 10,
      },
      documents: {
        select: {
          id: true,
          documentNumber: true,
          documentType: true,
        },
        take: 10,
      },
    },
  });

  if (!paymentMethod) {
    return sendNotFound(c, "Payment Method non trovato");
  }

  return sendSuccess(c, paymentMethod);
};

/**
 * @desc    Crea nuovo Payment Method
 * @route   POST /api/payment-methods
 * @access  Private (payment:create)
 */
export const createPaymentMethod = async (c: Context<AppBindings>) => {
  const {
    code,
    active = true,
    position = 0,
    translations,
    details,
  } = getValidatedBody<CreatePaymentMethodInput>(c);

  // Verifica unicità code
  const existingCode = await prisma.paymentMethod.findUnique({
    where: { code },
  });

  if (existingCode) {
    return sendFail(c, {
      message: "Codice già esistente",
    });
  }

  // Verifica che almeno una traduzione sia presente
  if (!translations || translations.length === 0) {
    return sendFail(c, {
      message: "Almeno una traduzione è obbligatoria",
    });
  }

  // Verifica che le lingue esistano
  const languageIds = translations.map((t: any) => t.languageId);
  const languages = await prisma.language.findMany({
    where: { id: { in: languageIds } },
  });

  if (languages.length !== languageIds.length) {
    return sendFail(c, {
      message: "Una o più lingue non trovate",
    });
  }

  // Validazione percentuali details (devono sommare 100)
  if (details && details.length > 0) {
    const totalPercentage = details.reduce(
      (sum: number, d: any) => sum + parseFloat(d.percentage),
      0,
    );

    if (Math.abs(totalPercentage - 100) > 0.01) {
      return sendFail(c, {
        message: `La somma delle percentuali deve essere 100. Somma attuale ${totalPercentage}`,
      });
    }
  }

  const paymentMethod = await prisma.paymentMethod.create({
    data: {
      code,
      active,
      position,
      translations: {
        create: translations.map((t: any) => ({
          languageId: t.languageId,
          name: t.name,
          description: t.description,
        })),
      },
      details: details
        ? {
            create: details.map((d: any, index: number) => ({
              percentage: new Prisma.Decimal(d.percentage),
              termType: d.termType || "days_from_invoice",
              dueDays: d.dueDays || 0,
              isEndOfMonth: d.isEndOfMonth || false,
              isFixedDate: d.isFixedDate || false,
              fixedDay: d.fixedDay,
              fixedMonthOffset: d.fixedMonthOffset || 0,
              position: d.position !== undefined ? d.position : index,
            })),
          }
        : undefined,
    },
    include: {
      translations: {
        include: {
          language: true,
        },
      },
      details: {
        orderBy: { position: "asc" },
      },
    },
  });

  return sendSuccess(c, paymentMethod, {
    message: "Payment Method creato con successo",
  });
};

/**
 * @desc    Aggiorna Payment Method
 * @route   PUT /api/payment-methods/:id
 * @access  Private (payment:update)
 */
export const updatePaymentMethod = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<PaymentMethodIdParam>(c);
  const { code, active, position, translations } = getValidatedBody<UpdatePaymentMethodInput>(c);

  const existingPaymentMethod = await prisma.paymentMethod.findUnique({
    where: { id },
  });

  if (!existingPaymentMethod) {
    return sendNotFound(c, "Payment Method non trovato");
  }

  // Se code cambia, verifica unicità
  if (code && code !== existingPaymentMethod.code) {
    const duplicateCode = await prisma.paymentMethod.findUnique({
      where: { code },
    });

    if (duplicateCode) {
      return sendFail(c, {
        message: "Codice già esistente",
      });
    }
  }

  const updateData: any = {};
  if (code !== undefined) updateData.code = code;
  if (active !== undefined) updateData.active = active;
  if (position !== undefined) updateData.position = position;

  // Gestione traduzioni (se fornite, sostituiscile completamente)
  if (translations && translations.length > 0) {
    // Elimina traduzioni esistenti
    await prisma.paymentMethodTranslation.deleteMany({
      where: { paymentMethodId: id },
    });

    updateData.translations = {
      create: translations.map((t: any) => ({
        languageId: t.languageId,
        name: t.name,
        description: t.description,
      })),
    };
  }

  const paymentMethod = await prisma.paymentMethod.update({
    where: { id },
    data: updateData,
    include: {
      translations: {
        include: {
          language: true,
        },
      },
      details: {
        orderBy: { position: "asc" },
      },
    },
  });

  return sendSuccess(c, paymentMethod, {
    message: "Payment Method aggiornato con successo",
  });
};

/**
 * @desc    Aggiorna Payment Term Details
 * @route   PUT /api/payment-methods/:id/details
 * @access  Private (payment:update)
 */
export const updatePaymentTermDetails = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<PaymentMethodIdParam>(c);
  const { details } = getValidatedBody<UpdatePaymentTermDetailsInput>(c);

  const paymentMethod = await prisma.paymentMethod.findUnique({
    where: { id },
  });

  if (!paymentMethod) {
    return sendNotFound(c, "Payment Method non trovato");
  }

  // Validazione percentuali (devono sommare 100)
  const totalPercentage = details.reduce(
    (sum: number, d: any) => sum + parseFloat(d.percentage),
    0,
  );

  if (Math.abs(totalPercentage - 100) > 0.01) {
    return sendFail(c, {
      message: `La somma delle percentuali deve essere 100. Somma attuale ${totalPercentage}`,
    });
  }

  // Elimina dettagli esistenti
  await prisma.paymentTermDetail.deleteMany({
    where: { paymentMethodId: id },
  });

  // Crea nuovi dettagli
  const updatedPaymentMethod = await prisma.paymentMethod.update({
    where: { id },
    data: {
      details: {
        create: details.map((d: any, index: number) => ({
          percentage: new Prisma.Decimal(d.percentage),
          termType: d.termType || "days_from_invoice",
          dueDays: d.dueDays || 0,
          isEndOfMonth: d.isEndOfMonth || false,
          isFixedDate: d.isFixedDate || false,
          fixedDay: d.fixedDay,
          fixedMonthOffset: d.fixedMonthOffset || 0,
          position: d.position !== undefined ? d.position : index,
        })),
      },
    },
    include: {
      translations: true,
      details: {
        orderBy: { position: "asc" },
      },
    },
  });

  return sendSuccess(c, updatedPaymentMethod, {
    message: "Payment Term Details aggiornati con successo",
  });
};

/**
 * @desc    Toggle active status Payment Method
 * @route   PATCH /api/payment-methods/:id/toggle-active
 * @access  Private (payment:update)
 */
export const togglePaymentMethodActive = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<PaymentMethodIdParam>(c);
  const { active } = getValidatedBody<TogglePaymentStatusInput>(c);

  const paymentMethod = await prisma.paymentMethod.findUnique({
    where: { id },
  });

  if (!paymentMethod) {
    return sendNotFound(c, "Payment Method non trovato");
  }

  const updatedPaymentMethod = await prisma.paymentMethod.update({
    where: { id },
    data: { active },
    include: {
      translations: true,
    },
  });

  return sendSuccess(c, updatedPaymentMethod, {
    message: `Payment Method ${active ? "attivato" : "disattivato"} con successo`,
  });
};

/**
 * @desc    Elimina Payment Method
 * @route   DELETE /api/payment-methods/:id
 * @access  Private (payment:delete)
 */
export const deletePaymentMethod = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<PaymentMethodIdParam>(c);

  const paymentMethod = await prisma.paymentMethod.findUnique({
    where: { id },
    include: {
      customers: { select: { id: true } },
      documents: { select: { id: true } },
    },
  });

  if (!paymentMethod) {
    return sendNotFound(c, "Payment Method non trovato");
  }

  const totalUsage = paymentMethod.customers.length + paymentMethod.documents.length;

  if (totalUsage > 0) {
    return sendFail(c, {
      message: `Impossibile eliminare: Payment Method in uso: (${paymentMethod.customers.length}) Clienti, (${paymentMethod.documents.length}) Documenti`,
    });
  }

  await prisma.paymentMethod.delete({
    where: { id },
  });

  return sendDeleted(c, "Payment Method eliminato con successo");
};

/**
 * @desc    Calcola date scadenza per un importo
 * @route   POST /api/payment-methods/:id/calculate-due-dates
 * @access  Private (payment:read)
 */
export const calculateDueDates = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<PaymentMethodIdParam>(c);
  const { invoiceDate, totalAmount } = getValidatedBody<CalculateDueDatesInput>(c);

  const paymentMethod = await prisma.paymentMethod.findUnique({
    where: { id },
    include: {
      details: {
        orderBy: { position: "asc" },
      },
    },
  });

  if (!paymentMethod) {
    return sendNotFound(c, "Payment Method non trovato");
  }

  if (!paymentMethod.details || paymentMethod.details.length === 0) {
    return sendFail(c, {
      message: "Payment Method non ha dettagli configurati",
    });
  }

  const baseDate = invoiceDate ? new Date(invoiceDate) : new Date();
  const amount = totalAmount;

  const installments = paymentMethod.details.map((detail, index) => {
    const installmentAmount = (amount * parseFloat(detail.percentage.toString())) / 100;

    let dueDate = new Date(baseDate);

    switch (detail.termType) {
      case "anticipated":
        // Data fattura stessa
        break;

      case "days_from_invoice":
        dueDate.setDate(dueDate.getDate() + detail.dueDays);
        if (detail.isEndOfMonth) {
          dueDate = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0);
        }
        break;

      case "end_of_month":
        dueDate = new Date(
          dueDate.getFullYear(),
          dueDate.getMonth() + 1 + detail.fixedMonthOffset,
          0,
        );
        break;

      case "fixed_date":
        if (detail.fixedDay) {
          dueDate = new Date(
            dueDate.getFullYear(),
            dueDate.getMonth() + detail.fixedMonthOffset,
            detail.fixedDay,
          );
        }
        break;
    }

    return {
      installmentNumber: index + 1,
      percentage: parseFloat(detail.percentage.toString()),
      amount: installmentAmount.toFixed(2),
      dueDate: dueDate.toISOString(),
      termType: detail.termType,
      dueDays: detail.dueDays,
    };
  });

  return sendCreated(c, {
    paymentMethodCode: paymentMethod.code,
    totalAmount: amount,
    installments,
  });
};
