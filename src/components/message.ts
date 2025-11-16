
export type Message = {
    id: string;
    from: number;
    to?: number | null;
    roomId?: string | null;
    text: string;
    created_at: string;
};


export async function fetchMessagesWithUser(token: string, peerUserId: number): Promise<Message[]> {
    const res = await fetch(`/api/message?peer=${peerUserId}`, {
        headers: { Authentication: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Fetch DM failed: ${res.status}`);
    return res.json();
}


export async function fetchMessagesInRoom(token: string, roomId: string): Promise<Message[]> {
    const res = await fetch(`/api/message?room=${encodeURIComponent(roomId)}`, {
        headers: { Authentication: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Fetch room failed: ${res.status}`);
    return res.json();
}


export async function sendMessageToUser(token: string, peerUserId: number, text: string): Promise<Message> {
    const res = await fetch(`/api/message`, {
        method: "POST",
        headers: {
            Authentication: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ to: peerUserId, text }),
    });
    if (!res.ok) throw new Error(`Send DM failed: ${res.status}`);
    return res.json();
}


export async function sendMessageToRoom(token: string, roomId: string, text: string): Promise<Message> {
    const res = await fetch(`/api/message`, {
        method: "POST",
        headers: {
            Authentication: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomId, text }),
    });
    if (!res.ok) throw new Error(`Send room failed: ${res.status}`);
    return res.json();
}
