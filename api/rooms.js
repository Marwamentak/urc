
import { sql } from "@vercel/postgres";
import { checkSession, unauthorizedResponse } from "../lib/session";

export const config = {
    runtime: "edge",
};

export default async function handler(req) {
    const user = await checkSession(req);
    if (!user) {
        return unauthorizedResponse();
    }

    try {
        const { rows } =
            await sql`SELECT room_id::text AS id, name FROM rooms ORDER BY created_on ASC`;

        return new Response(JSON.stringify(rows), {
            status: 200,
            headers: { "content-type": "application/json" },
        });

    } catch (e) {
        console.error("[/api/rooms] ERROR:", e);
        return new Response(
            JSON.stringify({
                code: "SERVER_ERROR",
                error: String(e),
            }),
            {
                status: 500,
                headers: { "content-type": "application/json" },
            }
        );
    }
}
