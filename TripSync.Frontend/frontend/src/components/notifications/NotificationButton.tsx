import { Bell, CheckCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { notificationService } from "../../services/notificationService";
import type { Notification } from "../../types";
import { formatRelativeTime } from "../../utils/activityMessages";
import ActivityTypeIcon from "../activity/ActivityTypeIcon";
import TomatoEffect from "../trip/TomatoEffect";

const POLLING_INTERVAL_MS = 30000;
const TOMATO_EFFECT_DURATION_MS = 2200;
const MAX_TOMATO_EFFECT_COUNT = 10;

type NotificationButtonProps = {
  tripId: string;
};

export default function NotificationButton({ tripId }: NotificationButtonProps) {
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tomatoEffectVisible, setTomatoEffectVisible] = useState(false);
  const [tomatoEffectCount, setTomatoEffectCount] = useState(1);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const tomatoEffectTimeoutRef = useRef<number | null>(null);

  const normalizedTripId = normalizeId(tripId);
  const normalizedUserId = normalizeId(user?.id);

  const filteredNotifications = useMemo(() => {
    if (!normalizedTripId) return [];

    return notifications.filter((notification) =>
      belongsToCurrentTrip(notification, normalizedTripId),
    );
  }, [notifications, normalizedTripId]);

  const unreadCount = useMemo(
    () => filteredNotifications.filter((notification) => !notification.isRead).length,
    [filteredNotifications],
  );

  useEffect(() => {
    if (!normalizedTripId) {
      setNotifications([]);
      return;
    }

    let active = true;

    async function load() {
      try {
        const data = await notificationService.list(tripId);

        if (!active) return;

        setNotifications(
          data.filter((notification) =>
            belongsToCurrentTrip(notification, normalizedTripId),
          ),
        );
      } catch {
        if (active) {
          setNotifications([]);
        }
      }
    }

    void load();

    const intervalId = window.setInterval(load, POLLING_INTERVAL_MS);

    function handleRealtime(event: Event) {
      const notification = (event as CustomEvent<Notification>).detail;

      if (!notification) return;

      const recipientUserId = normalizeId(notification.recipientUserId);

      if (recipientUserId && normalizedUserId && recipientUserId !== normalizedUserId) {
        return;
      }

      if (!belongsToCurrentTrip(notification, normalizedTripId)) {
        return;
      }

      setNotifications((current) => {
        if (notification.id && current.some((item) => item.id === notification.id)) {
          return current;
        }

        return [notification, ...current]
          .filter((item) => belongsToCurrentTrip(item, normalizedTripId))
          .slice(0, 50);
      });
    }

    window.addEventListener("tripsync:notification", handleRealtime);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("tripsync:notification", handleRealtime);
    };
  }, [tripId, normalizedTripId, normalizedUserId]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  useEffect(() => {
    return () => {
      if (tomatoEffectTimeoutRef.current) {
        window.clearTimeout(tomatoEffectTimeoutRef.current);
      }

      document.body.classList.remove("tomato-screen-shake");
    };
  }, []);

  async function toggleOpen() {
    const nextOpen = !open;

    const unreadTomatoCount = countUnreadTomatoesForCurrentUser(
      filteredNotifications,
      user?.id,
    );

    const shouldPlayTomatoEffect = nextOpen && unreadTomatoCount > 0;

    setOpen(nextOpen);

    if (shouldPlayTomatoEffect) {
      playTomatoEffect(unreadTomatoCount);
    }

    if (!nextOpen || unreadCount === 0) return;

    setNotifications((current) =>
      current.map((notification) => {
        if (!belongsToCurrentTrip(notification, normalizedTripId)) {
          return notification;
        }

        return {
          ...notification,
          isRead: true,
        };
      }),
    );

    try {
      await notificationService.markAllAsRead(tripId);
    } catch {
      await notificationService
        .list(tripId)
        .then((data) =>
          setNotifications(
            data.filter((notification) =>
              belongsToCurrentTrip(notification, normalizedTripId),
            ),
          ),
        )
        .catch(() => undefined);
    }
  }

  function playTomatoEffect(count: number) {
    if (tomatoEffectTimeoutRef.current) {
      window.clearTimeout(tomatoEffectTimeoutRef.current);
    }

    const safeCount = Math.min(Math.max(count, 1), MAX_TOMATO_EFFECT_COUNT);

    setTomatoEffectCount(safeCount);
    setTomatoEffectVisible(true);
    document.body.classList.add("tomato-screen-shake");

    tomatoEffectTimeoutRef.current = window.setTimeout(() => {
      setTomatoEffectVisible(false);
      document.body.classList.remove("tomato-screen-shake");
      tomatoEffectTimeoutRef.current = null;
    }, TOMATO_EFFECT_DURATION_MS);
  }

  return (
    <div className="notification-root" ref={dropdownRef}>
      <TomatoEffect
        active={tomatoEffectVisible}
        count={tomatoEffectCount}
        message={
          tomatoEffectCount === 1
            ? "Você levou um tomate!"
            : `Você levou ${tomatoEffectCount} tomates!`
        }
      />

      <button
        type="button"
        onClick={toggleOpen}
        className="navbar-action-btn notification-trigger"
        aria-expanded={open}
        aria-label="Notificações"
      >
        <Bell
          className="notification-trigger-icon"
          size={18}
          strokeWidth={2.1}
          aria-hidden="true"
        />


        {unreadCount > 0 && (
          <span
            className="notification-badge"
            aria-label={`${unreadCount} notificações não lidas`}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <div>
              <p>Suas notificações</p>
              <span>Atualizações desta viagem</span>
            </div>

            {unreadCount === 0 && filteredNotifications.length > 0 && (
              <CheckCheck size={18} aria-label="Todas visualizadas" />
            )}
          </div>

          <div className="notification-list">
            {filteredNotifications.length === 0 ? (
              <div className="notification-empty">
                <Bell size={22} aria-hidden="true" />
                <span>Nenhuma notificação nesta viagem.</span>
              </div>
            ) : (
              filteredNotifications.map((notification, index) => (
                <article
                  key={notification.id ?? `${notification.createdAt}-${index}`}
                  className={`notification-item ${notification.isRead ? "is-read" : "is-unread"
                    }`}
                >
                  <span className="notification-icon">
                    <ActivityTypeIcon type={notification.type} size={19} />
                  </span>

                  <div className="notification-item-copy">
                    <p>{formatNotificationMessage(notification, user?.id)}</p>
                    <span>{formatRelativeTime(notification.createdAt)}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function belongsToCurrentTrip(notification: Notification, currentTripId: string) {
  const notificationTripId = normalizeId(notification.tripId);

  return Boolean(notificationTripId) && notificationTripId === currentTripId;
}

function countUnreadTomatoesForCurrentUser(
  notifications: Notification[],
  currentUserId?: string,
) {
  const loggedUserId = normalizeId(currentUserId);

  if (!loggedUserId) return 0;

  const count = notifications.filter((notification) => {
    if (notification.isRead) return false;
    if (!isTomatoNotification(notification)) return false;

    const targetUserId = normalizeId(notification.targetUserId);

    return Boolean(targetUserId) && targetUserId === loggedUserId;
  }).length;

  return Math.min(count, MAX_TOMATO_EFFECT_COUNT);
}

function formatNotificationMessage(notification: Notification, currentUserId?: string) {
  if (isTomatoNotification(notification)) {
    return formatTomatoNotification(notification, currentUserId);
  }

  return notification.message || "Nova notificação.";
}

function formatTomatoNotification(notification: Notification, currentUserId?: string) {
  const actorName =
    cleanName(notification.actorName) ||
    extractActorNameFromMessage(notification.message) ||
    "Um tripulante";

  const targetUserId = normalizeId(notification.targetUserId);
  const loggedUserId = normalizeId(currentUserId);

  const isCurrentUserTarget =
    Boolean(targetUserId) &&
    Boolean(loggedUserId) &&
    targetUserId === loggedUserId;

  if (isCurrentUserTarget) {
    return `${actorName} jogou um tomate em você.`;
  }

  const targetUserName =
    cleanName(notification.targetUserName) ||
    extractTargetNameFromMessage(notification.message);

  if (targetUserName) {
    return `${actorName} jogou um tomate em ${targetUserName}.`;
  }

  return `${actorName} jogou um tomate em um tripulante.`;
}

function isTomatoNotification(notification: Notification) {
  const type = normalizeText(notification.type);
  return type === "TOMATO" || type === "TOMATO_THROWN";
}

function normalizeId(value?: string | null) {
  return value?.trim().toLowerCase() || "";
}

function normalizeText(value?: string | null) {
  return value?.trim().toUpperCase() || "";
}

function cleanName(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) return null;

  const normalized = trimmed.toLowerCase();

  if (
    normalized === "você" ||
    normalized === "voce" ||
    normalized === "outro tripulante" ||
    normalized === "um tripulante" ||
    normalized === "alguém" ||
    normalized === "alguem"
  ) {
    return null;
  }

  return trimmed;
}

function extractActorNameFromMessage(message?: string | null) {
  if (!message) return null;

  const match = message.match(/^(.+?)\s+jogou\s+um\s+tomate/i);
  return cleanName(match?.[1]);
}

function extractTargetNameFromMessage(message?: string | null) {
  if (!message) return null;

  const match = message.match(
    /jogou\s+um\s+tomate\s+em\s+(.+?)(?:\s+na\s+viagem\s+.+)?\.?$/i,
  );

  return cleanName(match?.[1]);
}
