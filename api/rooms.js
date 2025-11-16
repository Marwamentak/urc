import { sql } from "@vercel/postgres";
import { checkSession } from "../lib/session";

export default async function handler(req, res) {
    const ok = await checkSession(req);
    if (!ok) {
        return res.status(401).json({
            code: "UNAUTHORIZED",
            message: "Session expired",
        });
    }

    try {
        const { rows } =
            await sql`SELECT room_id::text AS id, name FROM rooms ORDER BY created_on ASC`;

        return res.status(200).json(rows);
    } catch (e) {
        return res.status(500).json({
            code: "SERVER_ERROR",
            error: String(e),
        });
    }
}
