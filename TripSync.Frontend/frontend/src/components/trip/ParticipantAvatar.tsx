import { getAvatarByKey } from "../../data/avatarOptions";

type ParticipantAvatarProps = {
  name?: string | null;
  avatarKey?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export default function ParticipantAvatar({
  name,
  avatarKey,
  size = "md",
  className = "",
}: ParticipantAvatarProps) {
  const avatar = getAvatarByKey(avatarKey);
  const displayName = name?.trim() || "Tripulante";
  const initial = displayName.charAt(0).toUpperCase() || "?";
  const sizeClass = `trip-participant-avatar-${size}`;

  if (avatar) {
    return (
      <div className={`trip-participant-avatar ${sizeClass} ${className}`}>
        <img src={avatar.src} alt={avatar.label} />
      </div>
    );
  }

  return (
    <div
      className={`trip-participant-avatar trip-participant-avatar-fallback ${sizeClass} ${className}`}
      aria-label={`Avatar de ${displayName}`}
    >
      {initial}
    </div>
  );
}
