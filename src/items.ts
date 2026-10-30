import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";

export type ItemResult = { ok: true; id: string; name: string } | { ok: false; id: string };

// Simulates an item service that is down. The fn tells its caller through
// the HTTP status, and still returns a body the UI can render.
export const getItem = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(({ data: id }): ItemResult => {
    setResponseStatus(503);
    return { ok: false, id };
  });

// Same outage, reported by throwing after setting the status.
export const getItemOrThrow = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(({ data: id }): ItemResult => {
    setResponseStatus(503);
    throw new Error(`item service unavailable (${id})`);
  });
