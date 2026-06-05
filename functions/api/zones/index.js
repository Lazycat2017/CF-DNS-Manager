export async function onRequestGet(context) {
    const { cfToken } = context.data;

    let allZones = [];
    let page = 1;
    let totalPages = 1;

    try {
        do {
            const response = await fetch(`https://api.cloudflare.com/client/v4/zones?per_page=50&page=${page}`, {
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

            allZones = allZones.concat(data.result || []);
            totalPages = data.result_info?.total_pages || 1;
            page++;
        } while (page <= totalPages);

        return new Response(JSON.stringify({
            success: true,
            result: allZones,
            result_info: { count: allZones.length, total_count: allZones.length }
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
