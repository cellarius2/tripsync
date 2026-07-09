import { CalendarDays, MapPin, Users } from "lucide-react";
import type { TripListItem } from "../types";

type TripCardProps = {
  trip: TripListItem;
  onOpen: () => void;
};

export default function TripCard({ trip, onOpen }: TripCardProps) {
  return (
    <article className="trip-list-card">
      <div className="trip-list-card-header">
        <span className="trip-type-badge">
          {trip.type === 0 ? "Nacional" : "Internacional"}
        </span>
        <span className="trip-participants-count">
          <Users size={14} aria-hidden="true" />
          {trip.participantsCount} {trip.participantsCount === 1 ? "participante" : "participantes"}
        </span>
      </div>

      <div className="trip-list-card-main">
        <h2>{trip.name}</h2>
        <p><MapPin size={15} aria-hidden="true" /><span>{trip.destination}</span></p>
        <p><CalendarDays size={15} aria-hidden="true" /><span>{formatDate(trip.startDate)} a {formatDate(trip.endDate)}</span></p>
      </div>

      <div className="trip-code-box">
        <span>Código de convite</span>
        <strong>{trip.inviteCode}</strong>
      </div>

      <button type="button" className="trip-open-button" onClick={onOpen}>
        Abrir viagem
      </button>
    </article>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
