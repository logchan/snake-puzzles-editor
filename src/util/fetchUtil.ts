export async function fetchData(url: string, method = "GET", data: any = null) {
  let resp;
  if (data === null) {
    resp = await fetch(url, { method: method });
  }
  else {
    resp = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }
  if (resp.status !== 200) {
    throw new Error("Error");
  }

  if (resp.headers.get("Content-Type")?.startsWith("application/json")) {
    return await resp.json();
  }
  else {
    return resp;
  }
}
