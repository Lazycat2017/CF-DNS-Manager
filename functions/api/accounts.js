import { jwtVerify } from 'jose';

export async function onRequestGet(context) {
    const { env, request } = context;

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const serverSecret = env.APP_PASSWORD;
    if (!serverSecret) {
        return new Response(JSON.stringify({ error: 'Server is not configured.' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const secret = new TextEncoder().encode(serverSecret);
        await jwtVerify(authHeader.substring(7), secret);
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid or expired session.', message: e.message }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const accounts = [];
    if (env.CF_API_TOKEN) accounts.push({ id: 0, name: 'Default Account' });

    Object.keys(env).forEach(key => {
        const match = key.match(/^CF_API_TOKEN(\d+)$/);
        if (match) {
            accounts.push({ id: parseInt(match[1], 10), name: `Account ${match[1]}` });
        }
    });

    accounts.sort((a, b) => a.id - b.id);

    return new Response(JSON.stringify({ accounts }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
