// /api/message.js
import { kv } from "@vercel/kv";
import { checkSession, unauthorizedResponse } from "../lib/session";
import { nanoid } from "nanoid";

export const config = { runtime: "edge" };

// Lecture JSON pour API Edge
async function readJson(req) {
    try {
        // l’API Edge a nativement req.json()
        return await req.json();
    } catch (e) {
        console.error("[/api/message] JSON parse error:", e);
        return {};
    }
}

export default async function handler(req) {
    try {
        const user = await checkSession(req);
        if (!user) {
            console.log("[/api/message] not connected");
            return unauthorizedResponse();
        }

        const { searchParams } = new URL(req.url);
        const method = req.method;

        // ------------------------
        // GET = récupérer messages
        // ------------------------
        if (method === "GET") {
            const peer = searchParams.get("peer");
            const room = searchParams.get("room");

            if (!peer && !room) {
                return new Response(JSON.stringify([]), {
                    status: 200,
                    headers: { "content-type": "application/json" },
                });
            }

            let key;

            if (peer) {
                const me = user.id;
                const a = Math.min(me, Number(peer));
                const b = Math.max(me, Number(peer));
                key = `dm:${a}:${b}`;
            } else {
                key = `room:${room}`;
            }

            const list = await kv.lrange(key, 0, -1);

            // IMPORTANT : certains éléments peuvent déjà être des objets
            const msgs = (list || [])
                .map((x) => {
                    if (!x) return null;
                    if (typeof x === "string") {
                        try {
                            return JSON.parse(x);
                        } catch (e) {
                            console.error("[/api/message] parse item error:", e, "value:", x);
                            return null;
                        }
                    }
                    // déjà un objet (ancien format)
                    return x;
                })
                .filter(Boolean);

            return new Response(JSON.stringify(msgs), {
                status: 200,
                headers: { "content-type": "application/json" },
            });
        }

        // ------------------------
        // POST = envoyer message
        // ------------------------
        if (method === "POST") {
            const body = await readJson(req);
            const { text, to, roomId } = body;

            if (!text) {
                return new Response(JSON.stringify({ error: "EMPTY_TEXT" }), {
                    status: 400,
                    headers: { "content-type": "application/json" },
                });
            }

            const msg = {
                id: nanoid(),
                from: user.id,
                to: to ?? null,
                roomId: roomId ?? null,
                text,
                created_at: new Date().toISOString(),
            };

            let key;

            if (to) {
                const me = user.id;
                const a = Math.min(me, Number(to));
                const b = Math.max(me, Number(to));
                key = `dm:${a}:${b}`;
            } else {
                key = `room:${roomId}`;
            }

            // on stocke toujours une string JSON pour l’avenir
            await kv.rpush(key, JSON.stringify(msg));

            return new Response(JSON.stringify(msg), {
                status: 200,
                headers: { "content-type": "application/json" },
            });
        }

        // Méthodes non autorisées
        return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
            status: 405,
            headers: { "content-type": "application/json" },
        });
    } catch (err) {
        console.error("[/api/message] ERROR:", err);
        return new Response(
            JSON.stringify({ error: "SERVER_ERROR", details: String(err) }),
            {
                status: 500,
                headers: { "content-type": "application/json" },
            }
        );
    }
}
