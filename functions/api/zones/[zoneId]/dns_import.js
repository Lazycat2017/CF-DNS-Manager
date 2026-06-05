export async function onRequestPost(context) {
    const { cfToken } = context.data;
    const { zoneId } = context.params;

    // Proxy the multipart form data request
    const contentType = context.request.headers.get('Content-Type');
    const headers = {
        'Authorization': `Bearer ${cfToken}`
    };
    if (contentType) {
        headers['Content-Type'] = contentType;
    }

    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/import`, {
        method: 'POST',
        headers,
        body: context.request.body
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
    });
}
