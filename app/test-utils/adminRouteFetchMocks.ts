import { vi } from "vitest";

type MockResponseInit = {
  status?: number;
  body?: unknown;
};

export const jsonResponse = ({ status = 200, body = {} }: MockResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const toUrl = (input: RequestInfo | URL) => {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
};

export const mockAdminAuthedFetch = (
  handler: (url: string, init: RequestInit | undefined) => Response | Promise<Response> | null,
) => {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const url = toUrl(input);

    if (url.includes("/auth/v1/user")) {
      return jsonResponse({ body: { id: "user_1" } });
    }

    if (url.includes("/rest/v1/app_admins")) {
      return jsonResponse({ body: [{ role: "admin" }] });
    }

    const response = await handler(url, init);
    if (response) {
      return response;
    }

    return jsonResponse({ status: 500, body: { error: "Unexpected fetch in test" } });
  });
};
