import type { Notification, TripActivity, User } from "../types";

type ActivityContext = "tripActivity" | "globalNotification";
type ActivityLike = Notification | TripActivity;

export function formatActivityMessage(
  activity: ActivityLike,
  currentUser: Pick<User, "id"> | null | undefined,
  context: ActivityContext,
) {
  const type = (activity.type ?? "").toUpperCase();
  const cleanMessage = removeEmojiArtifacts(activity.message);

  if (type === "TOMATO" || type === "TOMATO_THROWN") {
    const actor = activity.actorName || "Alguém";
    const target = activity.targetUserName || "um tripulante";

    if (context === "tripActivity") {
      return `${actor} jogou um tomate em ${target}.`;
    }

    const tripContext = activity.tripName ? ` na viagem ${activity.tripName}` : "";
    if (activity.targetUserId && activity.targetUserId === currentUser?.id) {
      return `${actor} jogou um tomate em você${tripContext}.`;
    }

    return `${actor} jogou um tomate em ${target}${tripContext}.`;
  }

  return cleanMessage;
}

export function formatRelativeTime(value?: string | null) {
  if (!value) return "agora";

  const createdAt = new Date(value);
  const diffMs = Date.now() - createdAt.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "agora";
  if (diffMinutes < 60) return `${diffMinutes} min atrás`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} h atrás`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} d atrás`;

  return createdAt.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function removeEmojiArtifacts(value: string) {
  return value
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/(?:ðŸ|âœ|âš|ï¸)[^\s]*/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
