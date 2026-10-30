# A server fn's `setResponseStatus` replaces the SSR document's status

A minimal TanStack Start app. A route loader calls a server function that calls `setResponseStatus(503)` to tell its RPC caller the item service is down, and returns (or throws) a value the page can render. On a client navigation the RPC answers 503, as intended. On a full page load the loader runs the same fn in-process during SSR, the page renders its fallback, and the HTML document is sent as **503** instead of 200.

Works on `@tanstack/react-start` 1.168.60. Fails from 1.169.0 (`@tanstack/start-server-core` 1.169.41) onwards.

## Versions

| Package | Version |
| --- | --- |
| `@tanstack/react-start` | 1.169.4 |
| `@tanstack/start-server-core` | 1.169.45 |
| `@tanstack/start-client-core` | 1.170.39 |
| `@tanstack/react-router` | 1.170.46 |
| `@tanstack/router-core` | 1.171.39 |
| `react`, `react-dom` | 19.3.1 |
| `vite` | 8.3.5 |
| `@vitejs/plugin-react` | 6.1.2 |
| `playwright` | 1.64.1 |

## The app

- `src/items.ts`: `getItem` calls `setResponseStatus(503)` and returns `{ ok: false, id }`; `getItemOrThrow` calls `setResponseStatus(503)` and throws.
- `src/routes/items.$id.tsx`: the loader returns `getItem(...)` and the component renders "Item 1 is unavailable right now".
- `src/routes/caught.$id.tsx`: the loader catches `getItemOrThrow(...)` and renders the same fallback.
- `src/routes/__root.tsx`: links for client navigation.

## Run it

```sh
pnpm i
pnpm test
```

If Playwright has no Chromium yet: `pnpm exec playwright install chromium`.

`pnpm test` builds, starts `vite preview` on port 7311, fetches each document, then opens `/` in Chromium and clicks each link to record the RPC status. It exits 1 when a document is not 200.

## Expected

`GET /items/1` and `GET /caught/1` answer 200 with the fallback. The RPC on client navigation answers 503.

## Actual

```
SSR document requests (a route loader calls a server fn that sets 503):
  FAIL GET /items/1 -> HTTP 503 (expected 200); fallback rendered: true
  FAIL GET /caught/1 -> HTTP 503 (expected 200); fallback rendered: true
Client navigation (the same server fn called as an RPC):
  info /items/1: RPC /_serverFn/8804e69444d5c... -> HTTP 503 (503 is intended here)
  info /caught/1: RPC /_serverFn/5863b083327b3... -> HTTP 503 (503 is intended here)

2/2 documents answered with the server fn's status instead of 200
```
