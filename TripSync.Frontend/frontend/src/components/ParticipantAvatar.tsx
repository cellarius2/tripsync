interface ParticipantAvatarProps {
  name: string;
  color?: string | null;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

export default function ParticipantAvatar({ name, color, size = "md" }: ParticipantAvatarProps) {
  const initials = name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  return (
    <div
      className={`${sizeMap[size]} flex shrink-0 items-center justify-center rounded-full border-2 border-white font-mono font-semibold text-white shadow-sm`}
      style={{ backgroundColor: color ?? "#8f1d2c" }}
      title={name}
    >
      {initials}
    </div>
  );
}
