import tripSyncLogo from "../../assets/tripsync-logo.png";

type BrandProps = {
  subtitle?: string;
  userName?: string;
  compact?: boolean;
  className?: string;
};

export default function Brand({
  subtitle = "Planeje juntos. Viaje melhor.",
  userName,
  compact = false,
  className = "",
}: BrandProps) {
  return (
    <div className={`brand ${compact ? "brand-compact" : ""} ${className}`.trim()}>
      <img src={tripSyncLogo} alt="TripSync" className="brand-logo" />

      <div className="brand-text">
        <strong>TripSync</strong>
        <span>{userName ? `Olá, ${userName}` : subtitle}</span>
      </div>
    </div>
  );
}
