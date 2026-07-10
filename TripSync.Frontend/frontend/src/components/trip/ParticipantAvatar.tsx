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
  const imageSize = size === "lg" ? 112 : size === "sm" ? 52 : 76;

  if (avatar) {
    return (
      <div className={`trip-participant-avatar ${sizeClass} ${className}`}>
        <img
          src={avatar.src}
          alt={avatar.label}
          loading="lazy"
          decoding="async"
          width={imageSize}
          height={imageSize}
        />
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
