import { createFileRoute } from "@tanstack/react-router";

import { getItemOrThrow, type ItemResult } from "../items";

// The loader catches the server fn's error and renders a fallback.
export const Route = createFileRoute("/caught/$id")({
  loader: async ({ params }): Promise<ItemResult> => {
    try {
      return await getItemOrThrow({ data: params.id });
    } catch {
      return { ok: false, id: params.id };
    }
  },
  component: Item,
});

function Item() {
  const item = Route.useLoaderData();
  return <h1>{item.ok ? item.name : `Item ${item.id} is unavailable right now`}</h1>;
}
