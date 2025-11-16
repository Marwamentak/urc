import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

/* ---------------- GET CONNECTED USER ---------------- */
export async function getConnecterUser(request) {
    const headers = new Headers(request.headers);

    let token = headers.get("Authentication");
    if (!token) return null;

    token = token.replace("Bearer ", "");

    const user = await redis.get(token);
    return user ?? null;
}

/* ---------------- CHECK SESSION ---------------- */
export async function checkSession(request) {
    // ❗ ON RENVOIE LE USER ENTIER
    return await getConnecterUser(request);
}

/* ---------------- RESPONSE HELPERS ---------------- */
export function unauthorizedResponse() {
    return new Response(
        JSON.stringify({
            code: "UNAUTHORIZED",
            message: "Session expired",
        }),
        {
            status: 401,
            headers: { "content-type": "application/json" },
        }
    );
}
