import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection | null = null;

/**
 * Cria (ou reaproveita) a conexão SignalR autenticada com o token JWT atual.
 * O token vai via query string porque WebSockets não suportam header customizado.
 */
export function getHubConnection(): signalR.HubConnection {
  if (connection) return connection;

  const token = localStorage.getItem("tripsync_token") ?? "";

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${import.meta.env.VITE_HUB_URL}?access_token=${token}`, {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  return connection;
}

export async function startConnection(): Promise<void> {
  const hub = getHubConnection();
  if (hub.state === signalR.HubConnectionState.Disconnected) {
    await hub.start();
  }
}

export async function joinTripGroup(tripId: string): Promise<void> {
  const hub = getHubConnection();
  await startConnection();
  await hub.invoke("JoinTripGroup", tripId);
}

export async function leaveTripGroup(tripId: string): Promise<void> {
  const hub = getHubConnection();
  if (hub.state === signalR.HubConnectionState.Connected) {
    await hub.invoke("LeaveTripGroup", tripId);
  }
}

export function stopConnection(): void {
  connection?.stop();
  connection = null;
}