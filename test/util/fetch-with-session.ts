export type SessionFetchFn = (
  url: string,
  options?: Omit<RequestInit, "body"> & { body?: Buffer | string | object },
) => Promise<{ status: number; headers: object; body: string }>;

export async function StartSession(
  baseUrl: string,
  username: string,
  password: string,
): Promise<SessionFetchFn> {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: Buffer.from(`{"username": "${username}", "password": "${password}"}`),
  });
  expect(res.status).toBe(200);

  const cookie = res.headers.get("Set-Cookie");
  const correlationId = res.headers.get("App-Correlation-Id");

  return async (
    url: string,
    options?: Omit<RequestInit, "body"> & { body?: Buffer | string | object },
  ) => {
    let body: Buffer | undefined = undefined;
    if (options?.body) {
      body =
        options.body instanceof Buffer
          ? options.body
          : typeof options.body === "string"
            ? Buffer.from(options.body)
            : Buffer.from(JSON.stringify(options.body));
      delete options.body;
    }

    const res = await fetch(`${baseUrl}${url}`, {
      ...(options ?? {}),
      body,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
        Cookie: cookie,
        "App-Correlation-Id": correlationId,
      },
    });
    return {
      status: res.status,
      headers: res.headers,
      body: await res.text(),
    };
  };
}
