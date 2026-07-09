import { useEffect, useRef } from "react";
import { getHubConnection, joinTripGroup, leaveTripGroup, startConnection } from "../services/signalr";
import type { Notification, TripActivity } from "../types";

interface UseTripRealtimeOptions {
  tripId: string;
  onDashboardUpdated: () => void;
  onNotification?: (notification: Notification) => void;
  onActivity?: (activity: TripActivity) => void;
}

export function useTripRealtime({ tripId, onDashboardUpdated, onNotification, onActivity }: UseTripRealtimeOptions) {
  const callbackRef = useRef(onDashboardUpdated);
  callbackRef.current = onDashboardUpdated;

  const notifRef = useRef(onNotification);
  notifRef.current = onNotification;

  const activityRef = useRef(onActivity);
  activityRef.current = onActivity;

  useEffect(() => {
    if (!tripId) return;

    let active = true;

    async function connect() {
      await startConnection();
      if (!active) return;

      await joinTripGroup(tripId);

      const hub = getHubConnection();
      hub.on("dashboardUpdated", () => callbackRef.current());
      hub.on("notification", (n: Notification) => notifRef.current?.(n));
      hub.on("activity", (activity: TripActivity) => activityRef.current?.(activity));
    }

    connect();

    return () => {
      active = false;
      const hub = getHubConnection();
      hub.off("dashboardUpdated");
      hub.off("notification");
      hub.off("activity");
      leaveTripGroup(tripId);
    };
  }, [tripId]);
}
