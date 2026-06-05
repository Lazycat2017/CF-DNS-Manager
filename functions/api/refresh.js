import { SignJWT, jwtVerify } from 'jose';

export async function onRequestPost(context) {
    const { request, env } = context;
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const token = authHeader.substring(7);
    const serverSecret = env.APP_PASSWORD;

    if (!serverSecret) {
        return new Response(JSON.stringify({ error: 'Server is not configured.' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const secret = new TextEncoder().encode(serverSecret);
        const { payload } = await jwtVerify(token, secret);

        delete payload.exp;
        delete payload.iat;
        delete payload.nbf;

        const newJwt = await new SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(secret);

        return new Response(JSON.stringify({ token: newJwt }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid or expired session.', message: e.message }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
