export type SessionFetchFn = (url: string, options?: RequestInit)=>Promise<{status:number, headers:object, body:string}>;

export async function StartSession(baseUrl: string, username: string, password: string): Promise<SessionFetchFn> {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: Buffer.from(`{"username": "${username}", "password": "${password}"}`)
  });
  expect(res.status).toBe(200);
  
  const cookie = res.headers.get("Set-Cookie");
  const correlationId = res.headers.get("App-Correlation-Id");

  return async (url: string, options?: RequestInit) => {
    console.log(cookie);
    const res = await fetch(`${baseUrl}${url}`, {
      ...(options ?? {}),
      headers: {
        ...(options?.headers ?? {}),
        "Cookie": cookie,
        "App-Correlation-Id": correlationId
      },
    });
    return {
      status: res.status,
      headers: res.headers,
      body: await res.text(),
    };
  };
}