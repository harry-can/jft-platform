
export function canAccessContent(params: {
  userPlan?: string | null;
  accessLevel?: string | null;
  isClassMember?: boolean;
}) {
  const level = params.accessLevel || "FREE";
  const plan = params.userPlan || "FREE";

  if (level === "FREE") return true;
  if (level === "PREMIUM") return plan === "PREMIUM" || plan === "INSTITUTE";
  if (level === "CLASS_ONLY") return !!params.isClassMember || plan === "INSTITUTE";

  return false;
}
