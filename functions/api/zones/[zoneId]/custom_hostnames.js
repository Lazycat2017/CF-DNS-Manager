export async function onRequestGet(context) {
    const { cfToken } = context.data;
    const { zoneId } = context.params;

    let allHostnames = [];
    let page = 1;
    let totalPages = 1;

    try {
        do {
            const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames?per_page=100&page=${page}`, {
                headers: {
                    'Authorization': `Bearer ${cfToken}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (!data.success) {
                return new Response(JSON.stringify(data), {
                    status: response.status,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            allHostnames = allHostnames.concat(data.result || []);
            totalPages = data.result_info?.total_pages || 1;
            page++;
        } while (page <= totalPages);

        return new Response(JSON.stringify({
            success: true,
            result: allHostnames,
            result_info: { count: allHostnames.length, total_count: allHostnames.length }
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ success: false, errors: [{ message: e.message }] }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPost(context) {
    const { cfToken } = context.data;
    const { zoneId } = context.params;
    const body = await context.request.json();

    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${cfToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
    });
}

export async function onRequestDelete(context) {
    const { cfToken } = context.data;
    const { zoneId } = context.params;
    const url = new URL(context.request.url);
    const hostnameId = url.searchParams.get('id');

    if (!hostnameId) return new Response('Missing ID', { status: 400 });

    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames/${hostnameId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${cfToken}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
    });
}

export async function onRequestPatch(context) {
    const { cfToken } = context.data;
    const { zoneId } = context.params;
    const url = new URL(context.request.url);
    const hostnameId = url.searchParams.get('id');
    const body = await context.request.json();

    if (!hostnameId) return new Response('Missing ID', { status: 400 });

    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames/${hostnameId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${cfToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
    });
}
