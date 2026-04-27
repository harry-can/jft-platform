
import { prisma } from "@/lib/prisma";
import { AuditAction } from "@/generated/prisma/client";

export async function auditLog(params: {
  actorId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  message: string;
  metadata?: any;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        message: params.message,
        metadata: params.metadata || undefined,
      },
    });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
}
