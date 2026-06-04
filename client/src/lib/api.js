export async function apiPost(path, body) {
    const res = await fetch(path, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    });

    const data = await res.json().catch(() => ({}));

    if(!res.ok) {
        const err = new Error(data?.error || `Request failed with status ${res.status}`);
        err.status = res.status;
        err.body = data;
        throw err;
    }

    return data;
}