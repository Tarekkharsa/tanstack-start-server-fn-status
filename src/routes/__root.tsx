/// <reference types="vite/client" />
import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";

export const Route = createRootRoute({
  head: () => ({ meta: [{ charSet: "utf-8" }, { title: "server fn status repro" }] }),
  shellComponent: Shell,
  component: Root,
});

function Shell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function Root() {
  return (
    <>
      <header>
        <Link to="/">Home</Link> <Link to="/items/$id" params={{ id: "1" }}>Item 1</Link>{" "}
        <Link to="/caught/$id" params={{ id: "1" }}>Caught 1</Link>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
