import { createFileRoute } from "@tanstack/react-router";

import { getItem } from "../items";

// The loader gets a fallback value from the server fn and renders it.
export const Route = createFileRoute("/items/$id")({
  loader: ({ params }) => getItem({ data: params.id }),
  component: Item,
});

function Item() {
  const item = Route.useLoaderData();
  return <h1>{item.ok ? item.name : `Item ${item.id} is unavailable right now`}</h1>;
}
