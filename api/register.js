import { db } from '@vercel/postgres';
import { Redis } from '@upstash/redis';
import { arrayBufferToBase64, stringToArrayBuffer } from '../lib/base64';

export const config = {
    runtime: 'edge',
};

const redis = Redis.fromEnv();

export default async function handler(request) {
    try {
        const { username, email, password } = await request.json();


        if (!username || !email || !password) {
            const error = { code: 'BAD_REQUEST', message: 'Tous les champs sont requis' };
            return new Response(JSON.stringify(error), {
                status: 400,
                headers: { 'content-type': 'application/json' },
            });
        }


        const hash = await crypto.subtle.digest('SHA-256', stringToArrayBuffer(username + password));
        const hashed64 = arrayBufferToBase64(hash);


        const client = await db.connect();


        const exists = await client.sql`
SELECT user_id FROM users WHERE username = ${username} OR email = ${email}`;

        if (exists.rowCount > 0) {
            const error = { code: 'CONFLICT', message: "Nom d'utilisateur ou email déjà utilisé" };
            return new Response(JSON.stringify(error), {
                status: 409,
                headers: { 'content-type': 'application/json' },
            });
        }


        const externalId = crypto.randomUUID().toString();

        const inserted = await client.sql`
      INSERT INTO users (username, password, email, created_on, last_login, external_id)
      VALUES (${username}, ${hashed64}, ${email}, NOW(), NULL, ${externalId})
      RETURNING user_id, username, email, external_id
    `;

        const row = inserted.rows[0];


        const token = crypto.randomUUID().toString();
        const user = {
            id: row.user_id,
            username: row.username,
            email: row.email,
            externalId: row.external_id,
        };


        await redis.set(token, user, { ex: 3600 });

        const userInfo = {};
        userInfo[user.id] = user;
        await redis.hset('users', userInfo);


        return new Response(
            JSON.stringify({
                token: token,
                username: user.username,
                externalId: user.externalId,
                id: user.id,
            }),
            {
                status: 201,
                headers: { 'content-type': 'application/json' },
            }
        );
    } catch (error) {
        console.log(error);

        const payload = error && error.code && error.message ? error : { code: 'SERVER_ERROR', message: 'Erreur serveur' };
        return new Response(JSON.stringify(payload), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }
}
