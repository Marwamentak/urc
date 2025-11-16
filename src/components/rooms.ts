export type Room = { id: string; name: string };

export async function fetchRoomsApi(token: string): Promise<Room[]> {
    console.log("[fetchRoomsApi] calling /api/rooms");
    const res = await fetch("/api/rooms", {
        headers: {
            Authentication: `Bearer ${token}`,
            Authorization: `Bearer ${token}`,
        },
    });

    console.log("[fetchRoomsApi] status:", res.status);
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error("[fetchRoomsApi] not ok:", res.status, txt);
        throw new Error(`Rooms API error ${res.status}`);
    }

    const data = (await res.json()) as Room[];
    console.log("[fetchRoomsApi] data:", data);
    return data;
}
