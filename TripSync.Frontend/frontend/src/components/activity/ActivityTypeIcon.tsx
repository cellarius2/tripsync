import {
  BadgeCheck,
  Bell,
  CheckCircle2,
  CircleDot,
  ClipboardCheck,
  Coins,
  FileText,
  Plane,
  UserPlus,
  Vote,
  Wallet,
} from "lucide-react";
import TomatoIcon from "./TomatoIcon";

type ActivityTypeIconProps = {
  type?: string | null;
  className?: string;
  size?: number;
};

export default function ActivityTypeIcon({
  type,
  className,
  size = 20,
}: ActivityTypeIconProps) {
  const normalizedType = (type ?? "").toUpperCase();

  if (normalizedType === "TOMATO" || normalizedType === "TOMATO_THROWN") {
    return <TomatoIcon className={className} size={size} />;
  }

  if (normalizedType.includes("MEMBER") || normalizedType.includes("PARTICIPANT")) {
    return <UserPlus className={className} size={size} aria-hidden="true" />;
  }

  if (normalizedType.includes("DOCUMENT_APPROVED")) {
    return <BadgeCheck className={className} size={size} aria-hidden="true" />;
  }

  if (normalizedType.includes("DOCUMENT")) {
    return <FileText className={className} size={size} aria-hidden="true" />;
  }

  if (normalizedType.includes("TASK") || normalizedType.includes("CHECKLIST")) {
    return <ClipboardCheck className={className} size={size} aria-hidden="true" />;
  }

  if (normalizedType.includes("VOTE") || normalizedType.includes("POLL")) {
    return <Vote className={className} size={size} aria-hidden="true" />;
  }

  if (normalizedType.includes("CONTRIBUTION") || normalizedType.includes("SAVING")) {
    return <Coins className={className} size={size} aria-hidden="true" />;
  }

  if (normalizedType.includes("BUDGET") || normalizedType.includes("FINANCIAL")) {
    return <Wallet className={className} size={size} aria-hidden="true" />;
  }

  if (normalizedType.includes("TRIP")) {
    return <Plane className={className} size={size} aria-hidden="true" />;
  }

  if (normalizedType.includes("COMPLETED") || normalizedType.includes("PAID")) {
    return <CheckCircle2 className={className} size={size} aria-hidden="true" />;
  }

  if (!normalizedType) {
    return <Bell className={className} size={size} aria-hidden="true" />;
  }

  return <CircleDot className={className} size={size} aria-hidden="true" />;
}
