import { prisma } from "../config/db";

/**
 * Generates a sequential, human-readable challan number of the form
 * CH-YYYYMM-0001. Sequence resets every calendar month.
 */
export async function generateChallanNumber(): Promise<string> {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prefix = `CH-${yearMonth}-`;

  const lastChallan = await prisma.challan.findFirst({
    where: { challanNumber: { startsWith: prefix } },
    orderBy: { challanNumber: "desc" },
  });

  let nextSeq = 1;
  if (lastChallan) {
    const lastSeq = parseInt(lastChallan.challanNumber.split("-").pop() || "0", 10);
    nextSeq = lastSeq + 1;
  }

  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}
