import { Badge } from "@/Shared/Badge";

export const BOOKING_STATUS = {
  confirmed: { variant: "success", label: "Confirmed" },
  pending: { variant: "warning", label: "Pending" },
  completed: { variant: "neutral", label: "Completed" },
  cancelled: { variant: "danger", label: "Cancelled" },
};

export const getStatusBadge = (status, t) => {
  const cfg = BOOKING_STATUS[status];
  if (!cfg) return null;
  return <Badge variant={cfg.variant}>{t(cfg.label)}</Badge>;
};
