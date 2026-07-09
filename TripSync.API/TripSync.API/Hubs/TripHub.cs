using Microsoft.AspNetCore.SignalR;

namespace TripSync.API.Hubs;

/// <summary>
/// Cada viagem usa um grupo para atualizações coletivas. Notificações pessoais
/// são enviadas pelo identificador do usuário autenticado.
/// </summary>
public class TripHub : Hub
{
    public async Task JoinTripGroup(string tripId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, tripId);
    }

    public async Task LeaveTripGroup(string tripId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, tripId);
    }
}
