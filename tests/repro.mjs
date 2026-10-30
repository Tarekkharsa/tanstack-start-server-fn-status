import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = 7311;
const ORIGIN = `http://localhost:${PORT}`;
const ROUTES = ["/items/1", "/caught/1"];

const server = spawn("node_modules/.bin/vite", ["preview", "--port", String(PORT), "--strictPort"], { stdio: ["ignore", "pipe", "inherit"], detached: true });
console.log(`vite preview pid ${server.pid} (process group killed on exit)`);
await new Promise((resolve, reject) => {
  server.stdout.on("data", (chunk) => {
    if (String(chunk).includes(String(PORT))) resolve();
  });
  server.on("exit", (code) => reject(new Error(`preview exited with ${code}`)));
});

let failures = 0;
const browser = await chromium.launch();
try {
  console.log("SSR document requests (a route loader calls a server fn that sets 503):");
  for (const route of ROUTES) {
    const response = await fetch(`${ORIGIN}${route}`, { headers: { accept: "text/html" } });
    const html = await response.text();
    const rendered = html.includes("is unavailable right now");
    const ok = response.status === 200;
    if (!ok) failures++;
    console.log(
      `  ${ok ? "ok  " : "FAIL"} GET ${route} -> HTTP ${response.status} (expected 200); fallback rendered: ${rendered}`,
    );
  }

  console.log("Client navigation (the same server fn called as an RPC):");
  for (const [route, label] of [["/items/1", "Item 1"], ["/caught/1", "Caught 1"]]) {
    const page = await browser.newPage();
    await page.goto(`${ORIGIN}/`);
    await page.waitForFunction(() => {
      const link = document.querySelector('header a[href="/"]');
      return link !== null && Object.keys(link).some((key) => key.startsWith("__reactProps$"));
    });
    const rpc = page.waitForResponse((response) => response.url().includes("/_serverFn/"));
    await page.getByRole("link", { name: label }).click();
    const response = await rpc;
    await page.getByRole("heading", { name: "Item 1 is unavailable right now" }).waitFor();
    console.log(`  info ${route}: RPC ${new URL(response.url()).pathname.slice(0, 24)}... -> HTTP ${response.status()} (503 is intended here)`);
    await page.close();
  }
} finally {
  await browser.close();
  process.kill(-server.pid);
}

console.log(`\n${failures}/${ROUTES.length} documents answered with the server fn's status instead of 200`);
process.exit(failures > 0 ? 1 : 0);
